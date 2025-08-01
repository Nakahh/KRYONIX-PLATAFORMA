import Image from 'next/image'

interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
}

export default function Logo({ size = 40, showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Image 
        src="/logo-kryonix.png" 
        alt="KRYONIX Logo" 
        width={size} 
        height={size} 
        className="rounded-lg"
      />
      {showText && (
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">KRYONIX</h1>
          <p className="text-xs text-gray-600">Plataforma SaaS 100% Autônoma por IA</p>
        </div>
      )}
    </div>
  )
}
