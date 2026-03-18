import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import {
  parseAndStructureInput,
  runDeepResearch,
  generateEmailSequences,
} from '@/lib/anthropic'
import { sendToSlack } from '@/lib/slack'
import { generatePDFBuffer } from '@/lib/pdf-export'
import { ClientProfile, FullReport, AgentStage } from '@/types'

export const maxDuration = 120

function createSSEMessage(
  type: string,
  data: Record<string, unknown>
): string {
  return `data: ${JSON.stringify({ type, data })}\n\n`
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  const body = await request.json()
  const {
    inputMode,
    pdfText,
    companyName,
    industry,
    whatTheyDo,
    icp,
    offer,
    competitors,
    tonePreference,
    additionalNotes,
    slackChannel,
  } = body

  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(createSSEMessage(type, data)))
        } catch {
          // Stream may have been closed
        }
      }

      const updateStage = (
        stage: AgentStage,
        status: 'active' | 'complete',
        preview?: string
      ) => {
        send('stage-update', { stage, status, preview })
      }

      try {
        const runId = uuidv4()
        const timestamp = new Date().toISOString()

        // Stage 1: Parse input
        updateStage('parsing', 'active', 'Processing onboarding data...')

        let profile: ClientProfile

        if (inputMode === 'pdf' && pdfText) {
          profile = await parseAndStructureInput(pdfText, (_, preview) => {
            send('stage-preview', { stage: 'parsing', preview })
          })
          profile.slackChannel = slackChannel || process.env.SLACK_CHANNEL_ID || ''
        } else {
          profile = {
            companyName: companyName || '',
            industry: industry || '',
            whatTheyDo: whatTheyDo || '',
            icp: icp || '',
            offer: offer || '',
            competitors: competitors
              ? competitors
                  .split(',')
                  .map((c: string) => c.trim())
                  .filter(Boolean)
              : [],
            tonePreference: tonePreference || 'Professional',
            additionalNotes: additionalNotes || '',
            slackChannel: slackChannel || process.env.SLACK_CHANNEL_ID || '',
          }
        }

        updateStage('parsing', 'complete', 'Onboarding data structured')

        // Stage 2: Deep Research
        updateStage(
          'researching',
          'active',
          'Launching deep industry research...'
        )

        const research = await runDeepResearch(profile, (_, preview) => {
          send('stage-preview', { stage: 'researching', preview })
        })

        updateStage('researching', 'complete', 'Research complete')

        // Stage 3: Build ICP
        updateStage(
          'building-icp',
          'active',
          'Synthesising ICP profile from research...'
        )
        // ICP is built as part of research; mark complete
        updateStage('building-icp', 'complete', 'ICP profile built')

        // Stage 4: Competitor analysis
        updateStage(
          'analyzing-competitors',
          'active',
          'Mapping competitor positioning...'
        )
        // Competitor analysis is part of research stage
        updateStage(
          'analyzing-competitors',
          'complete',
          'Competitor analysis complete'
        )

        // Stage 5: Generate emails
        updateStage(
          'generating-emails',
          'active',
          'Crafting 6 bespoke email sequences...'
        )

        const sequences = await generateEmailSequences(
          profile,
          research,
          (_, preview) => {
            send('stage-preview', { stage: 'generating-emails', preview })
          }
        )

        updateStage(
          'generating-emails',
          'complete',
          `${sequences.length} sequences generated`
        )

        // Stage 6: Compile and send
        updateStage(
          'compiling-report',
          'active',
          'Compiling report and sending to Slack...'
        )

        const report: FullReport = {
          clientProfile: profile,
          researchBrief: research,
          emailSequences: sequences,
          runId,
          timestamp,
        }

        // Generate PDF
        let pdfBuffer: Buffer | undefined
        try {
          pdfBuffer = await generatePDFBuffer(report)
        } catch (err) {
          console.error('PDF generation failed:', err)
        }

        // Send to Slack
        let slackResult: { ok: boolean; error?: string } = { ok: false, error: 'Skipped' }
        try {
          slackResult = await sendToSlack(
            report,
            profile.slackChannel || undefined,
            pdfBuffer
          )
        } catch (err) {
          console.error('Slack send failed:', err)
          slackResult = {
            ok: false,
            error: err instanceof Error ? err.message : 'Slack send failed',
          }
        }

        updateStage('compiling-report', 'complete', 'Report compiled')

        // Send complete event with full report
        send('complete', {
          report,
          slackResult,
          hasPdf: !!pdfBuffer,
        })

        controller.close()
      } catch (error) {
        console.error('Agent pipeline error:', error)
        send('error', {
          error:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
