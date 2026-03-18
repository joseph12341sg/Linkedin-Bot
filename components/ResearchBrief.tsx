'use client'

import { useState } from 'react'
import { ResearchBrief as ResearchBriefType } from '@/types'
import { ChevronDown, ChevronUp, Search, Users, Target, Zap } from 'lucide-react'
import clsx from 'clsx'

interface ResearchBriefProps {
  research: ResearchBriefType
}

interface Section {
  key: keyof Omit<ResearchBriefType, 'summary'>
  label: string
  icon: React.ReactNode
}

const SECTIONS: Section[] = [
  {
    key: 'industryTrends',
    label: 'Industry Trends & Pain Points',
    icon: <Search className="w-4 h-4" />,
  },
  {
    key: 'icpDeepDive',
    label: 'ICP Deep Dive',
    icon: <Users className="w-4 h-4" />,
  },
  {
    key: 'competitorLandscape',
    label: 'Competitor Landscape',
    icon: <Target className="w-4 h-4" />,
  },
  {
    key: 'hookIntelligence',
    label: 'Hook Intelligence',
    icon: <Zap className="w-4 h-4" />,
  },
]

export default function ResearchBrief({ research }: ResearchBriefProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  )

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <div className="bg-surface border border-border rounded-card p-6">
      <h3 className="font-heading text-lg text-text-primary mb-4">
        Research Brief
      </h3>

      {/* Summary */}
      {research.summary && (
        <div className="bg-bg rounded-input p-4 mb-5 border-l-2 border-accent">
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
            {research.summary}
          </p>
        </div>
      )}

      {/* Expandable sections */}
      <div className="space-y-2">
        {SECTIONS.map((section) => {
          const isExpanded = expandedSections.has(section.key)
          const content = research[section.key]
          if (!content) return null

          return (
            <div key={section.key}>
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center gap-3 p-3 rounded-input bg-bg hover:bg-bg/80 transition-colors text-left"
              >
                <span className="text-accent">{section.icon}</span>
                <span className="text-text-primary text-sm font-medium flex-1">
                  {section.label}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                )}
              </button>
              <div
                className={clsx(
                  'overflow-hidden transition-all duration-300',
                  isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <div className="p-4 text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                  {content}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
