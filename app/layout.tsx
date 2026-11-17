import type { Metadata, Viewport } from 'next'
import { Inter, Gloock } from 'next/font/google'
import './globals.css'
import { StickerDefs } from '@/components/ui/stickers'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

// Display face: a condensed, high-contrast serif with soft ball terminals.
const gloock = Gloock({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-gloock',
  display: 'swap',
})

const DESCRIPTION =
  'A free, private place for students in Pakistan to check in, breathe, focus and talk things through.'

export const metadata: Metadata = {
  metadataBase: new URL('https://satoripk.vercel.app'),
  title: { default: 'Satori', template: '%s · Satori' },
  description: DESCRIPTION,
  openGraph: {
    title: 'Satori',
    description: DESCRIPTION,
    url: 'https://satoripk.vercel.app',
    siteName: 'Satori',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Satori: kites over Lahore rooftops at dusk' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Satori',
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },
}

export const viewport: Viewport = {
  themeColor: '#0F1E2E',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${gloock.variable}`}>
      <body>
        <StickerDefs />
        {children}
      </body>
    </html>
  )
}
