import { redirect } from 'next/navigation';

// Root page for Builder.io compatibility
// Redirects to default locale while allowing Builder.io access
export default function RootPage() {
  // Allow Builder.io to access this page
  const isBuilderPreview = typeof window !== 'undefined' && 
    (window.location.href.includes('builder.io') || 
     window.location.href.includes('builder-preview'));

  if (!isBuilderPreview) {
    redirect('/pt-br');
  }

  // Fallback content for Builder.io
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            KRYONIX Platform
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Plataforma SaaS 100% Autônoma por IA
          </p>
          <div className="space-y-4">
            <a 
              href="/pt-br" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Português (Brasil)
            </a>
            <a 
              href="/en" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 ml-4"
            >
              English
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
