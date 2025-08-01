import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KRYONIX - Plataforma SaaS 100% Autônoma por IA',
  description: 'Plataforma empresarial multi-tenant com 32 stacks tecnológicas integradas e automação completa por inteligência artificial.',
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
    title: 'KRYONIX - Plataforma SaaS 100% Autônoma por IA',
    description: 'Plataforma empresarial multi-tenant com 32 stacks integradas, WhatsApp Business, CRM inteligente, automação 24/7 e muito mais. Criação de clientes em 2-5 minutos.',
    url: 'https://www.kryonix.com.br',
    siteName: 'KRYONIX',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/logo-kryonix.png',
        width: 1200,
        height: 630,
        alt: 'KRYONIX - Plataforma SaaS 100% Autônoma por IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KRYONIX - Plataforma SaaS 100% Autônoma por IA',
    description: 'Plataforma empresarial multi-tenant com 32 stacks integradas e automação completa por IA.',
    images: ['/logo-kryonix.png'],
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
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}
