'use client'

export default function ThemeScript() {
  const script = `
    (function() {
      // Only run in browser environment
      if (typeof window === 'undefined' || typeof document === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }

      function getThemePreference() {
        try {
          const saved = localStorage.getItem('kryonix-theme')
          if (saved && ['light', 'dark', 'system'].includes(saved)) {
            return saved
          }
        } catch (e) {
          // localStorage might not be available
        }
        return 'system'
      }

      function applyTheme() {
        try {
          const theme = getThemePreference()
          let resolvedTheme

          if (theme === 'system') {
            resolvedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
          } else {
            resolvedTheme = theme
          }

          if (document.documentElement) {
            document.documentElement.classList.remove('light', 'dark')
            document.documentElement.classList.add(resolvedTheme)
            document.documentElement.style.colorScheme = resolvedTheme
          }
        } catch (e) {
          // Fail silently if theme application fails
          console.warn('Theme application failed:', e)
        }
      }

      applyTheme()
    })()
  `

  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
