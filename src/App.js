import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ModulosSection from './components/ModulosSection';
import CombosSection from './components/CombosSection';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Header />
        
        <Routes>
          <Route path="/" element={
            <main>
              <Hero />
              <ModulosSection />
              <CombosSection />
            </main>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
