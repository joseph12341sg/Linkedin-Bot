import Anthropic from '@anthropic-ai/sdk'
import { ClientProfile, ResearchBrief, EmailSequence } from '@/types'

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

type StageCallback = (stage: string, preview?: string) => void

export async function parseAndStructureInput(
  rawText: string,
  onUpdate?: StageCallback
): Promise<ClientProfile> {
  const client = getClient()

  onUpdate?.('parsing', 'Extracting structured data from input...')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `Extract and structure the following onboarding information into a clean JSON object. If any fields are missing, make reasonable inferences based on context or leave as empty string.

Return ONLY valid JSON matching this schema:
{
  "companyName": string,
  "industry": string,
  "whatTheyDo": string,
  "icp": string,
  "offer": string,
  "competitors": string[],
  "tonePreference": string,
  "additionalNotes": string
}

Input text:
${rawText}`,
      },
    ],
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    const parsed = JSON.parse(jsonMatch[0])
    return {
      companyName: parsed.companyName || '',
      industry: parsed.industry || '',
      whatTheyDo: parsed.whatTheyDo || '',
      icp: parsed.icp || '',
      offer: parsed.offer || '',
      competitors: parsed.competitors || [],
      tonePreference: parsed.tonePreference || 'Professional',
      additionalNotes: parsed.additionalNotes || '',
      slackChannel: '',
    }
  } catch {
    throw new Error('Failed to parse structured input from Claude response')
  }
}

export async function runDeepResearch(
  profile: ClientProfile,
  onUpdate?: StageCallback
): Promise<ResearchBrief> {
  const client = getClient()

  onUpdate?.('researching', 'Launching deep research with web search...')

  const competitorsList =
    profile.competitors.length > 0
      ? profile.competitors.join(', ')
      : 'not provided — find the top 3-5 competitors'

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 8000,
    tools: [
      {
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: 10,
      },
    ],
    messages: [
      {
        role: 'user',
        content: `You are a senior B2B market researcher. Research the following for a client in the ${profile.industry} space:

COMPANY: ${profile.companyName}
WHAT THEY DO: ${profile.whatTheyDo}
OFFER: ${profile.offer}
ICP (Ideal Client Profile): ${profile.icp}
COMPETITORS: ${competitorsList}

Research these areas thoroughly using web search:

1. INDUSTRY TRENDS: What are the top 3-5 current trends, challenges, and pain points in the ${profile.industry} industry right now? What keeps decision-makers up at night?

2. ICP DEEP DIVE: Research the ideal customer profile: ${profile.icp}. What are their:
   - Common job titles and LinkedIn headline patterns
   - Top 3 professional frustrations / pain points
   - Buying triggers (what makes them ready to buy?)
   - Objections they commonly raise
   - Language and terminology they use

3. COMPETITOR LANDSCAPE: Research ${competitorsList} or find the top 3-5 competitors in the ${profile.industry} / ${profile.offer} space. How do they position themselves? What gaps exist?

4. HOOK INTELLIGENCE: Based on your research, what are the most compelling angles for cold email outreach targeting ${profile.icp} about ${profile.offer}? What subject line patterns perform well in this space?

Return your research as a detailed structured report with these exact JSON keys:
{
  "industryTrends": "detailed findings about industry trends...",
  "icpDeepDive": "detailed ICP research...",
  "competitorLandscape": "competitor analysis...",
  "hookIntelligence": "compelling angles and hooks...",
  "summary": "3-4 bullet point summary of key findings (one per line)"
}

Return ONLY valid JSON. Be specific — cite real trends, real pain points, real language. This research will be used to write cold email sequences.`,
      },
    ],
  })

  let fullText = ''
  for (const block of response.content) {
    if (block.type === 'text') {
      fullText += block.text
    }
  }

  onUpdate?.(
    'researching',
    'Research complete. Processing findings...'
  )

  try {
    const jsonMatch = fullText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in research response')
    const parsed = JSON.parse(jsonMatch[0])
    return {
      industryTrends: parsed.industryTrends || '',
      icpDeepDive: parsed.icpDeepDive || '',
      competitorLandscape: parsed.competitorLandscape || '',
      hookIntelligence: parsed.hookIntelligence || '',
      summary: parsed.summary || '',
    }
  } catch {
    return {
      industryTrends: fullText,
      icpDeepDive: '',
      competitorLandscape: '',
      hookIntelligence: '',
      summary: fullText.slice(0, 500),
    }
  }
}

export async function generateEmailSequences(
  profile: ClientProfile,
  research: ResearchBrief,
  onUpdate?: StageCallback
): Promise<EmailSequence[]> {
  const client = getClient()

  onUpdate?.('generating-emails', 'Crafting 6 unique email sequences...')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 10000,
    messages: [
      {
        role: 'user',
        content: `You are a world-class cold email copywriter who has written sequences generating 8-figure pipeline for B2B companies. You write like a human, not a robot. Your emails are:
- Short (under 120 words for email 1)
- Specific (use real industry language from the research)
- Curious (subject lines open loops)
- Conversational (no corporate speak, no "I hope this finds you well")
- One CTA only per email

CLIENT PROFILE:
Company: ${profile.companyName}
Industry: ${profile.industry}
What they do: ${profile.whatTheyDo}
ICP: ${profile.icp}
Offer: ${profile.offer}
Tone: ${profile.tonePreference}

RESEARCH BRIEF:
Industry Trends: ${research.industryTrends}

ICP Deep Dive: ${research.icpDeepDive}

Competitor Landscape: ${research.competitorLandscape}

Hook Intelligence: ${research.hookIntelligence}

Generate 6 distinct cold email sequences. Each must use a different psychological angle:
1. "Problem-led" - Lead with the pain point
2. "Social Proof" - Lead with results/case studies
3. "Contrarian" - Challenge conventional thinking
4. "Curiosity Hook" - Open a loop they can't resist
5. "Direct Offer" - Straight to the value prop
6. "Video Intro" - Personal, pattern-interrupt approach

For EACH sequence provide:
- sequenceName: the name (e.g. "Problem-led")
- targetAngle: 1 sentence description of the strategy
- confidenceScore: 0-100 based on how well the research supports this angle
- subjectLineVariants: array of 3 subject lines (most to least curiosity-driven)
- email1: Initial outreach (max 120 words, punchy, one clear CTA)
- email2: Follow-up Day 3 (softer, adds value or social proof)
- email3: Follow-up Day 7 (pattern interrupt, different angle)
- psLine1: PS line for email 1
- psLine2: PS line for email 2
- psLine3: PS line for email 3
- recommendedSendTime: day of week + time based on ICP (e.g. "Tuesday 9:15 AM")
- personalisationTip: 1-2 sentences on how to personalise this per prospect

Do not repeat the same opening, structure, or CTA across sequences. Use research deeply — reference specific pain points, use the ICP's language.

Return ONLY a valid JSON array of 6 EmailSequence objects. No explanation, no markdown, just the JSON array.`,
      },
    ],
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''

  onUpdate?.('generating-emails', 'Email sequences generated. Parsing output...')

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array found in response')
    const parsed: EmailSequence[] = JSON.parse(jsonMatch[0])
    return parsed.slice(0, 6)
  } catch {
    throw new Error('Failed to parse email sequences from Claude response')
  }
}
