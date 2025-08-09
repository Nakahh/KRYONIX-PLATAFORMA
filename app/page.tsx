import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default function RootPage() {
  // Get the accept-language header to determine user's preferred language
  const headersList = headers()
  const acceptLanguage = headersList.get('accept-language') || ''
  
  // Simple language detection - defaults to pt-br for Brazilian users
  let locale = 'pt-br'
  
  if (acceptLanguage.includes('en')) {
    locale = 'en'
  } else if (acceptLanguage.includes('es')) {
    locale = 'es'
  } else if (acceptLanguage.includes('de')) {
    locale = 'de'
  } else if (acceptLanguage.includes('fr')) {
    locale = 'fr'
  }
  
  // Redirect to the appropriate locale
  redirect(`/${locale}`)
}
