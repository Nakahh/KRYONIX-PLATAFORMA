'use client'

// Dynamic imports to prevent SSR issues
let jsPDF: any = null
let autoTableLoaded = false

// Tipos para o autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: {
      finalY: number
    }
  }
}

// Load jsPDF dynamically only on client side
const loadJsPDF = async () => {
  if (typeof window === 'undefined') {
    throw new Error('PDF generation is only available on the client side')
  }

  if (!jsPDF) {
    const jsPDFModule = await import('jspdf')
    jsPDF = jsPDFModule.jsPDF
  }

  if (!autoTableLoaded) {
    await import('jspdf-autotable')
    autoTableLoaded = true
  }

  return jsPDF
}

export interface DocumentSection {
  title: string
  content: string[]
  tables?: Array<{
    headers: string[]
    rows: string[][]
  }>
  lists?: Array<{
    title: string
    items: string[]
  }>
}

export class PDFGenerator {
  private doc: any = null
  private currentY: number = 30
  private pageHeight: number = 0
  private margin = 20
  private logoBase64: string = ''
  private watermarkBase64: string = ''
  private initialized: boolean = false

  constructor() {
    // Don't initialize jsPDF in constructor - do it lazily
    this.setupBranding()
  }

  private async ensureInitialized() {
    if (this.initialized) return

    const jsPDFClass = await loadJsPDF()
    this.doc = new jsPDFClass()
    this.pageHeight = this.doc.internal.pageSize.height
    this.initialized = true
  }

  private setupBranding() {
    // Base64 da logo KRYONIX (placeholder - substituir pela logo real)
    this.logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAeCAYAAADaW7vzAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbgAAAG4B8f2R3gAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAATrSURBVGiB7ZpbiFVVFMd/M2OmjZqZqKOGJmhqSFHQRYqwh8CHIPqAHqKHoJcuL71EEVTQgw89WPRQvfQUQdBTLzH0EBTU5YdEI8rCzAwVs8s4U6Nm7aH1Hc6e/Z199j7nzJkp9oOPfc5ey/6ttdd/rb3OQAghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghRC9MSGsEFouByUBV+DwJuBaoAP4GfgH2AT8CBwKiKP9Xs/FdAPAQsAHoAi5lOLqAvUAPsBN4BphjfI8DXgOOZtnnCPAqsAC4ykLfrcBe4J8sOl8ArjO++8vAHuBCFp1/Ae8Ay4ELlno3hHXs9ZinCuLGYuA74B5LfKtwU9Uh4JQF3m28AG8t8HPgXgCX5J8HT9rH/AbPA1uAH4AzQBdwHOgAPgSeAm4Gbsyg1yXgXWAmsALYDvwK/B3w1wGfA7cBE4vU/TzwCDAHeAv4Ndzec8AZ4DfgU+B+YJpN72aNOXCtfEyOdQVxYzGwDrgLvuQVN3Zdv+x5vP5t8LXr+osx1bUDGI836E0GdTvucgduY3qoH1jGNjf7LfAAviXYV9L2Pu4IY87X/A8C8fB7LfILYBOe3LeAazLqM4TVMOy+xvwIOLaKY3HIHSNq1l/H1CK0Zp0jdS5T/NdYqf8+sAfPhzQlpgzr8QPeoDiWL86eZ9vcMWYJ8BiwCb+/VlrgNlNTYhVtdY70hPj8HPdM0/nQDJysm7sjNF8YaYD8wdvwNH4T7oJPGF2F8zt9hLhLzEYr/u6IxdM8MR57+b0ELAVeAFpjNt+cJ6ZfPOCNxrZbdnG1G9bXAfNfAm9GYtyh9LqbdJHmkTpjzCEb/Dd7gC6TxzRf3+fafBLT0GqLCLd7exOw9KWF5qjPJdE8k8c0X9/n2nwS02DbvXFQY/F6YOHAZuAi+BOsKtLe1m4T9E+RYNfKzUczNs9qY1s+J8QCk8c0X9/n2nwS06AtI6ttZNh1yxLggGFHKyGzbdB/SQwdW7tN0D9Fgl3bE7mfeEwbfE1sjxeSB5O6xPCnPVWvtWjIB9s7qRjbE9F8/QJ6VJu/HX9jcgN45wS6wWczNaXJG89Dq4LYpLJONY5fzjTf4DhEeCuwGrgOv4o6CJwBPscfhPj+tRa5LJ2cJN7O49wBvNtQF34N1Q6cNMBtyWM3+ItvP9bVk2nNYjn6TdJOAAcM6S6/IZlhRx/Ap3p8c4D3L8/hNQA8ANwJ1FroPwDsFhBv4dfFXcBf+Ptqp4B2fGLiM3zfX2dYZlnNYzlgNYz5/MYHdJoRfNgpP4AXa6Z+fwVqLPRsYy/gJnwAzSJcLrDewCa++fAdA1l6F4aOo7eDQ9oRh7RGbC9+5djNMGzF55Q+wZe29fhF9Dx8eZtJd7U+RwyZiP9O74vCT0BG9xHGGKWCsOHI0WNnEp8/VbQFOKr5uXuwb7oxtGjKe9wgpzAQKO/xCONYu+3wEBNgfMLgZJ/2MgDjgM+4fDzK6rJIu9twb8Yr/Qh1qGkUAZeaUOK/J2ORcHlwwOlkU7QM3gHcCVyNL5mP4/9Cc4eAKMo/5L3EGAM3G/h6E0IIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgh5B/gXJgSS+/VlV8sAAAAASUVORK5CYII='

    // Watermark mais transparente
    this.watermarkBase64 = this.logoBase64
  }

  private checkPageBreak(neededSpace: number = 30) {
    if (this.currentY + neededSpace > this.pageHeight - 30) {
      this.doc.addPage()
      this.addWatermark() // Marca d'água em nova página
      this.currentY = 30
      return true
    }
    return false
  }

  private addHeader(title: string, subtitle?: string) {
    // Logo KRYONIX real
    try {
      this.doc.addImage(this.logoBase64, 'PNG', this.margin, 12, 35, 12)
    } catch (error) {
      // Fallback: logo em formato texto
      this.doc.setFillColor(41, 128, 185)
      this.doc.rect(this.margin, 15, 30, 8, 'F')
      this.doc.setTextColor(255, 255, 255)
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('KRYONIX', this.margin + 15, 20, { align: 'center' })
    }

    // Título principal
    this.doc.setTextColor(0, 0, 0)
    this.doc.setFontSize(18)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin + 40, 18)

    if (subtitle) {
      this.doc.setFontSize(11)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(subtitle, this.margin + 40, 24)
    }

    // Data
    const date = new Date().toLocaleDateString('pt-BR')
    this.doc.setFontSize(9)
    this.doc.setTextColor(100, 100, 100)
    this.doc.text(`Gerado em: ${date}`, this.doc.internal.pageSize.width - this.margin, 18, { align: 'right' })

    // Linha decorativa
    this.doc.setDrawColor(41, 128, 185)
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, 30, this.doc.internal.pageSize.width - this.margin, 30)

    this.currentY = 40

    // Adicionar marca d'água
    this.addWatermark()
  }

  private addWatermark() {
    // Salva estado gráfico
    this.doc.saveGraphicsState()

    try {
      // Define opacidade para marca d'água (10% transparente)
      this.doc.setGState(new (this.doc as any).GState({ opacity: 0.1 }))

      // Posição central da página
      const pageWidth = this.doc.internal.pageSize.width
      const pageHeight = this.doc.internal.pageSize.height
      const watermarkSize = 60
      const x = (pageWidth - watermarkSize) / 2
      const y = (pageHeight - watermarkSize) / 2

      // Adiciona marca d'água central
      this.doc.addImage(this.watermarkBase64, 'PNG', x, y, watermarkSize, watermarkSize)

      // Marca d'água discreta no canto
      this.doc.setGState(new (this.doc as any).GState({ opacity: 0.15 }))
      const cornerSize = 12
      this.doc.addImage(
        this.watermarkBase64,
        'PNG',
        pageWidth - this.margin - cornerSize,
        pageHeight - this.margin - cornerSize,
        cornerSize,
        cornerSize
      )

    } catch (error) {
      // Fallback: marca d'água de texto
      this.doc.setGState(new (this.doc as any).GState({ opacity: 0.1 }))
      this.doc.setTextColor(200, 200, 200)
      this.doc.setFontSize(24)
      this.doc.setFont('helvetica', 'bold')

      const pageWidth = this.doc.internal.pageSize.width
      const pageHeight = this.doc.internal.pageSize.height

      // Texto diagonal no centro
      this.doc.text('KRYONIX', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45
      })

      // Texto pequeno no canto
      this.doc.setFontSize(8)
      this.doc.text('KRYONIX', pageWidth - 30, pageHeight - 15)
    }

    // Restaura estado gráfico
    this.doc.restoreGraphicsState()
  }

  private addSection(section: DocumentSection) {
    this.checkPageBreak(20)

    // Título da seção
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(41, 128, 185)
    this.doc.text(section.title, this.margin, this.currentY)
    this.currentY += 10

    // Linha decorativa
    this.doc.setDrawColor(41, 128, 185)
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.currentY, this.margin + 50, this.currentY)
    this.currentY += 8

    // Conteúdo
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(0, 0, 0)

    section.content.forEach(paragraph => {
      this.checkPageBreak(15)
      const splitText = this.doc.splitTextToSize(paragraph, this.doc.internal.pageSize.width - (this.margin * 2))
      this.doc.text(splitText, this.margin, this.currentY)
      this.currentY += splitText.length * 5 + 5
    })

    // Tabelas
    if (section.tables) {
      section.tables.forEach(table => {
        this.checkPageBreak(30)
        
        this.doc.autoTable({
          head: [table.headers],
          body: table.rows,
          startY: this.currentY,
          theme: 'grid',
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 10
          },
          bodyStyles: {
            fontSize: 9,
            cellPadding: 3
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          margin: { left: this.margin, right: this.margin },
          pageBreak: 'auto',
          showHead: 'everyPage'
        })

        this.currentY = this.doc.lastAutoTable.finalY + 10
      })
    }

    // Listas
    if (section.lists) {
      section.lists.forEach(list => {
        this.checkPageBreak(20)
        
        this.doc.setFontSize(12)
        this.doc.setFont('helvetica', 'bold')
        this.doc.text(list.title, this.margin, this.currentY)
        this.currentY += 8

        this.doc.setFontSize(10)
        this.doc.setFont('helvetica', 'normal')
        
        list.items.forEach(item => {
          this.checkPageBreak(6)
          this.doc.text(`• ${item}`, this.margin + 5, this.currentY)
          this.currentY += 6
        })
        
        this.currentY += 5
      })
    }

    this.currentY += 10
  }

  private addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      
      // Linha horizontal
      this.doc.setDrawColor(200, 200, 200)
      this.doc.setLineWidth(0.3)
      this.doc.line(this.margin, this.doc.internal.pageSize.height - 25, 
                   this.doc.internal.pageSize.width - this.margin, this.doc.internal.pageSize.height - 25)
      
      // Informações do rodapé
      this.doc.setFontSize(8)
      this.doc.setTextColor(100, 100, 100)
      
      // Esquerda
      this.doc.text('KRYONIX - Plataforma SaaS 100% Autônoma por IA', this.margin, this.doc.internal.pageSize.height - 15)
      this.doc.text('partnerships@kryonix.com.br | +55 17 98180-5327', this.margin, this.doc.internal.pageSize.height - 10)
      
      // Direita
      this.doc.text(`Página ${i} de ${pageCount}`, this.doc.internal.pageSize.width - this.margin, this.doc.internal.pageSize.height - 15, { align: 'right' })
      this.doc.text('www.kryonix.com.br', this.doc.internal.pageSize.width - this.margin, this.doc.internal.pageSize.height - 10, { align: 'right' })
    }
  }

  public generateCommercialProposal(language: string = 'pt') {
    const title = this.getTitle('commercial', language)
    const subtitle = this.getSubtitle('commercial', language)
    
    this.addHeader(title, subtitle)

    const sections = this.getCommercialProposalSections(language)
    sections.forEach(section => this.addSection(section))

    this.addFooter()
    this.doc.save(`proposta-comercial-kryonix-${language}.pdf`)
  }

  public generateTechnicalDocumentation(language: string = 'pt') {
    const title = this.getTitle('technical', language)
    const subtitle = this.getSubtitle('technical', language)
    
    this.addHeader(title, subtitle)

    const sections = this.getTechnicalDocumentationSections(language)
    sections.forEach(section => this.addSection(section))

    this.addFooter()
    this.doc.save(`documentacao-tecnica-kryonix-${language}.pdf`)
  }

  private getTitle(type: 'commercial' | 'technical', language: string): string {
    const titles = {
      commercial: {
        pt: '🤝 PROPOSTA COMERCIAL ESTRATÉGICA KRYONIX',
        en: '🤝 KRYONIX STRATEGIC COMMERCIAL PROPOSAL',
        es: '🤝 PROPUESTA COMERCIAL ESTRATÉGICA KRYONIX',
        de: '🤝 KRYONIX STRATEGISCHES HANDELSANGEBOT',
        fr: '🤝 PROPOSITION COMMERCIALE STRATÉGIQUE KRYONIX'
      },
      technical: {
        pt: '📋 DOCUMENTAÇÃO TÉCNICA COMPLETA KRYONIX',
        en: '📋 KRYONIX COMPLETE TECHNICAL DOCUMENTATION',
        es: '📋 DOCUMENTACIÓN TÉCNICA COMPLETA KRYONIX',
        de: '📋 KRYONIX VOLLSTÄNDIGE TECHNISCHE DOKUMENTATION',
        fr: '📋 DOCUMENTATION TECHNIQUE COMPLÈTE KRYONIX'
      }
    }
    
    return titles[type][language as keyof typeof titles[typeof type]] || titles[type].pt
  }

  private getSubtitle(type: 'commercial' | 'technical', language: string): string {
    const subtitles = {
      commercial: {
        pt: 'Parceria de Infraestrutura para Plataforma SaaS',
        en: 'Infrastructure Partnership for SaaS Platform',
        es: 'Alianza de Infraestructura para Plataforma SaaS',
        de: 'Infrastruktur-Partnerschaft für SaaS-Plattform',
        fr: 'Partenariat d\'Infrastructure pour Plateforme SaaS'
      },
      technical: {
        pt: 'Especificações Técnicas e Arquitetura da Solução',
        en: 'Technical Specifications and Solution Architecture',
        es: 'Especificaciones Técnicas y Arquitectura de la Solución',
        de: 'Technische Spezifikationen und Lösungsarchitektur',
        fr: 'Spécifications Techniques et Architecture de Solution'
      }
    }
    
    return subtitles[type][language as keyof typeof subtitles[typeof type]] || subtitles[type].pt
  }

  private getCommercialProposalSections(language: string): DocumentSection[] {
    if (language === 'en') {
      return [
        {
          title: 'EXECUTIVE SUMMARY',
          content: [
            'KRYONIX is a 100% AI-autonomous SaaS platform that revolutionizes business automation in Brazil and Latin America. Our integrated solution offers 9 specialized modules on a single platform, operating completely automatically with advanced artificial intelligence.',
            'Unlike traditional solutions that require weeks of setup and high technical complexity, KRYONIX is ready to use in 2-5 minutes with zero configuration. Our platform was designed specifically for the Brazilian market, with mobile-first interface, native WhatsApp integration, and pricing 40-60% lower than international competitors.',
            'With more than 75 integrated technology stacks and 15 specialized AI agents working 24/7, KRYONIX offers a complete automation experience that eliminates the need for multiple tools and complex integrations.'
          ]
        },
        {
          title: 'MARKET OPPORTUNITY',
          content: [
            'The Brazilian SaaS market is experiencing exponential growth, with projections of R$ 12.8 billion by 2024 and annual growth of 25%. Small and medium enterprises (SMEs) represent 99% of Brazilian companies but face significant barriers in digital transformation.',
            'Current challenges include: high implementation costs, technical complexity, lack of support in Portuguese, inadequate mobile interfaces, and absence of native WhatsApp integration.',
            'KRYONIX addresses these pain points with a unique solution in the market: 100% autonomous platform, immediate setup, mobile-first design, and pricing accessible to Brazilian entrepreneurs.'
          ],
          tables: [
            {
              headers: ['Market Segment', 'Size (Companies)', 'Current Pain Points', 'KRYONIX Solution'],
              rows: [
                ['Liberal Professionals', '2.5M', 'Complex tools, high costs', 'Simple, affordable, mobile'],
                ['SMEs (5-50 employees)', '650K', 'Multiple tools, no integration', 'Unified platform, AI automation'],
                ['Agencies/Consultants', '150K', 'White-label needs', 'Complete white-label solution'],
                ['E-commerce', '1.2M', 'WhatsApp integration', 'Native WhatsApp with Evolution API']
              ]
            }
          ]
        },
        // ... more sections
      ]
    } else {
      return [
        {
          title: 'RESUMO EXECUTIVO',
          content: [
            'A KRYONIX é uma plataforma SaaS 100% autônoma por IA que revoluciona a automação empresarial no Brasil e América Latina. Nossa solução integrada oferece 9 módulos especializados em uma única plataforma, operando de forma completamente automática com inteligência artificial avançada.',
            'Diferentemente das soluções tradicionais que exigem semanas de configuração e alta complexidade técnica, a KRYONIX está pronta para uso em 2-5 minutos com zero configuração. Nossa plataforma foi desenhada especificamente para o mercado brasileiro, com interface mobile-first, integração nativa com WhatsApp e preços 40-60% menores que concorrentes internacionais.',
            'Com mais de 75 stacks tecnológicos integrados e 15 agentes especializados de IA trabalhando 24/7, a KRYONIX oferece uma experiência completa de automação que elimina a necessidade de múltiplas ferramentas e integrações complexas.'
          ]
        },
        {
          title: 'OPORTUNIDADE DE MERCADO',
          content: [
            'O mercado brasileiro de SaaS está em crescimento exponencial, com projeções de R$ 12,8 bilhões até 2024 e crescimento anual de 25%. As pequenas e médias empresas (PMEs) representam 99% das empresas brasileiras, mas enfrentam barreiras significativas na transformação digital.',
            'Os desafios atuais incluem: altos custos de implementação, complexidade técnica, falta de suporte em português, interfaces inadequadas para mobile e ausência de integração nativa com WhatsApp.',
            'A KRYONIX atende essas dores com uma solução única no mercado: plataforma 100% autônoma, setup imediato, design mobile-first e preços acessíveis para o empresário brasileiro.'
          ],
          tables: [
            {
              headers: ['Segmento de Mercado', 'Tamanho (Empresas)', 'Dores Atuais', 'Solução KRYONIX'],
              rows: [
                ['Profissionais Liberais', '2,5M', 'Ferramentas complexas, custos altos', 'Simples, acessível, mobile'],
                ['PMEs (5-50 funcionários)', '650K', 'Múltiplas ferramentas, sem integração', 'Plataforma unificada, automação IA'],
                ['Agências/Consultores', '150K', 'Necessidade white-label', 'Solução white-label completa'],
                ['E-commerce', '1,2M', 'Integração WhatsApp', 'WhatsApp nativo com Evolution API']
              ]
            }
          ]
        },
        {
          title: 'MÓDULOS E FUNCIONALIDADES',
          content: [
            'A plataforma KRYONIX é composta por 9 módulos principais que podem ser contratados individualmente ou em pacotes combinados. Cada módulo é otimizado para mobile e funciona de forma integrada com os demais.'
          ],
          tables: [
            {
              headers: ['Módulo', 'Preço Mensal', 'Funcionalidades Principais', 'Target'],
              rows: [
                ['Analytics & BI', 'R$ 99', 'Dashboards, relatórios IA, métricas tempo real', 'Todos os segmentos'],
                ['Agendamento + Cobrança', 'R$ 119', 'Agenda inteligente, lembretes WhatsApp, PIX automático', 'Profissionais liberais'],
                ['Omnichannel IA', 'R$ 159', 'WhatsApp, chatbot multimodal, análise sentimento', 'Atendimento ao cliente'],
                ['CRM + Vendas', 'R$ 179', 'Pipeline visual, lead scoring IA, automação follow-up', 'Equipes de vendas'],
                ['Email Marketing', 'R$ 239', 'Editor drag-drop, A/B test IA, segmentação inteligente', 'Marketing digital'],
                ['Redes Sociais', 'R$ 239', 'Multi-plataforma, calendário, social listening IA', 'Marketing de conteúdo'],
                ['Portal Cliente', 'R$ 269', 'White-label, base conhecimento IA, treinamentos', 'Empresas B2B'],
                ['WhatsApp Business', 'R$ 179', 'Evolution API, multi-instância, campaigns broadcast', 'Mais popular'],
                ['SMS + Push', 'R$ 119', 'Multi-provedor, notifications web/mobile, compliance', 'Comunicação ampla']
              ]
            }
          ]
        },
        {
          title: 'DIFERENCIAIS COMPETITIVOS',
          content: [
            'A KRYONIX possui vantagens únicas no mercado brasileiro que a posicionam como a solução ideal para empresas que buscam automação eficiente e acessível.'
          ],
          lists: [
            {
              title: 'Tecnologia Diferenciada:',
              items: [
                '100% autônoma por IA com 15 agentes especializados',
                'Setup em 2-5 minutos vs 2-6 semanas dos concorrentes',
                'Interface mobile-first para 80% dos usuários brasileiros',
                'WhatsApp nativo com Evolution API oficial',
                'Ollama LLM local para privacidade total dos dados',
                '75+ stacks tecnológicos pré-integrados'
              ]
            },
            {
              title: 'Vantagens Comerciais:',
              items: [
                'Preços 40-60% menores que concorrentes internacionais',
                'Suporte 100% em português brasileiro',
                'Termos e condições adequados à legislação brasileira',
                'Integração nativa com PIX, boleto e cartões brasileiros',
                'Base de conhecimento específica para empresas brasileiras',
                'Onboarding automático com IA em português'
              ]
            }
          ]
        },
        {
          title: 'MODELO DE NEGÓCIOS E REVENUE SHARE',
          content: [
            'Oferecemos três níveis de parceria comercial para maximizar o retorno do investimento dos nossos parceiros de infraestrutura.'
          ],
          tables: [
            {
              headers: ['Nível', 'Investimento', 'Revenue Share', 'Benefícios Exclusivos'],
              rows: [
                ['Patrocinador Fundador', 'R$ 2.004.000', '15%', 'Naming rights, exclusividade 3 anos'],
                ['Parceiro Estratégico', 'R$ 798.000', '8%', 'Status preferido, co-marketing'],
                ['Parceiro Comercial', 'R$ 300.000', '3%', 'Lista partner, programa referência']
              ]
            }
          ]
        },
        {
          title: 'PROJEÇÕES FINANCEIRAS',
          content: [
            'Baseado em análise de mercado conservadora e benchmarks da indústria SaaS brasileira.'
          ],
          tables: [
            {
              headers: ['Período', 'Clientes Ativos', 'MRR Médio', 'ARR Total', 'Revenue Share 15%'],
              rows: [
                ['Ano 1 (2026)', '1.200', 'R$ 350', 'R$ 5.040.000', 'R$ 756.000'],
                ['Ano 2 (2027)', '3.500', 'R$ 420', 'R$ 17.640.000', 'R$ 2.646.000'],
                ['Ano 3 (2028)', '8.000', 'R$ 520', 'R$ 49.920.000', 'R$ 7.488.000'],
                ['Total 3 anos', '-', '-', 'R$ 72.600.000', 'R$ 10.890.000']
              ]
            }
          ]
        },
        {
          title: 'CRONOGRAMA DE IMPLEMENTAÇÃO',
          content: [
            'Desenvolvimento estruturado em 5 fases ao longo de 38 semanas, com entregas incrementais e validação contínua.'
          ],
          tables: [
            {
              headers: ['Fase', 'Duração', 'Entregas Principais', 'Marco de Validação'],
              rows: [
                ['Setup & Planejamento', '4 semanas', 'Equipe, design system, MVP', 'Design aprovado'],
                ['Core Development', '8 semanas', 'Autenticação, WhatsApp, database', 'Testes de carga'],
                ['Módulos Principais', '8 semanas', 'CRM, email marketing, analytics', 'Beta com 50 usuários'],
                ['Integrações & Testing', '8 semanas', 'Pagamentos, compliance, QA', 'Auditoria segurança'],
                ['Deploy & Launch', '8 semanas', 'Produção, monitoring, marketing', 'Go-live oficial'],
                ['Pós-lançamento', '2 semanas', 'Ajustes, otimizações, suporte', 'Métricas estabilizadas']
              ]
            }
          ]
        },
        {
          title: 'TERMOS COMERCIAIS',
          content: [
            'Condições de pagamento flexíveis e cronograma de liberação de recursos alinhado com entregas.'
          ],
          lists: [
            {
              title: 'Estrutura de Pagamento:',
              items: [
                '30% na assinatura do contrato',
                '25% na conclusão da Fase 2 (Core Development)',
                '25% na conclusão da Fase 4 (Testing completo)',
                '20% no go-live com primeiros 100 clientes ativos'
              ]
            },
            {
              title: 'Garantias Oferecidas:',
              items: [
                'SLA de uptime 99.9% com penalidades',
                'Backup automático diário dos dados',
                'Conformidade LGPD desde o primeiro dia',
                'Suporte técnico 24/7 via WhatsApp',
                'Atualiza��ões de segurança automáticas',
                'Monitoramento proativo de performance'
              ]
            }
          ]
        },
        {
          title: 'PRÓXIMOS PASSOS',
          content: [
            'Para formalizar a parceria e iniciar o desenvolvimento, seguiremos o cronograma abaixo:'
          ],
          lists: [
            {
              title: 'Cronograma de Decisão:',
              items: [
                'Análise da proposta: até 15 dias úteis',
                'Reunião técnica detalhada: semana seguinte',
                'Due diligence financeira e técnica: 10 dias úteis',
                'Assinatura do contrato: 5 dias úteis',
                'Início do desenvolvimento: imediato após assinatura'
              ]
            },
            {
              title: 'Documentação Adicional Disponível:',
              items: [
                'Especificações técnicas detalhadas (500 páginas)',
                'Análise de viabilidade econômica completa',
                'Benchmarks de performance e segurança',
                'Referências de clientes beta e casos de uso',
                'Roadmap de produto para 24 meses',
                'Plano de marketing e go-to-market strategy'
              ]
            }
          ]
        }
      ]
    }
  }

  private getTechnicalDocumentationSections(language: string): DocumentSection[] {
    if (language === 'en') {
      return [
        {
          title: 'SYSTEM ARCHITECTURE OVERVIEW',
          content: [
            'KRYONIX platform is built on modern microservices architecture with over 75 integrated technology stacks. The system is designed for high availability, scalability, and security, supporting multi-tenant isolation and AI-powered automation.',
            'The platform utilizes containerized deployment with Docker and Kubernetes orchestration, ensuring efficient resource utilization and automatic scaling based on demand.'
          ]
        }
        // Add more English technical sections...
      ]
    } else {
      return [
        {
          title: 'VISÃO GERAL DA ARQUITETURA',
          content: [
            'A plataforma KRYONIX é construída sobre uma arquitetura moderna de microsserviços com mais de 75 stacks tecnológicos integrados. O sistema foi projetado para alta disponibilidade, escalabilidade e segurança, suportando isolamento multi-tenant e automação powered by IA.',
            'A plataforma utiliza deployment containerizado com Docker e orquestração Kubernetes, garantindo utilização eficiente de recursos e escalabilidade automática baseada na demanda.'
          ],
          tables: [
            {
              headers: ['Camada', 'Tecnologias', 'Função', 'Escalabilidade'],
              rows: [
                ['Frontend', 'React, Next.js, PWA', 'Interface mobile-first', 'CDN global'],
                ['API Gateway', 'Traefik, Kong', 'Roteamento e segurança', 'Load balancing'],
                ['Backend', 'Node.js, Python, Go', 'Lógica de negócio', 'Auto-scaling'],
                ['Database', 'PostgreSQL, Redis', 'Persistência de dados', 'Sharding'],
                ['AI Layer', 'Ollama, TensorFlow', 'Inteligência artificial', 'GPU clusters'],
                ['Monitoring', 'Prometheus, Grafana', 'Observabilidade', 'Multi-região']
              ]
            }
          ]
        },
        {
          title: 'INFRAESTRUTURA DE BASE (8 STACKS)',
          content: [
            'A infraestrutura base da KRYONIX é composta por 8 stacks tecnológicos fundamentais que garantem a operação robusta e segura da plataforma.'
          ],
          lists: [
            {
              title: 'Componentes Principais:',
              items: [
                'Traefik Proxy Reverso: SSL automático, roteamento inteligente, load balancing',
                'PostgreSQL Database: Multi-tenant, otimizado para mobile, backup automático',
                'Redis Cache: Cache distribuído, sessões, pub/sub para tempo real',
                'MinIO Object Storage: Compatível S3, armazenamento distribuído',
                'Docker Containerization: Isolamento, portabilidade, eficiência',
                'RabbitMQ Message Queue: Comunicação assíncrona, reliability',
                'Nginx Load Balancer: Distribuição de carga, SSL termination',
                'Portainer Management: Interface visual para containers'
              ]
            }
          ]
        },
        {
          title: 'CAMADA DE INTELIGÊNCIA ARTIFICIAL (6 STACKS)',
          content: [
            'A IA é o coração da KRYONIX, com 15 agentes especializados operando 24/7 para automatizar processos complexos.'
          ],
          tables: [
            {
              headers: ['Componente IA', 'Função', 'Modelos Utilizados', 'Performance'],
              rows: [
                ['Ollama LLM', 'Processamento linguagem natural local', 'Llama 2, CodeLlama, Mistral', '1000+ req/min'],
                ['Dify AI Platform', 'Chatbots conversacionais', 'GPT-4, Claude, custom', '500 conversas simultâneas'],
                ['LangFlow', 'Workflows visuais de IA', 'Chain of thought, RAG', 'Sub-segundo response'],
                ['TensorFlow Serving', 'Machine learning inference', 'Custom models, scikit-learn', 'Batch + streaming'],
                ['Jupyter Notebooks', 'Desenvolvimento e treinamento ML', 'PyTorch, pandas, numpy', 'GPU acceleration'],
                ['Vector Database', 'Embeddings e busca semântica', 'OpenAI, Sentence Transformers', 'Milhões de vetores']
              ]
            }
          ]
        },
        {
          title: 'APLICAÇÕES SAAS INTEGRADAS (8 STACKS)',
          content: [
            'Conjunto de aplicações SaaS pré-integradas que formam o core da plataforma KRYONIX.'
          ],
          lists: [
            {
              title: 'Aplicações Core:',
              items: [
                'Evolution API: WhatsApp Business oficial, multi-instância, webhooks',
                'Chatwoot: Atendimento omnichannel, chat unificado, team collaboration',
                'N8N: Automação workflow, 200+ integrações nativas, visual editor',
                'Mautic: Marketing automation, lead nurturing, campaign management',
                'Metabase: Business Intelligence, dashboards executivos, SQL query',
                'Typebot: Chatbots conversacionais, fluxos visuais, integração WhatsApp',
                'CRM Kryonix: Sistema próprio otimizado para mobile e IA',
                'Email Marketing Kryonix: Editor drag-drop, A/B testing automático'
              ]
            }
          ]
        },
        {
          title: 'MONITORAMENTO E OBSERVABILIDADE (4 STACKS)',
          content: [
            'Sistema completo de monitoramento proativo com alertas inteligentes e métricas em tempo real.'
          ],
          tables: [
            {
              headers: ['Stack', 'Função', 'Métricas Coletadas', 'Alertas'],
              rows: [
                ['Prometheus', 'Coleta métricas', 'CPU, RAM, disco, rede, app metrics', 'Threshold customizável'],
                ['Grafana', 'Visualização', 'Dashboards executivos, técnicos', 'Email, Slack, WhatsApp'],
                ['Jaeger', 'Tracing distribuído', 'Request flow, latência, errors', 'Performance degradation'],
                ['Elasticsearch + Kibana', 'Logs centralizados', 'Application logs, audit trail', 'Error patterns']
              ]
            }
          ]
        },
        {
          title: 'SEGURANÇA E COMPLIANCE (3 STACKS)',
          content: [
            'Implementação de segurança em múltiplas camadas seguindo melhores práticas da indústria.'
          ],
          lists: [
            {
              title: 'Componentes de Segurança:',
              items: [
                'Keycloak Identity Management: SSO, OAuth2, SAML, multi-factor auth',
                'HashiCorp Vault: Gestão de secrets, rotação automática, audit trail',
                'Fail2Ban Security: Proteção contra ataques, IP blocking, rate limiting'
              ]
            },
            {
              title: 'Compliance e Certificações:',
              items: [
                'LGPD: Consentimento, portabilidade, esquecimento, auditoria',
                'ISO 27001: Information Security Management System',
                'SOC 2 Type II: Security, availability, integrity controls',
                'OWASP Top 10: Protection against web vulnerabilities',
                'PCI DSS: Payment card industry security standards'
              ]
            }
          ]
        },
        {
          title: 'MULTI-TENANCY E ISOLAMENTO',
          content: [
            'Estratégia avançada de multi-tenancy com isolamento completo de dados e recursos por cliente.'
          ],
          tables: [
            {
              headers: ['Nível de Isolamento', 'Implementação', 'Recursos Isolados', 'Benefícios'],
              rows: [
                ['Database', 'Schema separation', 'Dados, configurações, logs', 'Privacy, performance'],
                ['Application', 'Tenant context', 'Features, branding, workflows', 'Customização total'],
                ['Infrastructure', 'Resource quotas', 'CPU, RAM, storage, network', 'SLA garantido'],
                ['Security', 'Access controls', 'Users, roles, permissions', 'Zero data leakage']
              ]
            }
          ]
        },
        {
          title: 'APIs E SDK UNIFICADO',
          content: [
            'Conjunto completo de APIs RESTful e GraphQL com SDK unificado para facilitar integrações.'
          ],
          lists: [
            {
              title: 'APIs Principais:',
              items: [
                'Authentication API: Login, logout, tokens, permissions',
                'CRM API: Contacts, companies, deals, activities',
                'WhatsApp API: Messages, media, groups, business tools',
                'Marketing API: Campaigns, emails, segments, analytics',
                'Analytics API: Metrics, reports, dashboards, insights',
                'Integration API: Webhooks, third-party connectors',
                'AI API: Chat completion, embeddings, predictions',
                'Admin API: Tenant management, billing, system config'
              ]
            }
          ]
        },
        {
          title: 'PERFORMANCE E ESCALABILIDADE',
          content: [
            'Métricas de performance e estratégias de escalabilidade para suportar crescimento exponencial.'
          ],
          tables: [
            {
              headers: ['Métrica', 'Target Current', 'Scale Limit', 'Optimization Strategy'],
              rows: [
                ['Response Time', '< 200ms', '< 500ms', 'CDN, cache, optimization'],
                ['Throughput', '10K req/min', '100K req/min', 'Horizontal scaling'],
                ['Concurrent Users', '50K', '500K', 'Load balancing, clustering'],
                ['Data Storage', '10TB', '1PB', 'Sharding, archiving'],
                ['AI Processing', '1K inferences/sec', '10K inferences/sec', 'GPU scaling'],
                ['Uptime', '99.9%', '99.99%', 'Multi-region, redundancy']
              ]
            }
          ]
        },
        {
          title: 'DISASTER RECOVERY E BACKUP',
          content: [
            'Estratégia completa de backup e disaster recovery para garantir continuidade do negócio.'
          ],
          lists: [
            {
              title: 'Backup Strategy:',
              items: [
                'Backup incremental diário automatizado',
                'Backup full semanal com retenção de 90 dias',
                'Replicação cross-region em tempo real',
                'Point-in-time recovery para últimas 24 horas',
                'Backup de configurações e secrets',
                'Teste de restore automático mensal'
              ]
            },
            {
              title: 'Disaster Recovery:',
              items: [
                'RTO (Recovery Time Objective): 4 horas',
                'RPO (Recovery Point Objective): 15 minutos',
                'Failover automático multi-região',
                'Runbook documentado e testado',
                'Communication plan para stakeholders',
                'Business continuity procedures'
              ]
            }
          ]
        }
      ]
    }
  }
}

// Funções de conveniência para uso direto
export const generateCommercialProposalPDF = (language: string = 'pt') => {
  const generator = new PDFGenerator()
  generator.generateCommercialProposal(language)
}

export const generateTechnicalDocumentationPDF = (language: string = 'pt') => {
  const generator = new PDFGenerator()
  generator.generateTechnicalDocumentation(language)
}
