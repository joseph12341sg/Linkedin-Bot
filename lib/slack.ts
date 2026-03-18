import { WebClient } from '@slack/web-api'
import { FullReport } from '@/types'

function getSlackClient(): WebClient {
  const token = process.env.SLACK_BOT_TOKEN
  if (!token) throw new Error('SLACK_BOT_TOKEN not configured')
  return new WebClient(token)
}

export function formatSlackBlocks(report: FullReport) {
  const { clientProfile, researchBrief, emailSequences, timestamp } = report

  const researchBullets = researchBrief.summary
    .split('\n')
    .filter((l) => l.trim())
    .slice(0, 4)
    .map((l) => `• ${l.trim()}`)
    .join('\n')

  const icpBullets = researchBrief.icpDeepDive
    .split('\n')
    .filter((l) => l.trim())
    .slice(0, 3)
    .map((l) => `• ${l.trim()}`)
    .join('\n')

  const blocks: object[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🎯 New Cold Email Report Generated',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Client:* ${clientProfile.companyName} | *Industry:* ${clientProfile.industry}\n*Generated:* ${new Date(timestamp).toLocaleString()}`,
      },
    },
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📊 *RESEARCH BRIEF*\n${researchBullets}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `👤 *ICP PROFILE*\n${icpBullets}`,
      },
    },
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '✉️ *EMAIL SEQUENCES (6 generated)*',
      },
    },
  ]

  emailSequences.forEach((seq, i) => {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${i + 1}. ${seq.sequenceName}* — Confidence: ${seq.confidenceScore}/100\nSubject: ${seq.subjectLineVariants[0]}\n\n${seq.email1}\n\n_PS: ${seq.psLine1}_`,
      },
    })
    if (i < emailSequences.length - 1) {
      blocks.push({ type: 'divider' })
    }
  })

  blocks.push(
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '📥 Full PDF report attached below.',
      },
    }
  )

  return blocks
}

export async function sendToSlack(
  report: FullReport,
  channelId?: string,
  pdfBuffer?: Buffer
): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = getSlackClient()
    const channel = channelId || process.env.SLACK_CHANNEL_ID
    if (!channel) throw new Error('No Slack channel configured')

    const blocks = formatSlackBlocks(report)

    await client.chat.postMessage({
      channel,
      text: `🎯 New Cold Email Report: ${report.clientProfile.companyName}`,
      blocks: blocks as never[],
    })

    if (pdfBuffer) {
      await client.files.uploadV2({
        channel_id: channel,
        file: pdfBuffer,
        filename: `${report.clientProfile.companyName.replace(/\s+/g, '_')}_Cold_Email_Report.pdf`,
        title: `Cold Email Report - ${report.clientProfile.companyName}`,
        initial_comment: `📄 Full report for ${report.clientProfile.companyName}`,
      })
    }

    return { ok: true }
  } catch (error) {
    console.error('Slack send error:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown Slack error',
    }
  }
}
