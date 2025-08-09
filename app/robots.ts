import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/waitlist',
          '/login',
          '/_next/',
          '/_vercel/',
          '/private/'
        ]
      },
      {
        userAgent: 'Builder.io',
        allow: '/',
        disallow: []
      }
    ],
    sitemap: 'https://www.kryonix.com.br/sitemap.xml',
    host: 'https://www.kryonix.com.br'
  }
}
