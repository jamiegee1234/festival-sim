import { useEffect, useCallback, useRef } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import websocketService from '@/services/websocket';
import type { 
  SimulationState, 
  Festival, 
  Incident, 
  WeatherCondition,
  Alert,
  EventInjection 
} from '@/types';

export const useWebSocket = () => {
  const store = useSimulationStore();
  const unsubscribeRefs = useRef<Array<() => void>>([]);

  // Subscribe to WebSocket events
  useEffect(() => {
    const unsubscribeFunctions: Array<() => void> = [];

    // Connection events
    const unsubscribeConnected = websocketService.on('connected', () => {
      store.setConnectionState(true, websocketService.getConnectionId());
    });
    unsubscribeFunctions.push(unsubscribeConnected);

    const unsubscribeDisconnected = websocketService.on('disconnected', (data: any) => {
      store.setConnectionState(false);
      store.setError(`Disconnected from server: ${data.reason}`);
    });
    unsubscribeFunctions.push(unsubscribeDisconnected);

    // Simulation state events
    const unsubscribeSimulationState = websocketService.on<SimulationState>('simulationState', (state) => {
      console.log('📊 Updating simulation state from WebSocket');
      store.updateSimulationState(state);
    });
    unsubscribeFunctions.push(unsubscribeSimulationState);

    const unsubscribeSimulationStarted = websocketService.on('simulationStarted', (data: any) => {
      store.setIsRunning(true);
      if (data.time) {
        store.updateSimulationState({ currentTime: data.time });
      }
    });
    unsubscribeFunctions.push(unsubscribeSimulationStarted);

    const unsubscribeSimulationStopped = websocketService.on('simulationStopped', (data: any) => {
      store.setIsRunning(false);
      if (data.time) {
        store.updateSimulationState({ currentTime: data.time });
      }
    });
    unsubscribeFunctions.push(unsubscribeSimulationStopped);

    const unsubscribeSimulationTick = websocketService.on('simulationTick', (data: any) => {
      // Update metrics and time from tick data
      if (data.metrics) {
        store.updateMetrics(data.metrics);
      }
      if (data.time) {
        store.updateSimulationState({ currentTime: data.time });
      }
      if (data.festival) {
        store.updateSimulationState({ festival: data.festival });
      }
    });
    unsubscribeFunctions.push(unsubscribeSimulationTick);

    // Festival events
    const unsubscribeFestivalInitialized = websocketService.on<{ festival: Festival }>('festivalInitialized', (data) => {
      store.setFestival(data.festival);
    });
    unsubscribeFunctions.push(unsubscribeFestivalInitialized);

    // Incident events
    const unsubscribeIncident = websocketService.on<{ incident: Incident }>('incident', (data) => {
      store.addIncident(data.incident);
      
      // Create alert for the incident
      const alert: Alert = {
        id: `incident-${data.incident.id}`,
        type: data.incident.severity === 'Critical' ? 'Error' : 'Warning',
        title: `${data.incident.type} Incident`,
        description: data.incident.description,
        timestamp: data.incident.timestamp,
        priority: data.incident.severity === 'Critical' ? 'Critical' : 
                  data.incident.severity === 'High' ? 'High' : 'Medium',
        category: 'Safety',
        acknowledged: false,
        actions: [
          {
            label: 'View Details',
            action: `view-incident-${data.incident.id}`,
            style: 'primary'
          }
        ]
      };
      
      store.addAlert(alert);
    });
    unsubscribeFunctions.push(unsubscribeIncident);

    const unsubscribeCriticalIncident = websocketService.on<{ incident: Incident }>('criticalIncident', (data) => {
      store.addIncident(data.incident);
      
      // Create critical alert
      const alert: Alert = {
        id: `critical-${data.incident.id}`,
        type: 'Error',
        title: 'CRITICAL INCIDENT',
        description: `${data.incident.type}: ${data.incident.description}`,
        timestamp: data.incident.timestamp,
        priority: 'Critical',
        category: 'Safety',
        acknowledged: false,
        actions: [
          {
            label: 'Emergency Response',
            action: `emergency-${data.incident.id}`,
            style: 'danger'
          },
          {
            label: 'View Details',
            action: `view-incident-${data.incident.id}`,
            style: 'primary'
          }
        ]
      };
      
      store.addAlert(alert);
    });
    unsubscribeFunctions.push(unsubscribeCriticalIncident);

    // Weather events
    const unsubscribeWeatherChange = websocketService.on<{ weather: WeatherCondition }>('weatherChange', (data) => {
      store.updateSimulationState({
        festival: store.festival ? {
          ...store.festival,
          weather: {
            ...store.festival.weather,
            current: data.weather
          }
        } : null
      });

      // Create weather alert for severe conditions
      if (data.weather.condition === 'Storm' || data.weather.precipitation > 10) {
        const alert: Alert = {
          id: `weather-${Date.now()}`,
          type: 'Warning',
          title: 'Weather Alert',
          description: `${data.weather.condition} conditions detected. Precipitation: ${data.weather.precipitation}mm`,
          timestamp: data.weather.timestamp,
          priority: data.weather.condition === 'Storm' ? 'High' : 'Medium',
          category: 'Weather',
          acknowledged: false
        };
        
        store.addAlert(alert);
      }
    });
    unsubscribeFunctions.push(unsubscribeWeatherChange);

    // System events
    const unsubscribeEventInjected = websocketService.on<EventInjection>('eventInjected', (data) => {
      const alert: Alert = {
        id: `event-${Date.now()}`,
        type: 'Info',
        title: 'Event Injected',
        description: `${data.type} event has been injected into the simulation`,
        timestamp: data.timestamp || new Date().toISOString(),
        priority: 'Low',
        category: 'System',
        acknowledged: false
      };
      
      store.addAlert(alert);
    });
    unsubscribeFunctions.push(unsubscribeEventInjected);

    const unsubscribeSimulationError = websocketService.on<{ error: string }>('simulationError', (data) => {
      store.setError(data.error);
      
      const alert: Alert = {
        id: `error-${Date.now()}`,
        type: 'Error',
        title: 'Simulation Error',
        description: data.error,
        timestamp: new Date().toISOString(),
        priority: 'High',
        category: 'System',
        acknowledged: false
      };
      
      store.addAlert(alert);
    });
    unsubscribeFunctions.push(unsubscribeSimulationError);

    // Custom alert events
    const unsubscribeAlert = websocketService.on<Alert>('alert', (alert) => {
      store.addAlert(alert);
    });
    unsubscribeFunctions.push(unsubscribeAlert);

    // Store unsubscribe functions
    unsubscribeRefs.current = unsubscribeFunctions;

    // Cleanup function
    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
      unsubscribeRefs.current = [];
    };
  }, [store]);

  // Methods to control simulation via WebSocket
  const startSimulation = useCallback(() => {
    websocketService.startSimulation();
  }, []);

  const pauseSimulation = useCallback(() => {
    websocketService.pauseSimulation();
  }, []);

  const resumeSimulation = useCallback(() => {
    websocketService.resumeSimulation();
  }, []);

  const stopSimulation = useCallback(() => {
    websocketService.stopSimulation();
  }, []);

  const createFestival = useCallback((festivalData: any) => {
    websocketService.createFestival(festivalData);
  }, []);

  const injectEvent = useCallback((eventData: EventInjection) => {
    websocketService.injectEvent(eventData);
  }, []);

  // Connection utilities
  const reconnect = useCallback(() => {
    websocketService.reconnect();
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  // Get connection status
  const isConnected = websocketService.isSocketConnected();
  const connectionId = websocketService.getConnectionId();

  return {
    // Connection state
    isConnected,
    connectionId,
    
    // Simulation controls
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    createFestival,
    injectEvent,
    
    // Connection controls
    reconnect,
    disconnect,
  };
};

export default useWebSocket;