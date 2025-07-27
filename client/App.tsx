import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import WhiteLabelProvider from "./components/white-label/WhiteLabelProvider";

// Páginas principais
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import NotFound from "./pages/NotFound";

// Páginas de analytics
import Analytics from "./pages/Analytics";
import WhatsAppAnalytics from "./pages/WhatsAppAnalytics";

// Páginas de campanha e broadcast
import WhatsAppBroadcast from "./pages/WhatsAppBroadcast";

// Páginas de configuração de stacks
import StackConfig from "./pages/StackConfig";

// Páginas de workflows e automação
// TODO: Implementar estas páginas
// import N8NWorkflows from './pages/N8NWorkflows';
// import TypebotFlows from './pages/TypebotFlows';

// Páginas de autenticação
import Register from "./pages/Register";
// Páginas white-label
import WhiteLabel from "./pages/WhiteLabel";
import WhiteLabelSystem from "./pages/WhiteLabelSystem";
import Profile from "./pages/Profile";
import Security from "./pages/Security";
import Users from "./pages/Users";

// Páginas de gerenciamento de stacks
import StacksManager from "./pages/StacksManager";
import RealTimeDashboard from "./pages/RealTimeDashboard";
import AIAutonomousManager from "./pages/AIAutonomousManager";

// Páginas de analytics avançado
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import IntelligentReports from "./pages/IntelligentReports";

// Páginas de gestão de usuários
import UserManagement from "./pages/UserManagement";
import TeamCollaboration from "./pages/TeamCollaboration";

// Páginas de orquestração
import StackOrchestration from "./pages/StackOrchestration";

// Páginas de comunicação omnichannel
import CommunicationCenter from "./pages/CommunicationCenter";
import WhatsAppBusiness from "./pages/WhatsAppBusiness";
import EmailMarketing from "./pages/EmailMarketing";

// Páginas Enterprise
import Enterprise from "./pages/Enterprise";
import EnterpriseAnalytics from "./pages/EnterpriseAnalytics";

// TODO: Implementar outras páginas auth
// import ForgotPassword from './pages/ForgotPassword';
// import ResetPassword from './pages/ResetPassword';

// Páginas de configurações globais
import GlobalSettings from "./pages/GlobalSettings";

// Visual Stack Builder
import StackVisualBuilder from "./pages/StackVisualBuilder";

// Páginas de gestão de IA
import OllamaModelsManager from "./pages/OllamaModelsManager";

// Onboarding brasileiro
import BrazilianOnboarding from "./components/onboarding/BrazilianOnboarding";

// PWA avançado
import EnhancedPWAInstall from "./components/mobile/EnhancedPWAInstall";

function App() {
  return (
    <WhiteLabelProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Página inicial */}
            <Route path="/" element={<Index />} />
            {/* Autenticação */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* TODO: Implementar outras páginas auth
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/verify-email" element={<EmailVerification />} />
            <Route path="/auth/two-factor" element={<TwoFactorSetup />} />
            */}
            {/* Dashboard principal */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/dashboard/stacks/:stackType"
              element={<StackConfig />}
            />
            {/* Analytics e relatórios */}
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/whatsapp/analytics" element={<WhatsAppAnalytics />} />
            <Route path="/billing/analytics" element={<Analytics />} />{" "}
            {/* Redirect para analytics geral por enquanto */}
            {/* WhatsApp funcionalidades */}
            <Route path="/whatsapp/broadcast" element={<WhatsAppBroadcast />} />
            {/* Onboarding brasileiro */}
            <Route path="/onboarding" element={<BrazilianOnboarding />} />
            {/* White Label e Personalização */}
            <Route path="/white-label" element={<WhiteLabel />} />
            <Route path="/white-label-system" element={<WhiteLabelSystem />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/security" element={<Security />} />
            <Route path="/users" element={<Users />} />
            {/* Gerenciamento de Stacks */}
            <Route path="/stacks" element={<StacksManager />} />
            <Route
              path="/stacks/visual-builder"
              element={<StackVisualBuilder />}
            />
            <Route
              path="/dashboard/real-time"
              element={<RealTimeDashboard />}
            />
            <Route path="/ai/autonomous" element={<AIAutonomousManager />} />
            <Route path="/ai/models" element={<OllamaModelsManager />} />
            {/* Analytics Avançado */}
            <Route path="/analytics/advanced" element={<AdvancedAnalytics />} />
            <Route
              path="/reports/intelligent"
              element={<IntelligentReports />}
            />
            {/* Gestão de Usuários */}
            <Route path="/users/management" element={<UserManagement />} />
            <Route path="/team/collaboration" element={<TeamCollaboration />} />
            {/* Orquestração Inteligente */}
            <Route path="/orchestration" element={<StackOrchestration />} />
            {/* Comunicação Omnichannel */}
            <Route path="/communication" element={<CommunicationCenter />} />
            <Route path="/whatsapp/business" element={<WhatsAppBusiness />} />
            <Route path="/email/marketing" element={<EmailMarketing />} />
            {/* Recursos Enterprise */}
            <Route path="/enterprise" element={<Enterprise />} />
            <Route
              path="/enterprise/analytics"
              element={<EnterpriseAnalytics />}
            />
            {/* Configurações e billing */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/global-settings" element={<GlobalSettings />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/billing/plans" element={<Billing />} />{" "}
            {/* Redirect para billing por enquanto */}
            {/* Workflows e automação */}
            {/* TODO: Implementar estas rotas quando as páginas estiverem prontas
            <Route path="/n8n/workflows" element={<N8NWorkflows />} />
            <Route path="/workflows/new" element={<N8NWorkflows />} />
            <Route path="/typebot/flows" element={<TypebotFlows />} />
            */}
            {/* Rotas temporárias que redirecionam para dashboard */}
            <Route path="/n8n/workflows" element={<Dashboard />} />
            <Route path="/workflows/new" element={<Dashboard />} />
            <Route path="/typebot/flows" element={<Dashboard />} />
            <Route path="/actions" element={<Dashboard />} />
            {/* 404 - Página não encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

        {/* Toaster para notificações */}
        <Toaster />

        {/* PWA Install Brasileiro */}
        <EnhancedPWAInstall />
      </Router>
    </WhiteLabelProvider>
  );
}

export default App;
