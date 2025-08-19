// Festival Simulator Frontend Types

export interface Festival {
  id: string;
  name: string;
  genre: string;
  theme: string;
  startDate: string;
  endDate: string;
  venue: Venue;
  capacity: number;
  currentAttendees: number;
  budget: Budget;
  status: FestivalStatus;
  weather: WeatherSystem;
  schedule: PerformanceSchedule;
  vendors: Vendor[];
  artists: Artist[];
  staff: Staff[];
  incidents: Incident[];
  metrics: FestivalMetrics;
  settings: FestivalSettings;
}

export interface Venue {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  capacity: number;
  area: number;
  stages: Stage[];
  facilities: Facility[];
  layout: VenueLayout;
}

export interface Stage {
  id: string;
  name: string;
  capacity: number;
  type: 'Main' | 'Secondary' | 'Acoustic' | 'Electronic' | 'Alternative';
  position: {
    x: number;
    y: number;
  };
  equipment: string[];
  currentPerformance?: Performance;
}

export interface Facility {
  id: string;
  name: string;
  type: 'Restroom' | 'Food' | 'Medical' | 'Security' | 'Merchandise' | 'VIP' | 'Parking';
  capacity: number;
  position: {
    x: number;
    y: number;
  };
  status: 'Operational' | 'Maintenance' | 'Closed' | 'Overcrowded';
}

export interface VenueLayout {
  entrances: Array<{ id: string; name: string; position: { x: number; y: number; } }>;
  exits: Array<{ id: string; name: string; position: { x: number; y: number; } }>;
  emergencyExits: Array<{ id: string; position: { x: number; y: number; } }>;
  barriers: Array<{ points: Array<{ x: number; y: number; }> }>;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  popularity: number;
  fee: number;
  requirements: string[];
  reputation: number;
  fanBase: number;
  socialMedia: {
    instagram: number;
    twitter: number;
    facebook: number;
  };
  riderRequirements: string[];
}

export interface Performance {
  id: string;
  artistId: string;
  stageId: string;
  startTime: string;
  endTime: string;
  setupTime: number;
  soundcheckTime: number;
  status: 'Scheduled' | 'Setting Up' | 'Sound Check' | 'Performing' | 'Completed' | 'Cancelled';
}

export interface PerformanceSchedule {
  performances: Performance[];
  conflicts: Array<{
    type: string;
    description: string;
    performances: string[];
  }>;
}

export interface Vendor {
  id: string;
  name: string;
  type: 'Food' | 'Beverage' | 'Merchandise' | 'Sponsor';
  location: {
    x: number;
    y: number;
  };
  revenue: number;
  status: 'Open' | 'Closed' | 'Busy' | 'Maintenance';
  queue: number;
  satisfaction: number;
}

export interface Staff {
  id: string;
  name: string;
  role: 'Security' | 'Medical' | 'Technical' | 'Logistics' | 'Customer Service' | 'Management';
  shift: {
    start: string;
    end: string;
  };
  location?: {
    x: number;
    y: number;
  };
  status: 'On Duty' | 'Break' | 'Off Duty' | 'Emergency Response';
  experience: number;
}

export interface Budget {
  total: number;
  allocated: number;
  spent: number;
  categories: {
    artists: number;
    venue: number;
    production: number;
    marketing: number;
    operations: number;
    contingency: number;
  };
}

export interface WeatherSystem {
  current: WeatherCondition;
  forecast: WeatherCondition[];
  alerts: WeatherAlert[];
}

export interface WeatherCondition {
  timestamp: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  condition: 'Clear' | 'Cloudy' | 'Rain' | 'Storm' | 'Fog';
  visibility: number;
}

export interface WeatherAlert {
  id: string;
  type: 'Storm Warning' | 'Heat Advisory' | 'High Wind' | 'Severe Weather';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  startTime: string;
  endTime: string;
}

export interface Incident {
  id: string;
  type: 'Medical' | 'Security' | 'Technical' | 'Weather' | 'Crowd' | 'Artist' | 'Vendor';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  location: {
    x: number;
    y: number;
    description?: string;
  };
  description: string;
  timestamp: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
  responseTime?: number;
  resolvedBy?: string;
  impact: {
    attendance: number;
    safety: number;
    financial: number;
    reputation: number;
  };
}

export interface FestivalMetrics {
  attendance: AttendanceMetrics;
  financial: FinancialMetrics;
  safety: SafetyMetrics;
  operational: OperationalMetrics;
  satisfaction: SatisfactionMetrics;
  environmental: EnvironmentalMetrics;
}

export interface AttendanceMetrics {
  total: number;
  current: number;
  peak: number;
  hourlyBreakdown: Array<{ hour: number; count: number }>;
  demographicBreakdown: {
    ageGroups: Record<string, number>;
    genders: Record<string, number>;
    locations: Record<string, number>;
  };
  averageSatisfaction: number;
  entryRate: number;
  exitRate: number;
}

export interface FinancialMetrics {
  revenue: number;
  costs: number;
  profit: number;
  ticketSales: number;
  vendorRevenue: number;
  sponsorshipRevenue: number;
  merchandiseRevenue: number;
  breakdownByCategory: Record<string, number>;
  projectedFinal: number;
  budgetVariance: number;
}

export interface SafetyMetrics {
  incidents: number;
  criticalIncidents: number;
  medicalCalls: number;
  securityAlerts: number;
  responseTime: number;
  evacuation: {
    timeEstimate: number;
    bottlenecks: string[];
  };
  overallSafetyScore: number;
}

export interface OperationalMetrics {
  staffEfficiency: number;
  vendorPerformance: number;
  technicalIssues: number;
  crowdFlow: {
    bottlenecks: Array<{
      location: { x: number; y: number; };
      severity: number;
      estimatedDelay: number;
    }>;
    averageMovementSpeed: number;
  };
  resourceUtilization: Record<string, number>;
}

export interface SatisfactionMetrics {
  overall: number;
  byCategory: Record<string, number>;
  feedback: Array<{
    category: string;
    rating: number;
    comment: string;
    timestamp: string;
  }>;
  complaints: number;
  compliments: number;
  improvements: string[];
}

export interface EnvironmentalMetrics {
  carbonFootprint: number;
  wasteGeneration: number;
  recyclingRate: number;
  energyConsumption: number;
  renewableEnergyUsage: number;
  waterUsage: number;
  noiseLevel: number;
}

export type FestivalStatus = 
  | 'Planning' 
  | 'Setup' 
  | 'Pre-Event' 
  | 'Active' 
  | 'Intermission' 
  | 'Closing' 
  | 'Cleanup' 
  | 'Completed' 
  | 'Cancelled' 
  | 'Emergency';

export interface FestivalSettings {
  timeScale: number;
  aiComplexity: number;
  realismLevel: number;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Expert';
  features: string[];
  plugins: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface SimulationState {
  festival: Festival;
  metrics: FestivalMetrics;
  incidents: Incident[];
  alerts: Alert[];
  status: FestivalStatus;
  currentTime: string;
  isRunning: boolean;
  connectedClients?: number;
}

export interface Alert {
  id: string;
  type: 'Info' | 'Warning' | 'Error' | 'Success';
  title: string;
  description: string;
  timestamp: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'System' | 'Safety' | 'Financial' | 'Operational' | 'Weather';
  acknowledged: boolean;
  actions?: Array<{
    label: string;
    action: string;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
}

// UI State Types
export interface DashboardView {
  layout: 'grid' | 'list';
  selectedMetrics: string[];
  timeRange: '1h' | '4h' | '12h' | '24h' | '7d';
  refreshRate: number;
}

export interface MapView {
  zoom: number;
  center: { x: number; y: number; };
  selectedElements: string[];
  showHeatmap: boolean;
  heatmapType: 'crowd' | 'satisfaction' | 'spending' | 'safety';
  layers: {
    venues: boolean;
    artists: boolean;
    vendors: boolean;
    incidents: boolean;
    staff: boolean;
  };
}

// WebSocket Events
export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface SimulationEvent extends WebSocketEvent {
  type: 'simulationTick' | 'simulationStarted' | 'simulationStopped' | 'incident' | 'criticalIncident' | 'weatherChange';
}

// Admin Tools
export interface EventInjection {
  type: string;
  parameters: Record<string, any>;
  timestamp?: string;
  description?: string;
}

export interface DebugInfo {
  simulationState: any;
  systemEngines: Record<string, string>;
  performance: {
    tickRate: string;
    lastTick: string;
    memoryUsage: any;
  };
}

// Form Types
export interface FestivalFormData {
  name: string;
  genre: string;
  theme: string;
  capacity: number;
  startDate: string;
  endDate: string;
  budget: number;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  dashboardLayout: DashboardView;
  mapSettings: MapView;
  notifications: {
    incidents: boolean;
    financial: boolean;
    weather: boolean;
    system: boolean;
  };
  autoRefresh: boolean;
  soundEnabled: boolean;
}