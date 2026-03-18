'use client'

import { useState } from 'react'
import { EmailSequence } from '@/types'
import { Copy, Check, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import clsx from 'clsx'

interface ScriptCardProps {
  sequence: EmailSequence
  index: number
}

export default function ScriptCard({ sequence, index }: ScriptCardProps) {
  const [activeSubject, setActiveSubject] = useState(0)
  const [activeEmail, setActiveEmail] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const emails = [
    { label: 'Email 1', body: sequence.email1, ps: sequence.psLine1 },
    { label: 'Email 2 (Day 3)', body: sequence.email2, ps: sequence.psLine2 },
    { label: 'Email 3 (Day 7)', body: sequence.email3, ps: sequence.psLine3 },
  ]

  const confidenceColor =
    sequence.confidenceScore >= 80
      ? 'bg-success'
      : sequence.confidenceScore >= 60
        ? 'bg-warning'
        : 'bg-red-500'

  const confidenceTextColor =
    sequence.confidenceScore >= 80
      ? 'text-success'
      : sequence.confidenceScore >= 60
        ? 'text-warning'
        : 'text-red-500'

  const copySequence = async () => {
    const text = emails
      .map(
        (e) =>
          `--- ${e.label} ---\nSubject: ${sequence.subjectLineVariants[activeSubject]}\n\n${e.body}\n\nPS: ${e.ps}`
      )
      .join('\n\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden hover:shadow-card transition-all duration-300">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-accent font-heading text-xl font-bold">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className="text-text-primary font-heading text-base">
                {sequence.sequenceName}
              </h3>
              <p className="text-text-muted text-xs mt-0.5">
                {sequence.targetAngle}
              </p>
            </div>
          </div>
          <button
            onClick={copySequence}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-secondary hover:text-accent bg-bg rounded-badge transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Confidence bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className={clsx('h-full rounded-full transition-all', confidenceColor)}
              style={{ width: `${sequence.confidenceScore}%` }}
            />
          </div>
          <span className={clsx('text-xs font-medium', confidenceTextColor)}>
            {sequence.confidenceScore}/100
          </span>
        </div>

        {/* Cadence pill */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-3.5 h-3.5 text-text-muted" />
          <div className="flex gap-1.5">
            {['Day 1', 'Day 3', 'Day 7'].map((day, i) => (
              <span
                key={day}
                className={clsx(
                  'px-2 py-0.5 rounded-badge text-[10px] font-medium',
                  i === activeEmail
                    ? 'bg-accent/20 text-accent'
                    : 'bg-bg text-text-muted'
                )}
              >
                {day}
              </span>
            ))}
          </div>
          <span className="text-text-muted text-[10px] ml-auto">
            {sequence.recommendedSendTime}
          </span>
        </div>

        {/* Subject lines */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">
            Subject Lines
          </p>
          <div className="flex gap-1">
            {sequence.subjectLineVariants.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSubject(i)}
                className={clsx(
                  'px-2.5 py-1 rounded-badge text-[11px] transition-colors',
                  i === activeSubject
                    ? 'bg-accent/20 text-accent'
                    : 'bg-bg text-text-muted hover:text-text-secondary'
                )}
              >
                Variant {i + 1}
              </button>
            ))}
          </div>
          <p className="text-text-primary text-sm mt-2 font-medium">
            {sequence.subjectLineVariants[activeSubject]}
          </p>
        </div>

        {/* Email tabs */}
        <div className="flex gap-1 mb-3">
          {emails.map((e, i) => (
            <button
              key={i}
              onClick={() => setActiveEmail(i)}
              className={clsx(
                'flex-1 py-2 text-xs rounded-badge transition-colors',
                i === activeEmail
                  ? 'bg-accent text-white'
                  : 'bg-bg text-text-muted hover:text-text-secondary'
              )}
            >
              {e.label}
            </button>
          ))}
        </div>

        {/* Active email body */}
        <div className="bg-bg rounded-input p-4 mb-3">
          <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
            {emails[activeEmail].body}
          </p>
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-text-secondary text-xs italic">
              PS: {emails[activeEmail].ps}
            </p>
          </div>
        </div>

        {/* Expand for personalisation */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-text-muted text-xs hover:text-text-secondary transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
          Personalisation Tip
        </button>
        {expanded && (
          <p className="text-text-secondary text-xs mt-2 pl-5 border-l-2 border-accent/30">
            {sequence.personalisationTip}
          </p>
        )}
      </div>
    </div>
  )
}
