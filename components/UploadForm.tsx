'use client'

import { useState, useRef, useCallback } from 'react'
import { ClientProfile, InputMode } from '@/types'
import {
  Upload,
  FileText,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react'
import clsx from 'clsx'

interface UploadFormProps {
  onSubmit: (data: {
    inputMode: InputMode
    pdfText?: string
    formData: Partial<ClientProfile>
  }) => void
}

const TONE_OPTIONS = [
  'Professional',
  'Casual',
  'Authoritative',
  'Friendly',
]

export default function UploadForm({ onSubmit }: UploadFormProps) {
  const [inputMode, setInputMode] = useState<InputMode>('manual')
  const [pdfText, setPdfText] = useState('')
  const [pdfFilename, setPdfFilename] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [whatTheyDo, setWhatTheyDo] = useState('')
  const [icp, setIcp] = useState('')
  const [offer, setOffer] = useState('')
  const [competitors, setCompetitors] = useState('')
  const [tonePreference, setTonePreference] = useState('Professional')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [slackChannel, setSlackChannel] = useState(
    process.env.NEXT_PUBLIC_SLACK_CHANNEL_ID || ''
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handlePdfUpload = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file')
      return
    }

    setUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setPdfText(result.text)
      setPdfFilename(result.filename)
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to upload PDF'
      )
    } finally {
      setUploading(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handlePdfUpload(file)
    },
    [handlePdfUpload]
  )

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (inputMode === 'pdf' && !pdfText) {
      newErrors.pdf = 'Please upload a PDF file first'
    }

    if (inputMode === 'manual') {
      if (!companyName.trim()) newErrors.companyName = 'Required'
      if (!industry.trim()) newErrors.industry = 'Required'
      if (!whatTheyDo.trim()) newErrors.whatTheyDo = 'Required'
      if (!icp.trim()) newErrors.icp = 'Required'
      if (!offer.trim()) newErrors.offer = 'Required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    onSubmit({
      inputMode,
      pdfText: inputMode === 'pdf' ? pdfText : undefined,
      formData: {
        companyName,
        industry,
        whatTheyDo,
        icp,
        offer,
        competitors: competitors
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean) as unknown as string[],
        tonePreference,
        additionalNotes,
        slackChannel,
      },
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl md:text-5xl text-text-primary mb-3">
          Cold Email Agent
        </h1>
        <p className="text-text-secondary text-lg">
          AI-powered research & email sequence generation
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-surface rounded-card p-1 mb-8 border border-border">
        <button
          onClick={() => setInputMode('pdf')}
          className={clsx(
            'flex-1 py-3 px-4 rounded-[10px] text-sm font-medium transition-all duration-200',
            inputMode === 'pdf'
              ? 'bg-accent text-white shadow-md'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <Upload className="inline-block w-4 h-4 mr-2 -mt-0.5" />
          PDF Upload
        </button>
        <button
          onClick={() => setInputMode('manual')}
          className={clsx(
            'flex-1 py-3 px-4 rounded-[10px] text-sm font-medium transition-all duration-200',
            inputMode === 'manual'
              ? 'bg-accent text-white shadow-md'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <FileText className="inline-block w-4 h-4 mr-2 -mt-0.5" />
          Manual Input
        </button>
      </div>

      {/* PDF Upload Zone */}
      {inputMode === 'pdf' && (
        <div className="mb-8">
          {!pdfText ? (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                'border-2 border-dashed rounded-card p-12 text-center cursor-pointer transition-all duration-200',
                dragOver
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-text-muted',
                uploading && 'opacity-50 pointer-events-none'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handlePdfUpload(file)
                }}
              />
              <Upload className="w-10 h-10 text-text-muted mx-auto mb-4" />
              <p className="text-text-primary font-medium mb-1">
                {uploading
                  ? 'Processing PDF...'
                  : 'Drop your onboarding PDF here'}
              </p>
              <p className="text-text-muted text-sm">
                or click to browse (max 10MB)
              </p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-card p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-medium text-sm truncate">
                  {pdfFilename}
                </p>
                <p className="text-text-muted text-xs">
                  {pdfText.length} characters extracted
                </p>
              </div>
              <button
                onClick={() => {
                  setPdfText('')
                  setPdfFilename('')
                }}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {uploadError && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {uploadError}
            </p>
          )}
          {errors.pdf && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.pdf}
            </p>
          )}
        </div>
      )}

      {/* Manual Form */}
      {inputMode === 'manual' && (
        <div className="space-y-5 mb-8">
          <FormField
            label="Company Name"
            required
            error={errors.companyName}
          >
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="form-input"
            />
          </FormField>

          <FormField
            label="Industry / Niche"
            required
            error={errors.industry}
          >
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Accounting, Dental, SaaS"
              className="form-input"
            />
          </FormField>

          <FormField
            label="What They Do"
            required
            error={errors.whatTheyDo}
          >
            <textarea
              value={whatTheyDo}
              onChange={(e) => setWhatTheyDo(e.target.value)}
              placeholder="Describe the company in 2-3 sentences..."
              rows={3}
              className="form-input resize-none"
            />
          </FormField>

          <FormField
            label="Ideal Client Profile"
            required
            error={errors.icp}
          >
            <textarea
              value={icp}
              onChange={(e) => setIcp(e.target.value)}
              placeholder="Who are they targeting? Job title, company size, geography..."
              rows={3}
              className="form-input resize-none"
            />
          </FormField>

          <FormField
            label="Main Offer / USP"
            required
            error={errors.offer}
          >
            <textarea
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="What are they selling or what result do they deliver?"
              rows={3}
              className="form-input resize-none"
            />
          </FormField>

          <FormField label="Competitors" hint="Optional — comma separated">
            <input
              type="text"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              placeholder="e.g. CompetitorA, CompetitorB, CompetitorC"
              className="form-input"
            />
          </FormField>

          <FormField label="Tone Preference">
            <select
              value={tonePreference}
              onChange={(e) => setTonePreference(e.target.value)}
              className="form-input"
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Additional Context" hint="Optional">
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any extra context or notes for the agent..."
              rows={2}
              className="form-input resize-none"
            />
          </FormField>

          <FormField label="Slack Channel ID" hint="Pre-filled from env">
            <input
              type="text"
              value={slackChannel}
              onChange={(e) => setSlackChannel(e.target.value)}
              placeholder="e.g. C0123456789"
              className="form-input"
            />
          </FormField>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-medium text-lg rounded-card transition-all duration-200 flex items-center justify-center gap-2 group shimmer-btn"
      >
        Run Agent
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  )
}

function FormField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
        {hint && (
          <span className="text-text-muted font-normal ml-2">{hint}</span>
        )}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  )
}
