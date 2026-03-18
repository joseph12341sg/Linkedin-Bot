import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cold Email Agent — AI-Powered Email Sequence Generator',
  description:
    'Generate bespoke cold email sequences with deep AI research. Upload client onboarding data, get 6 unique email sequences with follow-ups.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-bg">
          {/* Subtle gradient backdrop */}
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(79,126,247,0.05)_0%,_transparent_50%)] pointer-events-none" />

          <main className="relative z-10 px-4 sm:px-6 lg:px-8 py-12">
            {children}
          </main>

          {/* Footer */}
          <footer className="relative z-10 text-center py-8 text-text-muted text-xs">
            <p>Cold Email Agent &middot; Powered by Claude AI</p>
          </footer>
        </div>
      </body>
    </html>
  )
}
