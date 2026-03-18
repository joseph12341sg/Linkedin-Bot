import { FullReport } from '@/types'

export function generateReportHTML(report: FullReport): string {
  const { clientProfile, researchBrief, emailSequences, timestamp } = report
  const date = new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const sequencePages = emailSequences
    .map(
      (seq, i) => `
    <div class="page sequence-page">
      <div class="sequence-header">
        <span class="sequence-number">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h2>${seq.sequenceName}</h2>
          <p class="angle">${seq.targetAngle}</p>
        </div>
        <div class="confidence">
          <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${seq.confidenceScore}%; background: ${seq.confidenceScore >= 80 ? '#2DD4BF' : seq.confidenceScore >= 60 ? '#F59E0B' : '#EF4444'}"></div>
          </div>
          <span>${seq.confidenceScore}/100</span>
        </div>
      </div>

      <div class="subject-lines">
        <h3>Subject Line Variants</h3>
        ${seq.subjectLineVariants.map((s, j) => `<p>${j + 1}. ${s}</p>`).join('')}
      </div>

      <div class="email-block">
        <h3>Email 1 — Initial Outreach</h3>
        <div class="email-body">${seq.email1.replace(/\n/g, '<br>')}</div>
        <div class="ps-line">PS: ${seq.psLine1}</div>
      </div>

      <div class="email-block">
        <h3>Email 2 — Follow-up (Day 3)</h3>
        <div class="email-body">${seq.email2.replace(/\n/g, '<br>')}</div>
        <div class="ps-line">PS: ${seq.psLine2}</div>
      </div>

      <div class="email-block">
        <h3>Email 3 — Follow-up (Day 7)</h3>
        <div class="email-body">${seq.email3.replace(/\n/g, '<br>')}</div>
        <div class="ps-line">PS: ${seq.psLine3}</div>
      </div>

      <div class="meta-row">
        <div><strong>Send Time:</strong> ${seq.recommendedSendTime}</div>
        <div><strong>Personalisation:</strong> ${seq.personalisationTip}</div>
      </div>
    </div>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; background: #0A0C10; color: #F0F2F8; }
  .page { padding: 48px; page-break-after: always; min-height: 100vh; }
  .cover { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, #0A0C10 0%, #13161D 100%); }
  .cover h1 { font-family: 'Syne', sans-serif; font-size: 42px; margin-bottom: 12px; color: #4F7EF7; }
  .cover .company { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
  .cover .date { color: #8891A8; font-size: 16px; margin-bottom: 40px; }
  .cover .prepared { color: #4A5162; font-size: 14px; margin-top: 60px; }
  .research-page h2 { font-family: 'Syne', sans-serif; font-size: 24px; color: #4F7EF7; margin-bottom: 24px; }
  .research-section { background: #13161D; border: 1px solid #1E2330; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
  .research-section h3 { font-family: 'Syne', sans-serif; font-size: 16px; color: #6B95FF; margin-bottom: 12px; }
  .research-section p { color: #8891A8; font-size: 13px; line-height: 1.7; white-space: pre-line; }
  .sequence-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #1E2330; }
  .sequence-number { font-family: 'Syne', sans-serif; font-size: 36px; color: #4F7EF7; font-weight: 700; }
  .sequence-header h2 { font-family: 'Syne', sans-serif; font-size: 20px; }
  .angle { color: #8891A8; font-size: 13px; }
  .confidence { margin-left: auto; text-align: right; }
  .confidence-bar { width: 80px; height: 6px; background: #1E2330; border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
  .confidence-fill { height: 100%; border-radius: 3px; }
  .confidence span { font-size: 12px; color: #8891A8; }
  .subject-lines { background: #13161D; border: 1px solid #1E2330; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
  .subject-lines h3 { font-size: 13px; color: #6B95FF; margin-bottom: 8px; }
  .subject-lines p { font-size: 13px; color: #F0F2F8; margin-bottom: 4px; }
  .email-block { background: #13161D; border: 1px solid #1E2330; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
  .email-block h3 { font-size: 13px; color: #6B95FF; margin-bottom: 8px; }
  .email-body { font-size: 12px; color: #F0F2F8; line-height: 1.7; }
  .ps-line { margin-top: 8px; padding-top: 8px; border-top: 1px solid #1E2330; font-size: 12px; color: #8891A8; font-style: italic; }
  .meta-row { display: flex; gap: 24px; margin-top: 16px; font-size: 12px; color: #8891A8; }
  .icp-page h2 { font-family: 'Syne', sans-serif; font-size: 24px; color: #4F7EF7; margin-bottom: 24px; }
  .icp-page .section { background: #13161D; border: 1px solid #1E2330; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
  .icp-page .section h3 { color: #6B95FF; margin-bottom: 12px; }
  .icp-page .section p { color: #8891A8; font-size: 13px; line-height: 1.7; white-space: pre-line; }
</style>
</head>
<body>
  <div class="page cover">
    <h1>Cold Email Report</h1>
    <p class="company">${clientProfile.companyName}</p>
    <p class="date">${date}</p>
    <p class="prepared">Prepared by Cold Email Agent AI</p>
  </div>

  <div class="page research-page">
    <h2>Research Brief</h2>
    <div class="research-section">
      <h3>Industry Trends</h3>
      <p>${researchBrief.industryTrends}</p>
    </div>
    <div class="research-section">
      <h3>ICP Deep Dive</h3>
      <p>${researchBrief.icpDeepDive}</p>
    </div>
    <div class="research-section">
      <h3>Competitor Landscape</h3>
      <p>${researchBrief.competitorLandscape}</p>
    </div>
    <div class="research-section">
      <h3>Hook Intelligence</h3>
      <p>${researchBrief.hookIntelligence}</p>
    </div>
  </div>

  ${sequencePages}

  <div class="page icp-page">
    <h2>ICP Summary & Recommendations</h2>
    <div class="section">
      <h3>Ideal Client Profile</h3>
      <p>${clientProfile.icp}</p>
    </div>
    <div class="section">
      <h3>Offer</h3>
      <p>${clientProfile.offer}</p>
    </div>
    <div class="section">
      <h3>Recommended Sending Infrastructure</h3>
      <p>• Use 3-5 warmed sending domains (rotate daily)
• Send volume: 30-50 emails per inbox per day max
• Warm-up period: 14 days minimum before full volume
• Tools: Instantly, Smartlead, or Lemlist for sending
• Verification: Use ZeroBounce or NeverBounce before sending
• Tracking: Use a custom tracking domain
• Personalise first line using Clay or similar enrichment tool</p>
    </div>
  </div>
</body>
</html>`
}

export async function generatePDFBuffer(report: FullReport): Promise<Buffer> {
  const html = generateReportHTML(report)

  // Try puppeteer if available, otherwise return HTML
  try {
    // Dynamic require to avoid webpack bundling issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const puppeteer = require('puppeteer')
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfUint8 = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })
    await browser.close()
    return Buffer.from(pdfUint8)
  } catch {
    // Fallback: return HTML for environments without puppeteer
    // The client will receive this as a downloadable HTML file
    return Buffer.from(html, 'utf-8')
  }
}
