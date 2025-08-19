import axios, { AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import type {
  Festival,
  SimulationState,
  FestivalMetrics,
  ApiResponse,
  FestivalFormData,
  EventInjection,
  DebugInfo,
  Alert,
  Incident
} from '@/types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens and logging
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('API Response Error:', error);
    
    // Handle different error types
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please slow down.');
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Network error. Please check your connection.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

// API Service Class
export class ApiService {
  // Health and System
  static async getHealth() {
    const response = await api.get('/simulation/status');
    return response.data;
  }

  // Simulation Management
  static async getSimulationState(): Promise<SimulationState> {
    const response = await api.get<SimulationState>('/simulation/state');
    return response.data;
  }

  static async startSimulation(): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/simulation/start');
    if (response.data.success) {
      toast.success('Simulation started successfully!');
    }
    return response.data;
  }

  static async pauseSimulation(): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/simulation/pause');
    if (response.data.success) {
      toast.success('Simulation paused');
    }
    return response.data;
  }

  static async resumeSimulation(): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/simulation/resume');
    if (response.data.success) {
      toast.success('Simulation resumed');
    }
    return response.data;
  }

  static async stopSimulation(): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/simulation/stop');
    if (response.data.success) {
      toast.success('Simulation stopped');
    }
    return response.data;
  }

  static async setSimulationSpeed(timeScale: number): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/simulation/speed', { timeScale });
    return response.data;
  }

  // Festival Management
  static async getCurrentFestival(): Promise<Festival> {
    const response = await api.get<Festival>('/festival');
    return response.data;
  }

  static async createFestival(festivalData: FestivalFormData): Promise<ApiResponse<Festival>> {
    const response = await api.post<ApiResponse<Festival>>('/festival', festivalData);
    if (response.data.success) {
      toast.success(`Festival "${festivalData.name}" created successfully!`);
    }
    return response.data;
  }

  static async getFestivalTemplates() {
    const response = await api.get('/festival/templates');
    return response.data;
  }

  static async createFestivalFromTemplate(
    templateId: string, 
    customizations: Partial<FestivalFormData>
  ): Promise<ApiResponse<Festival>> {
    const response = await api.post<ApiResponse<Festival>>(
      `/festival/templates/${templateId}`, 
      customizations
    );
    if (response.data.success) {
      toast.success('Festival created from template!');
    }
    return response.data;
  }

  static async getFestivalVenues() {
    const response = await api.get('/festival/venues');
    return response.data;
  }

  static async getFestivalSchedule() {
    const response = await api.get('/festival/schedule');
    return response.data;
  }

  static async getFestivalVendors() {
    const response = await api.get('/festival/vendors');
    return response.data;
  }

  static async getFestivalStaff() {
    const response = await api.get('/festival/staff');
    return response.data;
  }

  // Metrics and Analytics
  static async getMetrics(): Promise<FestivalMetrics> {
    const response = await api.get<{ metrics: FestivalMetrics }>('/metrics');
    return response.data.metrics;
  }

  static async getAttendanceMetrics() {
    const response = await api.get('/metrics/attendance');
    return response.data;
  }

  static async getFinancialMetrics() {
    const response = await api.get('/metrics/financial');
    return response.data;
  }

  static async getSafetyMetrics() {
    const response = await api.get('/metrics/safety');
    return response.data;
  }

  static async getWeatherMetrics() {
    const response = await api.get('/metrics/weather');
    return response.data;
  }

  static async getOperationalMetrics() {
    const response = await api.get('/metrics/operations');
    return response.data;
  }

  static async getPerformanceMetrics() {
    const response = await api.get('/metrics/performance');
    return response.data;
  }

  static async getSustainabilityMetrics() {
    const response = await api.get('/metrics/sustainability');
    return response.data;
  }

  static async getHistoricalMetrics(timeRange: string, metric: string) {
    const response = await api.get('/metrics/history', {
      params: { timeRange, metric }
    });
    return response.data;
  }

  static async getAlerts(): Promise<{ alerts: Alert[]; incidents: Incident[] }> {
    const response = await api.get<{ alerts: Alert[]; incidents: Incident[] }>('/metrics/alerts');
    return response.data;
  }

  // Admin Functions (require authentication)
  static async getSystemStatus(): Promise<DebugInfo> {
    const response = await api.get<DebugInfo>('/admin/system');
    return response.data;
  }

  static async injectEvent(eventData: EventInjection): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/admin/events', eventData);
    if (response.data.success) {
      toast.success('Event injected successfully!');
    }
    return response.data;
  }

  static async getEventTypes() {
    const response = await api.get('/admin/events/types');
    return response.data;
  }

  static async getDebugInfo(): Promise<DebugInfo> {
    const response = await api.get<DebugInfo>('/admin/debug');
    return response.data;
  }

  static async resetSimulation(): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/admin/reset');
    if (response.data.success) {
      toast.success('Simulation reset successfully!');
    }
    return response.data;
  }

  static async updateSettings(settings: any): Promise<ApiResponse<void>> {
    const response = await api.put<ApiResponse<void>>('/admin/settings', settings);
    if (response.data.success) {
      toast.success('Settings updated successfully!');
    }
    return response.data;
  }

  static async getConnectedClients() {
    const response = await api.get('/admin/clients');
    return response.data;
  }

  static async getServerLogs(limit: number = 100) {
    const response = await api.get('/admin/logs', { params: { limit } });
    return response.data;
  }

  // Utility functions
  static async uploadFile(file: File, endpoint: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      },
    });

    return response.data;
  }

  static async downloadFile(endpoint: string, filename: string): Promise<void> {
    const response = await api.get(endpoint, {
      responseType: 'blob',
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  // Error handling utility
  static handleApiError(error: any, customMessage?: string): void {
    const message = customMessage || 
      error?.response?.data?.error || 
      error?.message || 
      'An unexpected error occurred';
    
    toast.error(message);
    console.error('API Error:', error);
  }
}

export default ApiService;