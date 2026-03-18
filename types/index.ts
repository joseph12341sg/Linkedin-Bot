export interface ClientProfile {
  companyName: string
  industry: string
  whatTheyDo: string
  icp: string
  offer: string
  competitors: string[]
  tonePreference: string
  additionalNotes: string
  slackChannel: string
}

export interface ResearchBrief {
  industryTrends: string
  icpDeepDive: string
  competitorLandscape: string
  hookIntelligence: string
  summary: string
}

export interface EmailSequence {
  sequenceName: string
  targetAngle: string
  confidenceScore: number
  subjectLineVariants: string[]
  email1: string
  email2: string
  email3: string
  psLine1: string
  psLine2: string
  psLine3: string
  recommendedSendTime: string
  personalisationTip: string
}

export interface FullReport {
  clientProfile: ClientProfile
  researchBrief: ResearchBrief
  emailSequences: EmailSequence[]
  runId: string
  timestamp: string
}

export type AgentStage =
  | 'parsing'
  | 'researching'
  | 'building-icp'
  | 'analyzing-competitors'
  | 'generating-emails'
  | 'compiling-report'

export interface StageUpdate {
  stage: AgentStage
  status: 'pending' | 'active' | 'complete'
  preview?: string
}

export interface SSEEvent {
  type: 'stage-update' | 'stage-preview' | 'complete' | 'error'
  data: {
    stage?: AgentStage
    status?: 'pending' | 'active' | 'complete'
    preview?: string
    report?: FullReport
    error?: string
  }
}

export type ViewState = 'input' | 'progress' | 'results'

export type InputMode = 'pdf' | 'manual'

export const STAGE_LABELS: Record<AgentStage, string> = {
  parsing: 'Parsing onboarding data',
  researching: 'Researching industry & trends',
  'building-icp': 'Building ICP profile',
  'analyzing-competitors': 'Analysing competitor positioning',
  'generating-emails': 'Generating email sequences',
  'compiling-report': 'Compiling report & sending to Slack',
}
