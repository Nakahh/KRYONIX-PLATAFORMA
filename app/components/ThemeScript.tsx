'use client'

export default function ThemeScript() {
  const script = `
    (function() {
      function getThemePreference() {
        const saved = localStorage.getItem('kryonix-theme')
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          return saved
        }
        return 'system'
      }
      
      function applyTheme() {
        const theme = getThemePreference()
        let resolvedTheme
        
        if (theme === 'system') {
          resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        } else {
          resolvedTheme = theme
        }
        
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(resolvedTheme)
        document.documentElement.style.colorScheme = resolvedTheme
      }
      
      applyTheme()
    })()
  `

  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
