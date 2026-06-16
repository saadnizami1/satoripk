import type { Metadata } from 'next'
import { Inter, Syne, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Satori',
  description: 'Your private companion for mental wellness',
  openGraph: {
    title: 'Satori',
    description: 'Your private companion for mental wellness',
    url: 'https://satoripk.vercel.app',
    siteName: 'Satori',
    images: [
      {
        url: 'https://satoripk.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Satori',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Satori ',
    description: 'Your private companion for mental wellness — mood tracking, AI support, journaling, and breathwork.',
    images: ['https://satoripk.vercel.app/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${syne.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased" style={{ background: '#F4F2EE', color: '#0C0C0C', fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
