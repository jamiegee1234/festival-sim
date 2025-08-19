import { useState, useCallback, useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import ApiService from '@/services/api';
import type {
  Festival,
  SimulationState,
  FestivalMetrics,
  FestivalFormData,
  EventInjection,
  Alert,
  Incident
} from '@/types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<T | null>;
  mutate: (newData: T) => void;
  reset: () => void;
}

// Generic hook for API calls with state management
export function useApi<T>(
  apiCall: () => Promise<T>,
  initialFetch = false,
  deps: any[] = []
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
  });

  const fetch = useCallback(async (): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({
        data,
        loading: false,
        error: null,
        lastFetch: new Date(),
      });
      return data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'An error occurred';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [apiCall]);

  const mutate = useCallback((newData: T) => {
    setState(prev => ({
      ...prev,
      data: newData,
      lastFetch: new Date(),
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastFetch: null,
    });
  }, []);

  useEffect(() => {
    if (initialFetch) {
      fetch();
    }
  }, deps);

  return {
    ...state,
    refetch: fetch,
    mutate,
    reset,
  };
}

// Specific hooks for different API endpoints
export const useSimulationState = (autoFetch = true) => {
  return useApi<SimulationState>(ApiService.getSimulationState, autoFetch);
};

export const useCurrentFestival = (autoFetch = true) => {
  return useApi<Festival>(ApiService.getCurrentFestival, autoFetch);
};

export const useFestivalMetrics = (autoFetch = true) => {
  return useApi<FestivalMetrics>(ApiService.getMetrics, autoFetch);
};

export const useFestivalTemplates = (autoFetch = false) => {
  return useApi(ApiService.getFestivalTemplates, autoFetch);
};

// Hook for simulation controls with loading states
export const useSimulationControls = () => {
  const store = useSimulationStore();
  const [loading, setLoading] = useState({
    start: false,
    pause: false,
    resume: false,
    stop: false,
    reset: false,
  });

  const startSimulation = useCallback(async () => {
    setLoading(prev => ({ ...prev, start: true }));
    store.setError(null);
    
    try {
      await ApiService.startSimulation();
      store.setIsRunning(true);
    } catch (error: any) {
      store.setError(error?.response?.data?.error || 'Failed to start simulation');
    } finally {
      setLoading(prev => ({ ...prev, start: false }));
    }
  }, [store]);

  const pauseSimulation = useCallback(async () => {
    setLoading(prev => ({ ...prev, pause: true }));
    store.setError(null);
    
    try {
      await ApiService.pauseSimulation();
      store.setIsRunning(false);
    } catch (error: any) {
      store.setError(error?.response?.data?.error || 'Failed to pause simulation');
    } finally {
      setLoading(prev => ({ ...prev, pause: false }));
    }
  }, [store]);

  const resumeSimulation = useCallback(async () => {
    setLoading(prev => ({ ...prev, resume: true }));
    store.setError(null);
    
    try {
      await ApiService.resumeSimulation();
      store.setIsRunning(true);
    } catch (error: any) {
      store.setError(error?.response?.data?.error || 'Failed to resume simulation');
    } finally {
      setLoading(prev => ({ ...prev, resume: false }));
    }
  }, [store]);

  const stopSimulation = useCallback(async () => {
    setLoading(prev => ({ ...prev, stop: true }));
    store.setError(null);
    
    try {
      await ApiService.stopSimulation();
      store.setIsRunning(false);
    } catch (error: any) {
      store.setError(error?.response?.data?.error || 'Failed to stop simulation');
    } finally {
      setLoading(prev => ({ ...prev, stop: false }));
    }
  }, [store]);

  const resetSimulation = useCallback(async () => {
    setLoading(prev => ({ ...prev, reset: true }));
    store.setError(null);
    
    try {
      await ApiService.resetSimulation();
      store.clearData();
    } catch (error: any) {
      store.setError(error?.response?.data?.error || 'Failed to reset simulation');
    } finally {
      setLoading(prev => ({ ...prev, reset: false }));
    }
  }, [store]);

  return {
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    resetSimulation,
    loading,
  };
};

// Hook for festival management
export const useFestivalManager = () => {
  const store = useSimulationStore();
  const [creating, setCreating] = useState(false);

  const createFestival = useCallback(async (festivalData: FestivalFormData) => {
    setCreating(true);
    store.setError(null);
    
    try {
      const response = await ApiService.createFestival(festivalData);
      if (response.data) {
        store.setFestival(response.data);
      }
      return response;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Failed to create festival';
      store.setError(errorMessage);
      throw error;
    } finally {
      setCreating(false);
    }
  }, [store]);

  const createFromTemplate = useCallback(async (
    templateId: string, 
    customizations: Partial<FestivalFormData>
  ) => {
    setCreating(true);
    store.setError(null);
    
    try {
      const response = await ApiService.createFestivalFromTemplate(templateId, customizations);
      if (response.data) {
        store.setFestival(response.data);
      }
      return response;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Failed to create festival from template';
      store.setError(errorMessage);
      throw error;
    } finally {
      setCreating(false);
    }
  }, [store]);

  return {
    createFestival,
    createFromTemplate,
    creating,
  };
};

// Hook for admin functions
export const useAdminTools = () => {
  const store = useSimulationStore();
  const [injecting, setInjecting] = useState(false);

  const injectEvent = useCallback(async (eventData: EventInjection) => {
    setInjecting(true);
    store.setError(null);
    
    try {
      const response = await ApiService.injectEvent(eventData);
      return response;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Failed to inject event';
      store.setError(errorMessage);
      throw error;
    } finally {
      setInjecting(false);
    }
  }, [store]);

  const eventTypes = useApi(ApiService.getEventTypes, false);
  const systemStatus = useApi(ApiService.getSystemStatus, false);
  const debugInfo = useApi(ApiService.getDebugInfo, false);

  return {
    injectEvent,
    injecting,
    eventTypes,
    systemStatus,
    debugInfo,
  };
};

// Hook for alerts and incidents management
export const useAlertsManager = () => {
  const store = useSimulationStore();

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await ApiService.getAlerts();
      store.updateSimulationState({ 
        alerts: data.alerts,
        incidents: data.incidents 
      });
      return data;
    } catch (error: any) {
      console.error('Failed to fetch alerts:', error);
      return { alerts: [], incidents: [] };
    }
  }, [store]);

  const dismissAlert = useCallback((alertId: string) => {
    store.dismissAlert(alertId);
  }, [store]);

  const toggleIncidentSelection = useCallback((incidentId: string) => {
    store.toggleSelectedIncident(incidentId);
  }, [store]);

  return {
    fetchAlerts,
    dismissAlert,
    toggleIncidentSelection,
  };
};

// Hook for metrics with auto-refresh
export const useMetricsRefresh = (refreshInterval = 5000, enabled = true) => {
  const store = useSimulationStore();
  const [refreshing, setRefreshing] = useState(false);

  const refreshMetrics = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      const metrics = await ApiService.getMetrics();
      store.updateMetrics(metrics);
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    } finally {
      setRefreshing(false);
    }
  }, [store, refreshing]);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(refreshMetrics, refreshInterval);
    
    // Initial fetch
    refreshMetrics();

    return () => clearInterval(interval);
  }, [refreshMetrics, refreshInterval, enabled]);

  return {
    refreshMetrics,
    refreshing,
  };
};

export default useApi;