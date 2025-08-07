import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { locales } from '@/lib/i18n';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/lib/contexts/theme-context';
import ThemeScript from '../components/ThemeScript';
import type { Metadata } from 'next';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

type Props = {
  children: ReactNode;
  params: { locale: string };
};

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
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: Props) {
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link rel="icon" href="/favicon.png" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="alternate" hrefLang="pt-br" href="/pt-br" />
        <link rel="alternate" hrefLang="en" href="/en" />
        <link rel="alternate" hrefLang="es" href="/es" />
        <link rel="alternate" hrefLang="de" href="/de" />
        <link rel="alternate" hrefLang="fr" href="/fr" />
        <link rel="alternate" hrefLang="x-default" href="/pt-br" />
      </head>
      <body className={`${inter.className} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors`} suppressHydrationWarning>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <div id="root">
              {children}
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
