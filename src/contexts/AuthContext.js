import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Verificar token no localStorage ao carregar
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('kryonix_token');
        const userData = localStorage.getItem('kryonix_user');
        
        if (token && userData) {
          // Verificar se o token ainda é válido
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const user = JSON.parse(userData);
            setUser(user);
            setIsAuthenticated(true);
          } else {
            // Token inválido, limpar localStorage
            localStorage.removeItem('kryonix_token');
            localStorage.removeItem('kryonix_user');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('kryonix_token');
        localStorage.removeItem('kryonix_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Salvar token e dados do usuário
        localStorage.setItem('kryonix_token', data.token);
        localStorage.setItem('kryonix_user', JSON.stringify(data.user));
        
        setUser(data.user);
        setIsAuthenticated(true);
        
        toast.success(`Bem-vindo, ${data.user.name}! 🎉`);
        navigate('/dashboard');
        
        return { success: true };
      } else {
        toast.error(data.message || 'Erro ao fazer login');
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro de conexão. Tente novamente.');
      return { success: false, error: 'Erro de conexão' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('kryonix_token');
    localStorage.removeItem('kryonix_user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
    toast.success('Logout realizado com sucesso! 👋');
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Cadastro realizado com sucesso! Faça login para continuar.');
        navigate('/login');
        return { success: true };
      } else {
        toast.error(data.message || 'Erro ao criar conta');
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      toast.error('Erro de conexão. Tente novamente.');
      return { success: false, error: 'Erro de conexão' };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('kryonix_token');
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('kryonix_user', JSON.stringify(data.user));
        setUser(data.user);
        toast.success('Perfil atualizado com sucesso! ✅');
        return { success: true };
      } else {
        toast.error(data.message || 'Erro ao atualizar perfil');
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro de conexão. Tente novamente.');
      return { success: false, error: 'Erro de conexão' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
