import { ClientProfile, ResearchBrief, EmailSequence } from '@/types'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function isDemoMode(): boolean {
  return (
    !process.env.ANTHROPIC_API_KEY ||
    process.env.ANTHROPIC_API_KEY === 'your_anthropic_key'
  )
}

export function isSlackConfigured(): boolean {
  return (
    !!process.env.SLACK_BOT_TOKEN &&
    process.env.SLACK_BOT_TOKEN !== 'xoxb-your-slack-bot-token'
  )
}

export async function mockParseInput(
  profile: Partial<ClientProfile>
): Promise<ClientProfile> {
  await sleep(1200)
  return {
    companyName: profile.companyName || 'Acme Growth Agency',
    industry: profile.industry || 'B2B SaaS',
    whatTheyDo:
      profile.whatTheyDo ||
      'We help B2B SaaS companies build predictable outbound pipelines through cold email and LinkedIn outreach.',
    icp:
      profile.icp ||
      'VP of Sales or Head of Growth at Series A-C SaaS companies (50-500 employees) in the US and UK.',
    offer:
      profile.offer ||
      'Done-for-you cold email campaigns that book 15-30 qualified meetings per month, with a pay-per-meeting pricing model.',
    competitors: profile.competitors?.length
      ? profile.competitors
      : ['Belkins', 'CIENCE', 'SalesRoads'],
    tonePreference: profile.tonePreference || 'Professional',
    additionalNotes: profile.additionalNotes || '',
    slackChannel: profile.slackChannel || '',
  }
}

export async function mockResearch(
  profile: ClientProfile
): Promise<ResearchBrief> {
  await sleep(3000)
  return {
    industryTrends: `1. AI-Powered Personalisation: ${profile.industry} companies are rapidly adopting AI tools to personalise outreach at scale. Generic templates see <2% reply rates while hyper-personalised sequences hit 8-15%.

2. Deliverability Crisis: Google and Microsoft's 2024 spam policy changes have made cold email deliverability harder than ever. Companies need sophisticated infrastructure (multiple domains, warm-up, authentication) to land in primary inbox.

3. Multi-Channel Sequences: Top performers combine cold email with LinkedIn touches, video messages, and even direct mail. Pure email-only approaches are declining in effectiveness.

4. Signal-Based Selling: Leading agencies are moving from "spray and pray" to intent-based targeting — using job changes, funding rounds, tech stack changes, and hiring signals to time outreach perfectly.

5. Compliance Pressure: GDPR enforcement is increasing and CAN-SPAM scrutiny is tightening. Companies need compliant, consent-aware outreach strategies.`,

    icpDeepDive: `Common Titles: VP of Sales, Head of Growth, Director of Business Development, Chief Revenue Officer, Head of Demand Gen

Top Frustrations:
- Pipeline is unpredictable month-to-month despite spending on SDRs and tools
- Sales team spends too much time prospecting instead of closing
- Previous agencies delivered "leads" that weren't truly qualified
- Can't scale outbound without hiring more expensive headcount

Buying Triggers:
- Just raised a funding round and need to show growth
- New sales leader hired who wants to build pipeline fast
- Current SDR team underperforming against quota
- Board pressure to improve CAC and show efficient growth

Common Objections:
- "We tried cold email before and it didn't work"
- "Our ICP is too senior / sophisticated for cold email"
- "We're worried about damaging our brand reputation"
- "How do you guarantee results?"

Language They Use: "pipeline generation", "qualified meetings", "outbound motion", "revenue operations", "GTM strategy", "ICP", "signal-based", "intent data"`,

    competitorLandscape: `Top Competitors in ${profile.industry} lead generation:

1. Belkins — Positions as "appointment setting" agency. Strong brand, lots of case studies. Weakness: perceived as expensive, long contracts, mixed reviews on lead quality.

2. CIENCE — Technology-forward, offers SDR-as-a-service + their own data platform. Weakness: complex pricing, some complaints about junior SDRs handling accounts.

3. SalesRoads — US-focused, emphasises experienced domestic SDRs. Weakness: higher price point, slower to adopt AI/automation.

Gaps in the Market:
- Most agencies lock clients into 6-12 month contracts with no performance guarantees
- Few offer transparent, pay-per-meeting pricing
- Limited use of AI for real-time personalisation at scale
- Most agencies still rely on static lists rather than intent signals`,

    hookIntelligence: `Strongest Angles for ${profile.icp}:

1. "Pipeline Math" Hook — Show them the unit economics: cost per meeting, meetings to close, revenue per meeting. Make it a math problem, not a sales pitch.

2. "We Looked at Your Outbound" Hook — Reference something specific about their current outreach (LinkedIn activity, careers page showing SDR hiring, etc.)

3. "Competitor Case Study" Hook — Reference a similar company (same stage, industry) and the specific results achieved.

4. "The 3% Problem" Hook — Most cold emails get <3% reply rates. Lead with a contrarian take on why, and position your approach as different.

5. Subject Line Patterns That Work:
   - Question format: "Quick question about [company]'s outbound?"
   - Mutual connection/relevance: "[Mutual connection] mentioned you"
   - Specific result: "15 meetings/month for [similar company]"
   - Pattern interrupt: "This isn't a sales email (kind of)"`,

    summary: `${profile.industry} companies face a deliverability crisis post-2024 spam policy changes, making sophisticated infrastructure essential
VPs of Sales at Series A-C companies are frustrated by unpredictable pipelines and unqualified leads from previous agencies
Major competitors (Belkins, CIENCE, SalesRoads) lock clients into long contracts without performance guarantees — a key gap to exploit
Strongest outreach angles: pipeline math/ROI, competitor case studies, and contrarian takes on why cold email "doesn't work"`,
  }
}

export async function mockEmailSequences(
  profile: ClientProfile
): Promise<EmailSequence[]> {
  await sleep(3500)
  return [
    {
      sequenceName: 'Problem-led',
      targetAngle:
        'Lead with the #1 pain point — unpredictable pipeline despite heavy investment in SDRs and tools.',
      confidenceScore: 92,
      subjectLineVariants: [
        `${profile.companyName ? 'Quick q' : 'Question'} about your outbound pipeline`,
        `Is your SDR team actually booking enough meetings?`,
        `The pipeline problem nobody talks about`,
      ],
      email1: `Hi {{firstName}},

Noticed ${profile.companyName || 'your company'} is scaling the sales team — congrats on the growth.

Quick question: is your outbound actually generating predictable pipeline, or is it still feast-or-famine month to month?

Most ${profile.industry || 'B2B'} companies I talk to are spending $15-20K/month on SDRs + tools but only booking 5-8 qualified meetings.

We help companies like yours book 15-30 qualified meetings/month — and you only pay per meeting booked.

Worth a 15-min chat to see if there's a fit?`,
      email2: `Hi {{firstName}},

Not trying to clog your inbox — just wanted to share something relevant.

We helped a Series B SaaS company go from 6 meetings/month to 24 in 60 days using signal-based targeting (job changes, funding events, tech installs).

Their Head of Sales said the meetings were "the most qualified leads we've ever had from outbound."

Happy to share the exact playbook if helpful.`,
      email3: `{{firstName}},

Different approach — I'll be direct.

If your outbound is already crushing it, ignore me. But if you're dealing with:
- SDRs spending more time prospecting than selling
- "Leads" that ghost after the first call
- No idea if next month's pipeline will be 5 or 50

...that's exactly what we fix. And you only pay when we book a qualified meeting.

Would you be open to a quick call this week?`,
      psLine1:
        'PS: We work with 12 SaaS companies in your space right now. Happy to share what\'s working.',
      psLine2:
        'PS: No contracts, no retainers. Pay-per-meeting only.',
      psLine3:
        'PS: I can also send over a free audit of your current cold email setup — no strings attached.',
      recommendedSendTime: 'Tuesday 9:15 AM',
      personalisationTip:
        'Reference a recent LinkedIn post by the prospect, or mention a specific job posting on their careers page that signals they\'re investing in sales growth.',
    },
    {
      sequenceName: 'Social Proof',
      targetAngle:
        'Lead with specific, verifiable results from similar companies to build instant credibility.',
      confidenceScore: 88,
      subjectLineVariants: [
        `How [similar company] books 22 meetings/month`,
        `Case study: ${profile.industry || 'SaaS'} company 3x'd their pipeline`,
        `Thought this result might interest you`,
      ],
      email1: `Hi {{firstName}},

Last quarter, we helped a Series B ${profile.industry || 'SaaS'} company (similar size to ${profile.companyName || 'yours'}) go from 8 to 22 qualified meetings per month.

The kicker? They'd tried two other agencies before us and were skeptical outbound could work for their ICP.

The difference: we use signal-based targeting instead of static lists, and AI-personalised copy instead of templates.

Want me to send over the case study? Takes 3 minutes to read.`,
      email2: `Hi {{firstName}},

Following up with one specific number: 67%.

That's the average increase in reply rates our clients see in the first 30 days vs. their previous outbound approach.

The secret isn't magic — it's targeting the right people at the right time with messages that don't sound like every other sales email.

Happy to walk you through our approach if you're curious.`,
      email3: `{{firstName}},

I keep hearing the same thing from ${profile.industry || 'B2B'} sales leaders:

"We've tried cold email — it doesn't work for us."

Usually means they tried generic templates, bought a list, and blasted 1,000 emails. That doesn't work for anyone anymore.

What does work: intent signals + hyper-personalised sequences + proper infrastructure.

15 minutes — I'll show you exactly how it works. No pitch, just the framework.`,
      psLine1:
        'PS: I can share 3 more case studies from companies in your exact space.',
      psLine2:
        'PS: Our average client sees ROI within the first 30 days.',
      psLine3:
        'PS: Even if we don\'t work together, the framework is worth knowing.',
      recommendedSendTime: 'Wednesday 10:00 AM',
      personalisationTip:
        'If you can find a case study from a company in their exact sub-niche or that they might know personally, mention them by name for maximum impact.',
    },
    {
      sequenceName: 'Contrarian',
      targetAngle:
        'Challenge the conventional belief that cold email is dead to spark curiosity and differentiate.',
      confidenceScore: 85,
      subjectLineVariants: [
        `Cold email is dead (here's what replaced it)`,
        `Why your SDRs are sending the wrong emails`,
        `Unpopular opinion about ${profile.industry || 'B2B'} outbound`,
      ],
      email1: `Hi {{firstName}},

Hot take: 95% of cold email is garbage. And that's actually great news for ${profile.companyName || 'your team'}.

Here's why — when everyone else is sending generic templates that land in spam, a well-researched, signal-timed, genuinely relevant email stands out like a lighthouse.

We've proven this with ${profile.industry || 'B2B'} companies booking 15-30 meetings/month using cold email that doesn't feel like cold email.

Curious enough for a 15-minute call?`,
      email2: `{{firstName}},

One more contrarian thought:

The companies I see failing at outbound aren't failing because of bad copy. They're failing because of bad targeting.

They're emailing everyone who matches a job title instead of people showing buying signals right now (new funding, new hire, tech change, competitor switch).

It's the difference between knocking on every door on the street vs. knocking on the one with a "for sale" sign.

Want to see how we find the "for sale" signs for ${profile.industry || 'B2B'} companies?`,
      email3: `{{firstName}},

Last try — and I'll make it worth your time either way.

I put together a free 5-minute breakdown of what's actually working in ${profile.industry || 'B2B'} outbound right now (and what most agencies are still getting wrong).

No pitch, no call required. Just genuinely useful intel.

Want me to send it over?`,
      psLine1:
        'PS: Our reply rates average 12-18%. Industry average is 2-3%. The approach matters.',
      psLine2:
        'PS: We turned down 3 clients last month because signal-based targeting didn\'t fit their market. We\'ll be honest if it\'s not right for you.',
      psLine3:
        'PS: 200+ sales leaders have found this useful. Zero have complained.',
      recommendedSendTime: 'Tuesday 2:30 PM',
      personalisationTip:
        'Reference a specific outbound email you received from their company (or a competitor) and explain what you\'d do differently — this makes the contrarian angle personal and credible.',
    },
    {
      sequenceName: 'Curiosity Hook',
      targetAngle:
        'Open an irresistible loop that the prospect can only close by replying.',
      confidenceScore: 79,
      subjectLineVariants: [
        `Found something interesting about ${profile.companyName || 'your outbound'}`,
        `This number surprised me`,
        `Quick thought (not what you'd expect)`,
      ],
      email1: `Hi {{firstName}},

I spent 20 minutes looking at how ${profile.companyName || 'companies in your space'} approaches outbound and found something I think you'd want to know.

It's not bad — but there's a specific gap that's probably costing you 10-15 qualified meetings per month.

I put together a quick breakdown. Want me to send it over?

(No pitch — just the analysis.)`,
      email2: `{{firstName}},

Circling back on that analysis I mentioned.

I'll give you the headline: there are 3 signals in your market that predict buying intent with ~70% accuracy. Most ${profile.industry || 'B2B'} companies aren't tracking any of them.

When we layer these signals into outreach, reply rates typically jump from 3% to 12%+.

Happy to share which 3 signals are most relevant for your ICP.`,
      email3: `{{firstName}},

I'll respect your time — last note on this.

I shared that buying-signal framework with a VP of Sales at a company similar to ${profile.companyName || 'yours'} last month. Her response:

"Why didn't anyone tell me this 6 months ago? We would have hit Q3 targets."

If you're curious, I'm happy to share. If not, no hard feelings.`,
      psLine1:
        'PS: This isn\'t a canned pitch — I actually looked at your market specifically.',
      psLine2:
        'PS: One of these signals is completely free to track. You could start today.',
      psLine3:
        'PS: She\'s now a client, but the framework is yours regardless.',
      recommendedSendTime: 'Monday 8:45 AM',
      personalisationTip:
        'Do actual research before sending — look at their LinkedIn, recent content, job postings. Reference one specific finding to make the "I looked into your company" claim genuine.',
    },
    {
      sequenceName: 'Direct Offer',
      targetAngle:
        'Skip the build-up and go straight to the value proposition with clear, specific terms.',
      confidenceScore: 82,
      subjectLineVariants: [
        `15-30 meetings/month — only pay per meeting`,
        `${profile.industry || 'B2B'} outbound, zero risk`,
        `Quick proposal for ${profile.companyName || 'your team'}`,
      ],
      email1: `Hi {{firstName}},

I'll keep this short:

We book 15-30 qualified meetings per month for ${profile.industry || 'B2B'} companies through cold email and LinkedIn outreach.

You only pay per qualified meeting booked. No retainers, no long contracts.

If the meetings aren't qualified, you don't pay.

We're working with 12 companies in your space right now and have capacity for 2 more this quarter.

Worth a quick conversation?`,
      email2: `{{firstName}},

Quick follow-up with specifics:

What "qualified" means for our clients:
- Right title (decision-maker, not gatekeeper)
- Right company size and stage
- Genuine interest in learning more
- Shows up to the call

Average cost per meeting: $150-300 (vs. $800-1,200 industry average for SDR-sourced meetings).

We handle everything: targeting, copy, infrastructure, sending, booking. Your team just shows up and closes.

Make sense to chat?`,
      email3: `{{firstName}},

Last touch — wanted to share the math that usually gets people's attention:

If we book 20 meetings/month at $200/meeting = $4,000
If you close 15% of those = 3 new clients
If each client is worth $50K+ ARR = $150K revenue

That's a 37x return on outbound spend.

Even at half those numbers, it's a no-brainer.

Happy to run the math on your specific numbers — takes 15 minutes.`,
      psLine1:
        'PS: Average client has been with us 14 months. We keep them because it keeps working.',
      psLine2:
        'PS: We can start delivering meetings within 14 days of kickoff.',
      psLine3:
        'PS: I\'ll send over a custom ROI calculator if you\'re interested — no call needed.',
      recommendedSendTime: 'Thursday 9:00 AM',
      personalisationTip:
        'Adjust the meeting volume and cost-per-meeting numbers based on their company size and deal value. Larger companies will want higher volume; smaller ones care more about cost.',
    },
    {
      sequenceName: 'Video Intro',
      targetAngle:
        'Pattern interrupt with a personal video message that cuts through inbox noise.',
      confidenceScore: 74,
      subjectLineVariants: [
        `Recorded a quick video for you, {{firstName}}`,
        `60-second video about ${profile.companyName || 'your outbound'}`,
        `{{firstName}} — watched this yet?`,
      ],
      email1: `Hi {{firstName}},

I recorded a quick 60-second video for you instead of writing another wall of text:

[VIDEO THUMBNAIL / LINK]

TL;DW: I looked at how ${profile.companyName || 'companies like yours'} is approaching outbound and had a specific idea for how to 2-3x your qualified meetings without adding headcount.

Worth a watch? (It's genuinely 60 seconds — I timed it.)`,
      email2: `{{firstName}},

Not sure if you caught the video — totally get it, inboxes are brutal.

Here's the core idea in text: most ${profile.industry || 'B2B'} companies are sitting on 3-5x more pipeline than they realise because they're only reaching people who are actively searching.

We help you reach the other 95% — the ones who have the problem but haven't started looking for a solution yet.

That's where signal-based outbound comes in. Happy to explain in 15 minutes?`,
      email3: `{{firstName}},

Final thought — and this one's just text, I promise.

Whether we work together or not, here's one thing you can implement today:

Set up alerts for these signals in your target accounts:
1. New VP/Director of Sales hired (= new budget, new initiatives)
2. Funding announcement (= growth mandate)
3. Competitor's customer complaining on LinkedIn (= switching window)

Time your outreach within 48 hours of the signal. Reply rates 4-5x higher than cold lists.

If you want help automating this, that's literally what we do. But the tip is free.`,
      psLine1:
        'PS: I make these videos for about 10 prospects a week. You made the cut.',
      psLine2:
        'PS: That "other 95%" is where all the low-competition deals are.',
      psLine3:
        'PS: Tools to track these signals: LinkedIn Sales Navigator, Crunchbase alerts, Google Alerts. Or just let us handle it.',
      recommendedSendTime: 'Wednesday 3:00 PM',
      personalisationTip:
        'For the video version, actually record a personalised Loom/Vidyard showing their website or LinkedIn profile on screen. Name-drop their company at least twice. This sequence lives or dies on the video being genuinely personal.',
    },
  ]
}
