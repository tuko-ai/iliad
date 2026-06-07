import type { Metadata } from 'next'
import './globals.css'
import { PasswordGate } from '@/components/PasswordGate'

export const metadata: Metadata = {
  title: 'ILIAD — AI Filmmaking Pipeline',
  description: 'Solo filmmaker AI pipeline: character, storyboard, and video prompt generation',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PasswordGate>{children}</PasswordGate>
      </body>
    </html>
  )
}
