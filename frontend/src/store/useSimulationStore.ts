import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Festival,
  SimulationState,
  FestivalMetrics,
  Incident,
  Alert,
  WeatherCondition,
  FestivalStatus,
  UserPreferences,
  DashboardView,
  MapView
} from '@/types';

interface SimulationStore {
  // Connection state
  isConnected: boolean;
  connectionId?: string;
  
  // Simulation state
  festival: Festival | null;
  metrics: FestivalMetrics | null;
  incidents: Incident[];
  alerts: Alert[];
  status: FestivalStatus;
  currentTime: string | null;
  isRunning: boolean;
  connectedClients: number;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // Dashboard configuration
  dashboardView: DashboardView;
  mapView: MapView;
  selectedIncidents: string[];
  notificationSound: boolean;
  
  // Actions
  setConnectionState: (connected: boolean, connectionId?: string) => void;
  updateSimulationState: (state: Partial<SimulationState>) => void;
  updateMetrics: (metrics: Partial<FestivalMetrics>) => void;
  addIncident: (incident: Incident) => void;
  updateIncident: (incidentId: string, updates: Partial<Incident>) => void;
  addAlert: (alert: Alert) => void;
  dismissAlert: (alertId: string) => void;
  setFestival: (festival: Festival) => void;
  setStatus: (status: FestivalStatus) => void;
  setIsRunning: (isRunning: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateDashboardView: (view: Partial<DashboardView>) => void;
  updateMapView: (view: Partial<MapView>) => void;
  toggleSelectedIncident: (incidentId: string) => void;
  clearData: () => void;
}

const defaultDashboardView: DashboardView = {
  layout: 'grid',
  selectedMetrics: ['attendance', 'financial', 'safety', 'operational'],
  timeRange: '1h',
  refreshRate: 5000,
};

const defaultMapView: MapView = {
  zoom: 1,
  center: { x: 0, y: 0 },
  selectedElements: [],
  showHeatmap: false,
  heatmapType: 'crowd',
  layers: {
    venues: true,
    artists: true,
    vendors: true,
    incidents: true,
    staff: true,
  },
};

export const useSimulationStore = create<SimulationStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial connection state
        isConnected: false,
        connectionId: undefined,
        
        // Initial simulation state
        festival: null,
        metrics: null,
        incidents: [],
        alerts: [],
        status: 'Planning',
        currentTime: null,
        isRunning: false,
        connectedClients: 0,
        
        // Initial UI state
        isLoading: false,
        error: null,
        lastUpdated: null,
        
        // Initial dashboard configuration
        dashboardView: defaultDashboardView,
        mapView: defaultMapView,
        selectedIncidents: [],
        notificationSound: true,
        
        // Actions
        setConnectionState: (connected, connectionId) => set((state) => ({
          isConnected: connected,
          connectionId,
          error: connected ? null : state.error,
        }), false, 'setConnectionState'),

        updateSimulationState: (newState) => set((state) => {
          const updates: Partial<SimulationStore> = {
            lastUpdated: new Date().toISOString(),
          };
          
          if (newState.festival) {
            updates.festival = newState.festival;
          }
          if (newState.metrics) {
            updates.metrics = newState.metrics;
          }
          if (newState.incidents) {
            updates.incidents = newState.incidents;
          }
          if (newState.alerts) {
            updates.alerts = newState.alerts;
          }
          if (newState.status) {
            updates.status = newState.status;
          }
          if (newState.currentTime) {
            updates.currentTime = newState.currentTime;
          }
          if (typeof newState.isRunning === 'boolean') {
            updates.isRunning = newState.isRunning;
          }
          if (typeof newState.connectedClients === 'number') {
            updates.connectedClients = newState.connectedClients;
          }
          
          return updates;
        }, false, 'updateSimulationState'),

        updateMetrics: (newMetrics) => set((state) => ({
          metrics: state.metrics ? { ...state.metrics, ...newMetrics } : newMetrics as FestivalMetrics,
          lastUpdated: new Date().toISOString(),
        }), false, 'updateMetrics'),

        addIncident: (incident) => set((state) => ({
          incidents: [...state.incidents, incident],
          lastUpdated: new Date().toISOString(),
        }), false, 'addIncident'),

        updateIncident: (incidentId, updates) => set((state) => ({
          incidents: state.incidents.map(incident =>
            incident.id === incidentId ? { ...incident, ...updates } : incident
          ),
          lastUpdated: new Date().toISOString(),
        }), false, 'updateIncident'),

        addAlert: (alert) => set((state) => ({
          alerts: [...state.alerts, alert],
          lastUpdated: new Date().toISOString(),
        }), false, 'addAlert'),

        dismissAlert: (alertId) => set((state) => ({
          alerts: state.alerts.filter(alert => alert.id !== alertId),
        }), false, 'dismissAlert'),

        setFestival: (festival) => set(() => ({
          festival,
          lastUpdated: new Date().toISOString(),
        }), false, 'setFestival'),

        setStatus: (status) => set(() => ({
          status,
          lastUpdated: new Date().toISOString(),
        }), false, 'setStatus'),

        setIsRunning: (isRunning) => set(() => ({
          isRunning,
          lastUpdated: new Date().toISOString(),
        }), false, 'setIsRunning'),

        setLoading: (isLoading) => set(() => ({
          isLoading,
        }), false, 'setLoading'),

        setError: (error) => set(() => ({
          error,
          isLoading: false,
        }), false, 'setError'),

        updateDashboardView: (view) => set((state) => ({
          dashboardView: { ...state.dashboardView, ...view },
        }), false, 'updateDashboardView'),

        updateMapView: (view) => set((state) => ({
          mapView: { ...state.mapView, ...view },
        }), false, 'updateMapView'),

        toggleSelectedIncident: (incidentId) => set((state) => {
          const isSelected = state.selectedIncidents.includes(incidentId);
          return {
            selectedIncidents: isSelected
              ? state.selectedIncidents.filter(id => id !== incidentId)
              : [...state.selectedIncidents, incidentId]
          };
        }, false, 'toggleSelectedIncident'),

        clearData: () => set(() => ({
          festival: null,
          metrics: null,
          incidents: [],
          alerts: [],
          status: 'Planning',
          currentTime: null,
          isRunning: false,
          connectedClients: 0,
          error: null,
          lastUpdated: null,
          selectedIncidents: [],
        }), false, 'clearData'),
      }),
      {
        name: 'simulation-store',
        // Only persist UI preferences, not real-time simulation data
        partialize: (state) => ({
          dashboardView: state.dashboardView,
          mapView: state.mapView,
          notificationSound: state.notificationSound,
        }),
      }
    ),
    {
      name: 'simulation-store',
    }
  )
);

// Selector hooks for specific data
export const useConnectionState = () => useSimulationStore((state) => ({
  isConnected: state.isConnected,
  connectionId: state.connectionId,
}));

export const useFestival = () => useSimulationStore((state) => state.festival);

export const useMetrics = () => useSimulationStore((state) => state.metrics);

export const useIncidents = () => useSimulationStore((state) => state.incidents);

export const useAlerts = () => useSimulationStore((state) => state.alerts);

export const useSimulationStatus = () => useSimulationStore((state) => ({
  status: state.status,
  isRunning: state.isRunning,
  currentTime: state.currentTime,
}));

export const useUIState = () => useSimulationStore((state) => ({
  isLoading: state.isLoading,
  error: state.error,
  lastUpdated: state.lastUpdated,
}));

export const useDashboardView = () => useSimulationStore((state) => state.dashboardView);

export const useMapView = () => useSimulationStore((state) => state.mapView);

export default useSimulationStore;