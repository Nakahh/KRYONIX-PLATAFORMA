# 🎨 PARTE 11 - INTERFACE PRINCIPAL
*Agentes: Designer UX/UI + Frontend + Arquiteto Software*

## 🎯 OBJETIVO
Desenvolver interface principal da plataforma KRYONIX SaaS com React, TailwindCSS e design system moderno.

## 🎨 DESIGN SYSTEM KRYONIX
```typescript
// Design tokens
export const kryonixTheme = {
  colors: {
    primary: '#0066CC',    // Azul KRYONIX
    secondary: '#00B4D8',  // Azul claro
    accent: '#FF6B35',     // Laranja destaque
    neutral: '#F8F9FA',    // Cinza claro
    dark: '#1A1A1A'        // Preto
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem', 
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem'
    }
  }
}
```

## 🏗️ ESTRUTURA COMPONENTES
```
src/
├── components/
│   ├── ui/           # Componentes base (Button, Input, etc)
│   ├── layout/       # Header, Sidebar, Footer
│   ├── features/     # Componentes de funcionalidade
│   └── charts/       # Gráficos e visualizações
├── pages/
│   ├── Dashboard/    # Dashboard principal
│   ├── Projects/     # Gestão de projetos
│   ├── Automations/  # N8N workflows
│   └── Analytics/    # Metabase embarcado
```

## 💻 LAYOUT RESPONSIVO
```tsx
// Layout principal KRYONIX
export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <KryonixHeader />
      <div className="flex">
        <KryonixSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <KryonixFooter />
    </div>
  );
};
```

## ✅ DELIVERABLES
- [ ] Design system KRYONIX implementado
- [ ] Layout responsivo funcionando
- [ ] Componentes base criados
- [ ] Dark mode implementado
- [ ] Logo KRYONIX em posições estratégicas

---
*Parte 11 de 50 - KRYONIX SaaS Platform*
