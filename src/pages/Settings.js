import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Globe,
  LogOut,
  Edit,
  Save,
  X,
  Sun,
  Moon,
  Monitor,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, logout, updateProfile } = useAuth();
  const { isDark, setTheme, getCurrentTheme } = useTheme();
  const { permission, requestPermission } = useNotifications();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || ''
  });

  const handleProfileUpdate = async () => {
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setIsEditingProfile(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const handleNotificationPermission = async () => {
    await requestPermission();
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  const SettingSection = ({ icon: Icon, title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-kryonix-100 dark:bg-kryonix-900/30 rounded-xl flex items-center justify-center">
            <Icon size={20} className="text-kryonix-600 dark:text-kryonix-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const SettingItem = ({ title, description, action, danger = false }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <h4 className={`font-medium ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
          {title}
        </h4>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="ml-4">
        {action}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
              <SettingsIcon size={20} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Configurações
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gerencie sua conta e preferências
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Profile Settings */}
        <SettingSection icon={User} title="Perfil">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-kryonix-600 to-kryonix-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {user?.name || 'Usuário'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {isEditingProfile ? <X size={20} /> : <Edit size={20} />}
              </button>
            </div>

            {isEditingProfile && (
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="input-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="input-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="input-primary"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                    className="input-primary"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleProfileUpdate}
                    className="btn-primary flex items-center"
                  >
                    <Save size={16} className="mr-2" />
                    Salvar
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </SettingSection>

        {/* Theme Settings */}
        <SettingSection icon={Palette} title="Aparência">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Tema da interface
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', icon: Sun, label: 'Claro' },
                { value: 'dark', icon: Moon, label: 'Escuro' },
                { value: 'system', icon: Monitor, label: 'Sistema' }
              ].map(theme => {
                const Icon = theme.icon;
                const isActive = getCurrentTheme() === theme.value;
                
                return (
                  <button
                    key={theme.value}
                    onClick={() => setTheme(theme.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? 'border-kryonix-600 bg-kryonix-50 dark:bg-kryonix-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon size={24} className={`mx-auto mb-2 ${
                      isActive ? 'text-kryonix-600' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-kryonix-600' : 'text-gray-900 dark:text-white'
                    }`}>
                      {theme.label}
                    </p>
                    {isActive && (
                      <div className="mt-2">
                        <Check size={16} className="mx-auto text-kryonix-600" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </SettingSection>

        {/* Notifications */}
        <SettingSection icon={Bell} title="Notificações">
          <div className="space-y-3">
            <SettingItem
              title="Notificações do navegador"
              description="Receba alertas mesmo quando não estiver na plataforma"
              action={
                <button
                  onClick={handleNotificationPermission}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    permission === 'granted'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  disabled={permission === 'granted'}
                >
                  {permission === 'granted' ? 'Ativo' : 'Habilitar'}
                </button>
              }
            />
            
            <SettingItem
              title="Notificações de WhatsApp"
              description="Alertas para novas mensagens e conversas"
              action={
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-kryonix-600 bg-gray-100 border-gray-300 rounded focus:ring-kryonix-500"
                  />
                </div>
              }
            />
            
            <SettingItem
              title="Relatórios diários"
              description="Resumo diário das suas métricas por e-mail"
              action={
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-kryonix-600 bg-gray-100 border-gray-300 rounded focus:ring-kryonix-500"
                  />
                </div>
              }
            />
          </div>
        </SettingSection>

        {/* Language & Region */}
        <SettingSection icon={Globe} title="Idioma e Região">
          <div className="space-y-3">
            <SettingItem
              title="Idioma"
              description="Português (Brasil)"
              action={
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Padrão
                </span>
              }
            />
            
            <SettingItem
              title="Fuso horário"
              description="GMT-3 (Brasília)"
              action={
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Automático
                </span>
              }
            />
          </div>
        </SettingSection>

        {/* Security */}
        <SettingSection icon={Shield} title="Segurança">
          <div className="space-y-3">
            <SettingItem
              title="Alterar senha"
              description="Atualize sua senha regularmente para maior segurança"
              action={
                <button className="text-kryonix-600 hover:text-kryonix-700 text-sm font-medium">
                  Alterar
                </button>
              }
            />
            
            <SettingItem
              title="Autenticação em duas etapas"
              description="Adicione uma camada extra de segurança"
              action={
                <button className="text-kryonix-600 hover:text-kryonix-700 text-sm font-medium">
                  Configurar
                </button>
              }
            />
            
            <SettingItem
              title="Sessões ativas"
              description="Gerencie dispositivos conectados à sua conta"
              action={
                <button className="text-kryonix-600 hover:text-kryonix-700 text-sm font-medium">
                  Ver todas
                </button>
              }
            />
          </div>
        </SettingSection>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-red-200 dark:border-red-800">
          <div className="p-6 border-b border-red-200 dark:border-red-800">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
              Zona de Perigo
            </h3>
          </div>
          <div className="p-6">
            <SettingItem
              title="Sair da conta"
              description="Desconectar de todos os dispositivos"
              danger={true}
              action={
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <LogOut size={16} className="mr-2" />
                  Sair
                </button>
              }
            />
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
          <p>KRYONIX v1.0.0</p>
          <p className="mt-1">© 2025 Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
