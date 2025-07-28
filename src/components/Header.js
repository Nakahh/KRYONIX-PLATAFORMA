import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo KRYONIX */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              KRYONIX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Início
            </Link>
            <a href="#modulos" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Módulos
            </a>
            <a href="#combos" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Combos
            </a>
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Dashboard
            </Link>
            <button className="btn-primary">
              🚀 Testar Grátis 7 Dias
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
                Início
              </Link>
              <a href="#modulos" className="text-gray-700 hover:text-blue-600 font-medium">
                Módulos
              </a>
              <a href="#combos" className="text-gray-700 hover:text-blue-600 font-medium">
                Combos
              </a>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
              <button className="btn-primary w-full">
                🚀 Testar Grátis 7 Dias
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
