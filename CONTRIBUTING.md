# 🤝 Guia de Contribuição - KRYONIX

Obrigado por seu interesse em contribuir para a KRYONIX! Este documento orienta como participar do desenvolvimento da primeira plataforma mundial com 75+ pilhas tecnológicas integradas.

## 🎯 Como Contribuir

### 🌟 **Formas de Contribuição**
- **🔧 Código**: Desenvolvimento de features e correções
- **📖 Documentação**: Melhoria da documentação técnica
- **🧪 Testes**: QA e testes automatizados
- **🎨 Design**: UI/UX e melhorias visuais
- **🌍 Tradução**: Internacionalização para novos idiomas
- **🐛 Feedback**: Relatórios de bugs e sugestões

### 📋 **Processo de Contribuição**

1. **📥 Fork e Clone**
```bash
git clone https://github.com/seu-usuario/kryonix-plataforma.git
cd kryonix-plataforma
```

2. **🔧 Configuração Local**
```bash
cp .env.example .env
npm install
npm run dev
```

3. **🌿 Crie uma Branch**
```bash
git checkout -b feature/nova-funcionalidade
# ou
git checkout -b fix/correcao-bug
# ou
git checkout -b docs/melhoria-documentacao
```

4. **💻 Desenvolvimento**
- Siga os padrões de código estabelecidos
- Adicione testes para novas funcionalidades
- Mantenha a documentação atualizada

5. **🧪 Testes**
```bash
npm test
npm run lint
npm run type-check
```

6. **📤 Commit e Push**
```bash
git add .
git commit -m "feat: adiciona funcionalidade X"
git push origin feature/nova-funcionalidade
```

7. **🔄 Pull Request**
- Abra um PR detalhando suas mudanças
- Referencie issues relacionadas
- Aguarde revisão da equipe

## 📝 **Padrões de Código**

### 🎯 **Convenções de Nomenclatura**
```typescript
// ✅ Componentes: PascalCase
export const UserProfile = () => { ... }

// ✅ Hooks: camelCase com 'use'
export const useAuthState = () => { ... }

// ✅ Constantes: UPPER_SNAKE_CASE
export const API_ENDPOINTS = { ... }

// ✅ Tipos: PascalCase
export interface UserType { ... }
```

### 🏗️ **Estrutura de Componentes**
```
components/
├── ui/           # Componentes base (Button, Input)
├── forms/        # Formulários específicos
├── layout/       # Componentes de layout
└── modules/      # Componentes dos módulos SaaS
```

### 📏 **Padrões de Commit**
Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade
fix: corrige bug específico
docs: atualiza documentação
style: mudanças de formatação
refactor: refatoração de código
test: adiciona ou modifica testes
chore: tarefas de manutenção
```

## 🧪 **Testes**

### 📊 **Estratégia de Testes**
- **70%** Testes unitários (funções puras, lógica)
- **20%** Testes de integração (APIs, componentes)
- **10%** Testes E2E (fluxos críticos)

### 🎯 **Cobertura Mínima**
- Cobertura de código: **> 80%**
- Todos os testes devem passar
- Zero vulnerabilidades críticas

### 🚀 **Executando Testes**
```bash
# Todos os testes
npm test

# Testes com watch
npm run test:watch

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🎨 **Padrões de UI/UX**

### 🌈 **Design System**
- Use componentes do design system existente
- Mantenha consistência visual
- Priorize acessibilidade (A11y)
- Design mobile-first

### 📱 **Responsividade**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔐 **Segurança**

### 🛡️ **Diretrizes de Segurança**
- Nunca faça commit de credenciais
- Use variáveis de ambiente para secrets
- Valide todas as entradas de usuário
- Implemente rate limiting onde necessário

### 🔍 **Revisão de Segurança**
- Execute `npm audit` antes do commit
- Use HTTPS em todas as comunicações
- Criptografe dados sensíveis

## 📖 **Documentação**

### 📝 **Padrões de Documentação**
- Documente componentes complexos
- Inclua exemplos de uso
- Mantenha READMEs atualizados
- Use JSDoc para funções públicas

### 🌍 **Internacionalização**
- Textos em português brasileiro por padrão
- Use chaves i18n para textos de UI
- Mantenha traduções sincronizadas

## 🐛 **Reportando Bugs**

### 📋 **Template de Bug Report**
```markdown
**Descrição do Bug**
Descrição clara e concisa do problema.

**Como Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
Descrição do que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- OS: [ex: macOS, Windows, Linux]
- Navegador: [ex: Chrome, Safari, Firefox]
- Versão: [ex: 22]
```

## 💡 **Sugerindo Features**

### 🎯 **Template de Feature Request**
```markdown
**Resumo da Feature**
Descrição clara da funcionalidade proposta.

**Problema Resolvido**
Que problema esta feature resolve?

**Solução Proposta**
Como você imagina que isso deveria funcionar?

**Alternativas Consideradas**
Outras abordagens que você considerou?

**Contexto Adicional**
Mockups, links, referências, etc.
```

## 🏆 **Reconhecimento**

### 🌟 **Contribuidores**
- Todos os contribuidores são listados no README
- Menção em release notes para contribuições significativas
- Acesso antecipado a novas features

### 🎁 **Benefícios**
- Acesso ao canal privado no Discord/Slack
- Convites para eventos exclusivos
- Networking com a equipe KRYONIX

## 📞 **Suporte**

### 🆘 **Precisa de Ajuda?**
- **Discord**: [Link do servidor](#)
- **Email**: dev@kryonix.com.br
- **Issues**: Para perguntas técnicas específicas

### ⏰ **Horários de Suporte**
- Segunda a sexta: 9h às 18h (horário de Brasília)
- Respostas em até 24h em dias úteis

## 📋 **Checklist de PR**

Antes de abrir um Pull Request, verifique:

- [ ] ✅ Código segue os padrões estabelecidos
- [ ] 🧪 Todos os testes passam
- [ ] 📖 Documentação atualizada (se necessário)
- [ ] 🔍 Código revisado para vulnerabilidades
- [ ] 📱 Testado em diferentes dispositivos
- [ ] 🌍 Textos internacionalizados
- [ ] ♿ Acessibilidade considerada
- [ ] 📝 Commit message segue convenções

## 🚀 **Áreas Prioritárias**

### 🔥 **Alta Prioridade**
- Melhorias nos 15 agentes IA
- Otimizações para modelo Deepseek V2
- Performance mobile
- Segurança e compliance LGPD

### 📈 **Média Prioridade**
- Novos módulos SaaS
- Integrações com APIs brasileiras
- Melhorias de UI/UX
- Documentação

### 💡 **Contribuições Bem-vindas**
- Traduções para novos idiomas
- Exemplos de uso
- Testes automatizados
- Otimizações de performance

---

**Obrigado por contribuir para a KRYONIX! Juntos estamos construindo a plataforma SaaS mais avançada do Brasil! 🇧🇷🚀**
