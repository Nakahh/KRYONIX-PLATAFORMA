'use client'

export interface Translation {
  [key: string]: {
    [locale: string]: string
  }
}

export const translations: Translation = {
  // Navigation
  'nav.home': {
    'pt-br': 'Início',
    'en': 'Home',
    'es': 'Inicio',
    'de': 'Startseite',
    'fr': 'Accueil'
  },
  'nav.partnerships': {
    'pt-br': 'Parcerias',
    'en': 'Partnerships',
    'es': 'Alianzas',
    'de': 'Partnerschaften',
    'fr': 'Partenariats'
  },
  'nav.solutions': {
    'pt-br': 'Soluções',
    'en': 'Solutions',
    'es': 'Soluciones',
    'de': 'Lösungen',
    'fr': 'Solutions'
  },
  'nav.contact': {
    'pt-br': 'Contato',
    'en': 'Contact',
    'es': 'Contacto',
    'de': 'Kontakt',
    'fr': 'Contact'
  },

  // Home page
  'home.title': {
    'pt-br': 'KRYONIX - Plataforma SaaS 100% Autônoma por IA',
    'en': 'KRYONIX - 100% AI-Autonomous SaaS Platform',
    'es': 'KRYONIX - Plataforma SaaS 100% Autónoma por IA',
    'de': 'KRYONIX - 100% KI-autonome SaaS-Plattform',
    'fr': 'KRYONIX - Plateforme SaaS 100% Autonome par IA'
  },
  'home.subtitle': {
    'pt-br': 'Automatize Seus Processos com IA Avançada',
    'en': 'Automate Your Processes with Advanced AI',
    'es': 'Automatiza Tus Procesos con IA Avanzada',
    'de': 'Automatisieren Sie Ihre Prozesse mit fortschrittlicher KI',
    'fr': 'Automatisez Vos Processus avec une IA Avancée'
  },
  'home.description': {
    'pt-br': 'Transforme sua empresa com nossa plataforma completa de automação empresarial, integrada a mais de 75 stacks tecnológicos.',
    'en': 'Transform your business with our complete business automation platform, integrated with over 75 technology stacks.',
    'es': 'Transforma tu empresa con nuestra plataforma completa de automatización empresarial, integrada con más de 75 stacks tecnológicos.',
    'de': 'Transformieren Sie Ihr Unternehmen mit unserer kompletten Geschäftsautomatisierungsplattform, integriert mit über 75 Technologie-Stacks.',
    'fr': 'Transformez votre entreprise avec notre plateforme complète d\'automatisation d\'entreprise, intégrée à plus de 75 stacks technologiques.'
  },

  // Partnerships
  'partnerships.title': {
    'pt-br': 'Parcerias Empresariais',
    'en': 'Business Partnerships',
    'es': 'Alianzas Empresariales',
    'de': 'Geschäftspartnerschaften',
    'fr': 'Partenariats d\'Affaires'
  },
  'partnerships.subtitle': {
    'pt-br': 'Oportunidades estratégicas de negócio',
    'en': 'Strategic business opportunities',
    'es': 'Oportunidades estratégicas de negocio',
    'de': 'Strategische Geschäftsmöglichkeiten',
    'fr': 'Opportunités stratégiques d\'affaires'
  },

  // Buttons
  'button.download': {
    'pt-br': 'Download',
    'en': 'Download',
    'es': 'Descargar',
    'de': 'Herunterladen',
    'fr': 'Télécharger'
  },
  'button.contact': {
    'pt-br': 'Entre em Contato',
    'en': 'Get in Touch',
    'es': 'Ponte en Contacto',
    'de': 'Kontakt Aufnehmen',
    'fr': 'Prendre Contact'
  },
  'button.learn_more': {
    'pt-br': 'Saiba Mais',
    'en': 'Learn More',
    'es': 'Aprende Más',
    'de': 'Mehr Erfahren',
    'fr': 'En Savoir Plus'
  },

  // System status
  'system.online': {
    'pt-br': 'Sistema Online',
    'en': 'System Online',
    'es': 'Sistema En Línea',
    'de': 'System Online',
    'fr': 'Système En Ligne'
  },

  // Language change notification
  'language.changed': {
    'pt-br': 'Idioma alterado para Português (BR).\n\nEm breve teremos tradução completa do site!',
    'en': 'Language changed to English.\n\nComplete site translation coming soon!',
    'es': 'Idioma cambiado a Español.\n\n¡Traducción completa del sitio próximamente!',
    'de': 'Sprache geändert zu Deutsch.\n\nVollständige Website-Übersetzung kommt bald!',
    'fr': 'Langue changée en Français.\n\nTraduction complète du site bientôt disponible!'
  }
}

export const getTranslation = (key: string, locale: string): string => {
  return translations[key]?.[locale] || translations[key]?.['pt-br'] || key
}

export const translatePage = (locale: string) => {
  // Função para traduzir elementos com data-translate
  const elementsToTranslate = document.querySelectorAll('[data-translate]')
  
  elementsToTranslate.forEach(element => {
    const key = element.getAttribute('data-translate')
    if (key) {
      const translation = getTranslation(key, locale)
      if (element.tagName === 'INPUT' && element.getAttribute('type') === 'text') {
        (element as HTMLInputElement).placeholder = translation
      } else {
        element.textContent = translation
      }
    }
  })

  // Função para traduzir elementos com data-translate-title (titles/tooltips)
  const elementsWithTitle = document.querySelectorAll('[data-translate-title]')
  
  elementsWithTitle.forEach(element => {
    const key = element.getAttribute('data-translate-title')
    if (key) {
      const translation = getTranslation(key, locale)
      element.setAttribute('title', translation)
    }
  })
}

export const getCurrentLocale = (): string => {
  if (typeof window === 'undefined') return 'pt-br'
  
  return localStorage.getItem('preferred-locale') || 'pt-br'
}

export const setCurrentLocale = (locale: string) => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('preferred-locale', locale)
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${365 * 24 * 60 * 60}`
}

// Hook para usar em componentes React
export const useTranslation = () => {
  const currentLocale = getCurrentLocale()
  
  const t = (key: string): string => {
    return getTranslation(key, currentLocale)
  }
  
  const changeLanguage = (newLocale: string) => {
    setCurrentLocale(newLocale)
    translatePage(newLocale)
    
    // Notificar mudança
    const message = getTranslation('language.changed', newLocale)
    alert(message)
  }
  
  return { t, changeLanguage, currentLocale }
}
