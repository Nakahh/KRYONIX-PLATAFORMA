import React from 'react';

const TestComponent = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          🚀 KRYONIX
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Plataforma SaaS 100% Autônoma por IA
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Sistema Funcionando!</h2>
          <div className="flex items-center justify-center space-x-4">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 font-medium">Online</span>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between">
              <span>React:</span>
              <span className="text-green-600">✓ Ativo</span>
            </div>
            <div className="flex justify-between">
              <span>Tailwind CSS:</span>
              <span className="text-green-600">✓ Carregado</span>
            </div>
            <div className="flex justify-between">
              <span>Router:</span>
              <span className="text-green-600">✓ Funcionando</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
