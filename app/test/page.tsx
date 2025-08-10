export const dynamic = 'force-static';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ✅ KRYONIX Funcionando!
        </h1>
        <p className="text-gray-600 mb-6">
          Esta página confirma que o servidor Next.js está operacional.
        </p>
        <div className="space-y-3">
          <div className="bg-green-100 p-3 rounded-lg">
            <div className="font-semibold text-green-800">Status do Servidor</div>
            <div className="text-green-600">🟢 Online</div>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <div className="font-semibold text-blue-800">Builder.io Headers</div>
            <div className="text-blue-600">✅ Configurados</div>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <div className="font-semibold text-purple-800">Routing</div>
            <div className="text-purple-600">🔧 Em correção</div>
          </div>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          📅 {new Date().toLocaleString('pt-BR')}
        </div>
      </div>
    </div>
  )
}
