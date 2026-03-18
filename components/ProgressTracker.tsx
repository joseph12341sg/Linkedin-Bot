'use client'

import { AgentStage, STAGE_LABELS } from '@/types'
import { CheckCircle2, Loader2, Circle } from 'lucide-react'
import clsx from 'clsx'

interface StageState {
  status: 'pending' | 'active' | 'complete'
  preview?: string
}

interface ProgressTrackerProps {
  stages: Record<AgentStage, StageState>
  error?: string | null
  onRetry?: () => void
}

const STAGE_ORDER: AgentStage[] = [
  'parsing',
  'researching',
  'building-icp',
  'analyzing-competitors',
  'generating-emails',
  'compiling-report',
]

const STAGE_ICONS: Record<AgentStage, string> = {
  parsing: '✦',
  researching: '✦',
  'building-icp': '✦',
  'analyzing-competitors': '✦',
  'generating-emails': '✦',
  'compiling-report': '✦',
}

export default function ProgressTracker({
  stages,
  error,
  onRetry,
}: ProgressTrackerProps) {
  const completedCount = STAGE_ORDER.filter(
    (s) => stages[s]?.status === 'complete'
  ).length
  const progress = (completedCount / STAGE_ORDER.length) * 100

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="font-heading text-3xl text-text-primary mb-2">
          Agent Running
        </h2>
        <p className="text-text-secondary">
          Researching, analysing, and crafting your sequences
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-10">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-text-muted text-xs mt-2 text-right">
          {completedCount}/{STAGE_ORDER.length} stages complete
        </p>
      </div>

      {/* Stage list */}
      <div className="space-y-1">
        {STAGE_ORDER.map((stage) => {
          const state = stages[stage] || { status: 'pending' }
          return (
            <div
              key={stage}
              className={clsx(
                'flex items-start gap-3 p-4 rounded-card transition-all duration-300',
                state.status === 'active' && 'bg-surface border border-accent/20',
                state.status === 'complete' && 'bg-surface/50',
                state.status === 'pending' && 'opacity-50'
              )}
            >
              <div className="mt-0.5 flex-shrink-0">
                {state.status === 'complete' && (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                )}
                {state.status === 'active' && (
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                )}
                {state.status === 'pending' && (
                  <Circle className="w-5 h-5 text-text-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-sm">
                    {STAGE_ICONS[stage]}
                  </span>
                  <span
                    className={clsx(
                      'text-sm font-medium',
                      state.status === 'complete' && 'text-success',
                      state.status === 'active' && 'text-text-primary',
                      state.status === 'pending' && 'text-text-muted'
                    )}
                  >
                    {STAGE_LABELS[stage]}
                  </span>
                  {state.status === 'active' && (
                    <span className="inline-flex">
                      <span className="w-1 h-1 bg-accent rounded-full animate-pulse" />
                      <span className="w-1 h-1 bg-accent rounded-full animate-pulse ml-1 [animation-delay:0.2s]" />
                      <span className="w-1 h-1 bg-accent rounded-full animate-pulse ml-1 [animation-delay:0.4s]" />
                    </span>
                  )}
                </div>
                {state.preview && state.status === 'active' && (
                  <p className="text-text-muted text-xs mt-1.5 truncate">
                    {state.preview}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-card p-4">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm rounded-input transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  )
}
