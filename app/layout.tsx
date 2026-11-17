import type { Metadata, Viewport } from 'next'
import { Inter, Gloock, Caveat } from 'next/font/google'
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

// Handwriting, for margin notes and captions only.
const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-caveat',
  display: 'swap',
})

const DESCRIPTION =
  'A free, private place for teenagers in Pakistan to check in, breathe, focus and talk things through. Made with students, as part of a research study on academic stress.'

export const metadata: Metadata = {
  metadataBase: new URL('https://satoripk.vercel.app'),
  title: { default: 'Satori', template: '%s · Satori' },
  description: DESCRIPTION,
  openGraph: {
    title: 'Satori',
    description: DESCRIPTION,
    url: 'https://satoripk.vercel.app',
    siteName: 'Satori',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Satori: a quiet place for the loudest years' }],
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${gloock.variable} ${caveat.variable}`}>
      <body>
        <StickerDefs />
        {children}
      </body>
    </html>
  )
}
