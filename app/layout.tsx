import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/contexts/theme-context'
import ThemeScript from './components/ThemeScript'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kryonix',
  description: 'Plataforma SaaS 100% Autônoma por IA',
  keywords: ['saas', 'ia', 'automação', 'multi-tenant', 'whatsapp', 'crm', 'brasil'],
  authors: [{ name: 'KRYONIX', url: 'https://www.kryonix.com.br' }],
  creator: 'Vitor Jayme Fernandes Ferreira',
  publisher: 'KRYONIX',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.kryonix.com.br'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-kryonix.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
  },
  openGraph: {
    title: 'Kryonix',
    description: 'Plataforma SaaS 100% Autônoma por IA',
    url: 'https://www.kryonix.com.br',
    siteName: 'Kryonix',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/logo-kryonix.png',
        width: 1200,
        height: 630,
        alt: 'Kryonix - Plataforma SaaS 100% Autônoma por IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kryonix',
    description: 'Plataforma SaaS 100% Autônoma por IA',
    images: ['/logo-kryonix.png'],
    creator: '@kryonix',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-token',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
