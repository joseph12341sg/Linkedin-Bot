import { NextRequest, NextResponse } from 'next/server'
import { generatePDFBuffer } from '@/lib/pdf-export'
import { FullReport } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const report: FullReport = await request.json()

    const buffer = await generatePDFBuffer(report)
    const baseName = report.clientProfile.companyName.replace(/\s+/g, '_')

    // Detect if we got HTML fallback (no puppeteer) vs actual PDF
    const isHTML =
      buffer.length > 0 &&
      buffer.slice(0, 15).toString('utf-8').includes('<!DOCTYPE')

    const contentType = isHTML ? 'text/html' : 'application/pdf'
    const ext = isHTML ? 'html' : 'pdf'
    const filename = `${baseName}_Cold_Email_Report.${ext}`

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
