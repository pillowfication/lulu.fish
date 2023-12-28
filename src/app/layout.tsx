import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import { type Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import { type JSX, type ReactNode } from 'react'
import './globals.css'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: 'Ocean Fishing',
  description: 'FFXIV Ocean Fishing'
}

export default function RootLayout ({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang='en' suppressHydrationWarning>
      <head />
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <main>
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}
