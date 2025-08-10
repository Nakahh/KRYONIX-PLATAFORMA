import { MetadataRoute } from 'next'
import { locales } from '@/i18n/request'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.kryonix.com.br'
  
  // Páginas principais para cada locale
  const pages = [
    '',
    '/progresso',
    '/parcerias-empresariais-contato',
    '/partnerships',
    '/partnerships-contact',
    '/dashboard',
    '/login',
    '/fila-de-espera',
    '/test-builderio'
  ]
  
  const sitemap: MetadataRoute.Sitemap = []
  
  // Adicionar páginas para cada locale
  locales.forEach((locale) => {
    pages.forEach((page) => {
      sitemap.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1 : 0.8,
        alternates: {
          languages: locales.reduce((acc, loc) => {
            acc[loc] = `${baseUrl}/${loc}${page}`
            return acc
          }, {} as Record<string, string>)
        }
      })
    })
  })
  
  // Adicionar páginas especiais
  sitemap.push(
    {
      url: `${baseUrl}/pt-br/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7
    },
    {
      url: `${baseUrl}/pt-br/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6
    },
    {
      url: `${baseUrl}/pt-br/fila-de-espera`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9
    }
  )
  
  return sitemap
}
