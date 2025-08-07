import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiResponse } from '../lib/api/client';

export function useApi<T>(endpoint: string, immediate: boolean = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await apiClient.get<T>(endpoint);
    
    if (response.success && response.data) {
      setData(response.data);
    } else {
      setError(response.error || 'Failed to fetch data');
    }
    
    setLoading(false);
  }, [endpoint]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

export function useApiMutation<T, U = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (
    method: 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: U
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    let response: ApiResponse<T>;

    switch (method) {
      case 'POST':
        response = await apiClient.post<T>(endpoint, data);
        break;
      case 'PUT':
        response = await apiClient.put<T>(endpoint, data);
        break;
      case 'DELETE':
        response = await apiClient.delete<T>(endpoint);
        break;
    }

    if (response.success) {
      setLoading(false);
      return response.data || null;
    } else {
      setError(response.error || 'Mutation failed');
      setLoading(false);
      return null;
    }
  }, []);

  return {
    loading,
    error,
    mutate
  };
}

// Hook específico para autenticação
export function useAuth() {
  return useApi<{
    authenticated: boolean;
    user?: any;
    token?: string;
  }>('/api/auth/me', false);
}

// Hook para status da plataforma
export function usePlatformStatus() {
  return useApi<{
    platform: string;
    status: string;
    environment: string;
    dependencies: Record<string, string>;
    modules: Record<string, string>;
  }>('/api/status');
}
