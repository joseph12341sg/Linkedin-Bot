'use client'

import { useState } from 'react'
import { FullReport } from '@/types'
import ScriptCard from './ScriptCard'
import ResearchBrief from './ResearchBrief'
import {
  Download,
  Copy,
  Send,
  Check,
  ArrowLeft,
  Calendar,
  Clock,
} from 'lucide-react'
import clsx from 'clsx'

interface ResultsPanelProps {
  report: FullReport
  slackResult?: { ok: boolean; error?: string }
  onReset: () => void
}

export default function ResultsPanel({
  report,
  slackResult,
  onReset,
}: ResultsPanelProps) {
  const [exporting, setExporting] = useState(false)
  const [allCopied, setAllCopied] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendResult, setResendResult] = useState<{
    ok: boolean
    error?: string
  } | null>(null)

  const { clientProfile, emailSequences, timestamp } = report

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      })

      if (!response.ok) throw new Error('PDF export failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${clientProfile.companyName.replace(/\s+/g, '_')}_Cold_Email_Report.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      setExporting(false)
    }
  }

  const handleCopyAll = async () => {
    const text = emailSequences
      .map(
        (seq, i) =>
          `=== ${i + 1}. ${seq.sequenceName} (${seq.confidenceScore}/100) ===\nAngle: ${seq.targetAngle}\nSubject: ${seq.subjectLineVariants[0]}\n\n--- Email 1 ---\n${seq.email1}\nPS: ${seq.psLine1}\n\n--- Email 2 (Day 3) ---\n${seq.email2}\nPS: ${seq.psLine2}\n\n--- Email 3 (Day 7) ---\n${seq.email3}\nPS: ${seq.psLine3}\n\nSend Time: ${seq.recommendedSendTime}\nPersonalisation: ${seq.personalisationTip}`
      )
      .join('\n\n' + '='.repeat(50) + '\n\n')

    await navigator.clipboard.writeText(text)
    setAllCopied(true)
    setTimeout(() => setAllCopied(false), 2000)
  }

  const handleResendSlack = async () => {
    setResending(true)
    setResendResult(null)
    try {
      const response = await fetch('/api/run-agent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend-slack',
          report,
        }),
      })
      const result = await response.json()
      setResendResult(result)
    } catch {
      setResendResult({ ok: false, error: 'Failed to resend' })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            New Report
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl md:text-3xl text-text-primary">
              {clientProfile.companyName}
            </h1>
            <span className="px-3 py-1 rounded-badge bg-accent/10 text-accent text-xs font-medium">
              {clientProfile.industry}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-text-muted text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(timestamp).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm rounded-input transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-text-primary text-sm rounded-input hover:border-text-muted transition-colors"
          >
            {allCopied ? (
              <>
                <Check className="w-4 h-4 text-success" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy All
              </>
            )}
          </button>
          <button
            onClick={handleResendSlack}
            disabled={resending}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-text-primary text-sm rounded-input hover:border-text-muted transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {resending ? 'Sending...' : 'Slack'}
          </button>
        </div>
      </div>

      {/* Slack status */}
      {slackResult && !slackResult.ok && (
        <div className="mb-6 bg-warning/10 border border-warning/20 rounded-card p-3 text-warning text-sm">
          Slack delivery failed: {slackResult.error}. Results are still available
          below.
        </div>
      )}
      {resendResult && (
        <div
          className={clsx(
            'mb-6 rounded-card p-3 text-sm',
            resendResult.ok
              ? 'bg-success/10 border border-success/20 text-success'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          )}
        >
          {resendResult.ok
            ? 'Report sent to Slack successfully!'
            : `Failed: ${resendResult.error}`}
        </div>
      )}

      {/* Research Brief */}
      <div className="mb-8">
        <ResearchBrief research={report.researchBrief} />
      </div>

      {/* Email Sequences */}
      <div className="mb-8">
        <h2 className="font-heading text-xl text-text-primary mb-5">
          Email Sequences
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {emailSequences.map((seq, i) => (
            <ScriptCard key={i} sequence={seq} index={i} />
          ))}
        </div>
      </div>

      {/* Cadence Summary */}
      <div className="bg-surface border border-border rounded-card p-6">
        <h3 className="font-heading text-lg text-text-primary mb-4">
          Cadence Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-text-muted font-medium">
                  #
                </th>
                <th className="text-left py-3 px-2 text-text-muted font-medium">
                  Sequence
                </th>
                <th className="text-left py-3 px-2 text-text-muted font-medium">
                  Angle
                </th>
                <th className="text-left py-3 px-2 text-text-muted font-medium">
                  Confidence
                </th>
                <th className="text-left py-3 px-2 text-text-muted font-medium">
                  Send Time
                </th>
              </tr>
            </thead>
            <tbody>
              {emailSequences.map((seq, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 px-2 text-accent font-heading">
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td className="py-3 px-2 text-text-primary">
                    {seq.sequenceName}
                  </td>
                  <td className="py-3 px-2 text-text-secondary text-xs">
                    {seq.targetAngle}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full',
                            seq.confidenceScore >= 80
                              ? 'bg-success'
                              : seq.confidenceScore >= 60
                                ? 'bg-warning'
                                : 'bg-red-500'
                          )}
                          style={{ width: `${seq.confidenceScore}%` }}
                        />
                      </div>
                      <span className="text-text-muted text-xs">
                        {seq.confidenceScore}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-text-muted text-xs">
                    {seq.recommendedSendTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
