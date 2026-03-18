'use client'

import { useState, useCallback, useRef } from 'react'
import {
  ViewState,
  FullReport,
  AgentStage,
  InputMode,
  ClientProfile,
} from '@/types'
import UploadForm from '@/components/UploadForm'
import ProgressTracker from '@/components/ProgressTracker'
import ResultsPanel from '@/components/ResultsPanel'

interface StageState {
  status: 'pending' | 'active' | 'complete'
  preview?: string
}

const INITIAL_STAGES: Record<AgentStage, StageState> = {
  parsing: { status: 'pending' },
  researching: { status: 'pending' },
  'building-icp': { status: 'pending' },
  'analyzing-competitors': { status: 'pending' },
  'generating-emails': { status: 'pending' },
  'compiling-report': { status: 'pending' },
}

export default function Home() {
  const [view, setView] = useState<ViewState>('input')
  const [stages, setStages] = useState<Record<AgentStage, StageState>>({
    ...INITIAL_STAGES,
  })
  const [report, setReport] = useState<FullReport | null>(null)
  const [slackResult, setSlackResult] = useState<{
    ok: boolean
    error?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)
  const lastSubmission = useRef<{
    inputMode: InputMode
    pdfText?: string
    formData: Partial<ClientProfile>
  } | null>(null)

  const runAgent = useCallback(
    async (data: {
      inputMode: InputMode
      pdfText?: string
      formData: Partial<ClientProfile>
    }) => {
      lastSubmission.current = data
      setView('progress')
      setStages({ ...INITIAL_STAGES })
      setError(null)
      setReport(null)
      setSlackResult(null)

      try {
        const body: Record<string, unknown> = {
          inputMode: data.inputMode,
          pdfText: data.pdfText,
          slackChannel: data.formData.slackChannel,
        }

        if (data.inputMode === 'manual') {
          Object.assign(body, {
            companyName: data.formData.companyName,
            industry: data.formData.industry,
            whatTheyDo: data.formData.whatTheyDo,
            icp: data.formData.icp,
            offer: data.formData.offer,
            competitors: Array.isArray(data.formData.competitors)
              ? (data.formData.competitors as string[]).join(', ')
              : data.formData.competitors,
            tonePreference: data.formData.tonePreference,
            additionalNotes: data.formData.additionalNotes,
          })
        }

        const response = await fetch('/api/run-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response stream')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event = JSON.parse(line.slice(6))

                if (event.type === 'stage-update') {
                  const { stage, status, preview } = event.data
                  setStages((prev) => ({
                    ...prev,
                    [stage as AgentStage]: {
                      status: status as 'active' | 'complete',
                      preview,
                    },
                  }))
                } else if (event.type === 'stage-preview') {
                  const { stage, preview } = event.data
                  setStages((prev) => ({
                    ...prev,
                    [stage as AgentStage]: {
                      ...prev[stage as AgentStage],
                      preview,
                    },
                  }))
                } else if (event.type === 'complete') {
                  setReport(event.data.report)
                  setSlackResult(event.data.slackResult)
                  if (event.data.demoMode) setDemoMode(true)
                  setView('results')
                } else if (event.type === 'error') {
                  setError(event.data.error)
                }
              } catch {
                // Skip malformed SSE lines
              }
            }
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred'
        )
      }
    },
    []
  )

  const handleRetry = useCallback(() => {
    if (lastSubmission.current) {
      runAgent(lastSubmission.current)
    }
  }, [runAgent])

  const handleReset = useCallback(() => {
    setView('input')
    setStages({ ...INITIAL_STAGES })
    setReport(null)
    setSlackResult(null)
    setError(null)
  }, [])

  return (
    <>
      {demoMode && view !== 'input' && (
        <div className="max-w-5xl mx-auto mb-6 bg-accent/10 border border-accent/20 rounded-card px-4 py-3 text-accent text-sm text-center animate-fade-in">
          Demo Mode — Using mock data. Set <code className="bg-accent/10 px-1.5 py-0.5 rounded text-xs">ANTHROPIC_API_KEY</code> in <code className="bg-accent/10 px-1.5 py-0.5 rounded text-xs">.env.local</code> for live AI research.
        </div>
      )}

      {view === 'input' && (
        <div className="animate-fade-in">
          <UploadForm onSubmit={runAgent} />
        </div>
      )}

      {view === 'progress' && (
        <div className="animate-fade-in">
          <ProgressTracker
            stages={stages}
            error={error}
            onRetry={handleRetry}
          />
        </div>
      )}

      {view === 'results' && report && (
        <div className="animate-slide-up">
          <ResultsPanel
            report={report}
            slackResult={slackResult || undefined}
            onReset={handleReset}
          />
        </div>
      )}
    </>
  )
}
