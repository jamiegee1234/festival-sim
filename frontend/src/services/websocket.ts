import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import type { 
  SimulationState, 
  SimulationEvent, 
  Festival, 
  Incident, 
  WeatherCondition,
  Alert,
  EventInjection 
} from '@/types';

type EventCallback<T = any> = (data: T) => void;

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnected = false;
  private eventCallbacks: Map<string, Set<EventCallback>> = new Map();

  constructor() {
    this.connect();
  }

  private connect(): void {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';
    
    console.log('🔌 Connecting to WebSocket server:', serverUrl);

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      toast.success('Connected to simulation server');
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
      toast.error('Disconnected from server');
      this.emit('disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔥 WebSocket connection error:', error);
      this.isConnected = false;
      this.handleReconnection();
    });

    // Simulation events
    this.socket.on('simulationState', (data: SimulationState) => {
      console.log('📊 Received simulation state update');
      this.emit('simulationState', data);
    });

    this.socket.on('simulationStarted', (data: any) => {
      console.log('🚀 Simulation started');
      toast.success('Simulation started!');
      this.emit('simulationStarted', data);
    });

    this.socket.on('simulationStopped', (data: any) => {
      console.log('⏹️ Simulation stopped');
      toast.success('Simulation stopped');
      this.emit('simulationStopped', data);
    });

    this.socket.on('simulationTick', (data: any) => {
      // Don't log every tick to avoid console spam
      this.emit('simulationTick', data);
    });

    // Festival events
    this.socket.on('festivalInitialized', (data: { festival: Festival }) => {
      console.log('🎪 Festival initialized:', data.festival.name);
      toast.success(`Festival "${data.festival.name}" initialized`);
      this.emit('festivalInitialized', data);
    });

    // Incident and alert events
    this.socket.on('incident', (data: { incident: Incident }) => {
      console.log('🚨 Incident reported:', data.incident.type);
      
      const toastMessage = `${data.incident.type} incident: ${data.incident.description}`;
      
      if (data.incident.severity === 'Critical') {
        toast.error(toastMessage, { duration: 8000 });
      } else if (data.incident.severity === 'High') {
        toast.error(toastMessage, { duration: 6000 });
      } else {
        toast(toastMessage, { 
          icon: '⚠️',
          duration: 4000 
        });
      }
      
      this.emit('incident', data);
    });

    this.socket.on('criticalIncident', (data: { incident: Incident }) => {
      console.log('🚨🚨 CRITICAL INCIDENT:', data.incident.type);
      toast.error(`CRITICAL: ${data.incident.description}`, {
        duration: 10000,
        style: {
          background: '#dc2626',
          color: '#white',
        }
      });
      this.emit('criticalIncident', data);
    });

    // Weather events
    this.socket.on('weatherChange', (data: { weather: WeatherCondition }) => {
      console.log('🌤️ Weather update:', data.weather.condition);
      
      if (data.weather.condition === 'Storm') {
        toast.error('Storm warning! Take necessary precautions.');
      } else if (data.weather.precipitation > 5) {
        toast('Heavy rain detected', { icon: '🌧️' });
      }
      
      this.emit('weatherChange', data);
    });

    // System events
    this.socket.on('eventInjected', (data: EventInjection) => {
      console.log('💉 Event injected:', data.type);
      this.emit('eventInjected', data);
    });

    this.socket.on('simulationError', (data: { error: string }) => {
      console.error('❌ Simulation error:', data.error);
      toast.error(`Simulation error: ${data.error}`);
      this.emit('simulationError', data);
    });

    // Custom app events
    this.socket.on('alert', (data: Alert) => {
      console.log('🔔 Alert received:', data.title);
      
      const toastOptions: any = {
        duration: data.priority === 'Critical' ? 10000 : 5000,
      };

      if (data.type === 'Error' || data.priority === 'Critical') {
        toast.error(data.title, toastOptions);
      } else if (data.type === 'Warning') {
        toast(data.title, { ...toastOptions, icon: '⚠️' });
      } else if (data.type === 'Success') {
        toast.success(data.title, toastOptions);
      } else {
        toast(data.title, { ...toastOptions, icon: 'ℹ️' });
      }
      
      this.emit('alert', data);
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      toast.error('Failed to reconnect to server. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000); // Max 30 seconds

    console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, this.reconnectDelay);
  }

  // Public methods for managing subscriptions
  public on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set());
    }
    
    this.eventCallbacks.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.eventCallbacks.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.eventCallbacks.delete(event);
        }
      }
    };
  }

  public off(event: string, callback?: EventCallback): void {
    if (!callback) {
      // Remove all callbacks for this event
      this.eventCallbacks.delete(event);
    } else {
      // Remove specific callback
      const callbacks = this.eventCallbacks.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.eventCallbacks.delete(event);
        }
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event callback for ${event}:`, error);
        }
      });
    }
  }

  // Methods to send data to server
  public startSimulation(): void {
    if (this.socket) {
      this.socket.emit('startSimulation');
    }
  }

  public pauseSimulation(): void {
    if (this.socket) {
      this.socket.emit('pauseSimulation');
    }
  }

  public resumeSimulation(): void {
    if (this.socket) {
      this.socket.emit('resumeSimulation');
    }
  }

  public stopSimulation(): void {
    if (this.socket) {
      this.socket.emit('stopSimulation');
    }
  }

  public createFestival(festivalData: any): void {
    if (this.socket) {
      this.socket.emit('createFestival', festivalData);
    }
  }

  public injectEvent(eventData: EventInjection): void {
    if (this.socket) {
      this.socket.emit('injectEvent', eventData);
    }
  }

  // Utility methods
  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  public getConnectionId(): string | undefined {
    return this.socket?.id;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  public reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.connect();
    }
  }

  // Cleanup method
  public destroy(): void {
    this.eventCallbacks.clear();
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

export default websocketService;