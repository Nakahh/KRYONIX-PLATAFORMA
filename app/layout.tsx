import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>KRYONIX Platform</title>
        <meta name="description" content="Plataforma SaaS 100% Autônoma por IA" />
      </head>
      <body className="bg-white">{children}</body>
    </html>
  )
}
