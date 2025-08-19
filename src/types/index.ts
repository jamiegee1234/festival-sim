// Core Festival Types
export interface Festival {
  id: string;
  name: string;
  genre: FestivalGenre;
  theme: FestivalTheme;
  startDate: Date;
  endDate: Date;
  venue: Venue;
  capacity: number;
  currentAttendees: number;
  budget: Budget;
  status: FestivalStatus;
  weather: WeatherSystem;
  schedule: PerformanceSchedule;
  vendors: Vendor[];
  artists: Artist[];
  staff: StaffMember[];
  incidents: Incident[];
  metrics: FestivalMetrics;
  settings: SimulationSettings;
}

export type FestivalGenre = 
  | 'EDM' | 'Indie' | 'Jazz' | 'Rock' | 'Hip-Hop' | 'Country' 
  | 'Folk' | 'Electronic' | 'Pop' | 'Metal' | 'Reggae' | 'Multicultural';

export type FestivalTheme = 
  | 'Urban' | 'Rural' | 'Beachfront' | 'Forest' | 'Desert' | 'Mountain' 
  | 'Industrial' | 'Futuristic' | 'Vintage' | 'Cultural' | 'Seasonal';

export type FestivalStatus = 
  | 'Planning' | 'Setup' | 'Active' | 'Teardown' | 'Complete' | 'Cancelled';

// Venue & Infrastructure
export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  location: Location;
  capacity: VenueCapacity;
  stages: Stage[];
  facilities: Facility[];
  restrictions: any;
  permits: any[];
  layout: any;
}

export type VenueType = 'Indoor' | 'Outdoor' | 'Hybrid' | 'Urban' | 'Greenfield';

export interface VenueCapacity {
  maxAttendees: number;
  maxStaff: number;
  maxArtists: number;
  maxVendors: number;
  fireCodeLimit: number;
  currentOccupancy: number;
}

export interface Stage {
  id: string;
  name: string;
  capacity: number;
  equipment: any;
  schedule: any;
  technicalRider: TechnicalRider;
  changeoverTime: number;
  currentArtist?: Artist;
  nextArtist?: Artist;
}

export interface Facility {
  id: string;
  type: FacilityType;
  capacity: number;
  currentUsage: number;
  maintenance: any;
  location: Location;
}

export type FacilityType = 
  | 'Toilet' | 'Bar' | 'Food' | 'Medical' | 'Security' | 'Parking' 
  | 'Camping' | 'Charging' | 'CoatCheck' | 'FirstAid' | 'LostFound';

// Artist & Performance
export interface Artist {
  id: string;
  name: string;
  genre: string;
  tier: ArtistTier;
  technicalRider: TechnicalRider;
  performance: Performance;
  contract: any;
  hospitality: any;
  merch: any;
  status: string;
}

export type ArtistTier = 'Headliner' | 'Main' | 'Support' | 'Local' | 'Opening';

export interface Performance {
  id: string;
  artistId: string;
  stageId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  setlist: string[];
  technicalRequirements: TechnicalRequirement[];
  status: PerformanceStatus;
}

export type PerformanceStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'Delayed';

// Technical & Logistics
export interface TechnicalRider {
  id: string;
  requirements: TechnicalRequirement[];
  backline: BacklineEquipment[];
  soundcheck: any;
  loadIn: any;
  loadOut: any;
  powerRequirements: any;
  lightingRequirements: any;
  specialEffects: any[];
}

export interface TechnicalRequirement {
  type: 'Audio' | 'Lighting' | 'Video' | 'Power' | 'Special';
  description: string;
  critical: boolean;
  provided: boolean;
  cost: number;
}

export interface BacklineEquipment {
  type: string;
  quantity: number;
  shared: boolean;
  cost: number;
  availability: boolean;
}

// Crowd & Attendees
export interface Attendee {
  id: string;
  type: AttendeeType;
  demographics: any;
  preferences: any;
  behavior: CrowdBehavior;
  satisfaction: number;
  spending: any;
  location: Location;
  status: string;
}

export type AttendeeType = 'GA' | 'VIP' | 'Artist' | 'Staff' | 'Press' | 'Influencer';

export interface CrowdBehavior {
  density: number;
  movement: any;
  mood: number;
  energy: number;
  riskLevel: RiskLevel;
  socialInteractions: any[];
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

// Weather & Environment
export interface WeatherSystem {
  current: any;
  forecast: any[];
  impact: any;
  alerts: any[];
}

export interface WeatherCondition {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  visibility: number;
  uvIndex: number;
  lightning: boolean;
}

export interface WeatherImpact {
  onCrowd: number;
  onEquipment: number;
  onLogistics: number;
  onSafety: number;
  onRevenue: number;
}

// Business & Finance
export interface Budget {
  total: number;
  allocated: number;
  spent: number;
  revenue: number;
  profit: number;
  categories: BudgetCategory[];
  projections: FinancialProjection[];
}

export interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  critical: boolean;
}

export interface FinancialProjection {
  date: Date;
  projectedRevenue: number;
  projectedCosts: number;
  projectedProfit: number;
  confidence: number;
}

// Staff & Operations
export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  department: Department;
  skills: any[];
  availability: any;
  performance: any;
  location: Location;
}

export type StaffRole = 
  | 'Manager' | 'Coordinator' | 'Technician' | 'Security' | 'Medical' 
  | 'Vendor' | 'Runner' | 'Volunteer' | 'Supervisor';

export type Department = 
  | 'Production' | 'Technical' | 'Security' | 'Medical' | 'Vendor' 
  | 'Logistics' | 'Marketing' | 'Finance' | 'Operations';

// Safety & Compliance
export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  location: Location;
  description: string;
  timestamp: Date;
  resolved: boolean;
  response: IncidentResponse;
  cost: number;
}

export type IncidentType = 
  | 'Medical' | 'Security' | 'Technical' | 'Weather' | 'Crowd' 
  | 'Equipment' | 'Safety' | 'Compliance' | 'Financial';

export type IncidentSeverity = 'Minor' | 'Moderate' | 'Major' | 'Critical';

export interface IncidentResponse {
  responseTime: number;
  staffInvolved: string[];
  actions: string[];
  followUp: string[];
}

// Simulation & AI
export interface SimulationSettings {
  timeScale: number;
  aiComplexity: number;
  realismLevel: number;
  difficulty: SimulationDifficulty;
  features: FeatureToggle[];
  plugins: Plugin[];
}

export type SimulationDifficulty = 'Easy' | 'Normal' | 'Hard' | 'Expert' | 'Realistic';

export interface FeatureToggle {
  name: string;
  enabled: boolean;
  priority: number;
  dependencies: string[];
}

export interface Plugin {
  name: string;
  version: string;
  enabled: boolean;
  config: Record<string, any>;
}

// Metrics & Analytics
export interface FestivalMetrics {
  attendance: any;
  financial: any;
  operational: any;
  safety: any;
  satisfaction: any;
  environmental: any;
}

export interface AttendanceMetrics {
  total: number;
  peak: number;
  average: number;
  byDay: Record<string, number>;
  byStage: Record<string, number>;
  capacityUtilization: number;
}

export interface FinancialMetrics {
  revenue: number;
  costs: number;
  profit: number;
  roi: number;
  breakEven: boolean;
  projections: FinancialProjection[];
}

// Utility Types
export interface Location {
  x: number;
  y: number;
  zone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface TimeWindow {
  start: Date;
  end: Date;
  duration: number;
}

export interface PerformanceSchedule {
  performances: Performance[];
  changeovers: any[];
  breaks: any[];
  specialEvents: any[];
}

export interface Changeover {
  id: string;
  stageId: string;
  previousArtist: string;
  nextArtist: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: ChangeoverStatus;
}

export type ChangeoverStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Delayed';

export interface Vendor {
  id: string;
  name: string;
  type: VendorType;
  location: Location;
  capacity: number;
  currentQueue: number;
  revenue: number;
  satisfaction: number;
  healthRating: number;
}

export type VendorType = 'Food' | 'Beverage' | 'Merchandise' | 'Art' | 'Experience' | 'Service';

// Additional specialized types for advanced features
export interface PowerGrid {
  zones: PowerZone[];
  totalCapacity: number;
  currentUsage: number;
  generators: Generator[];
  ups: UPS[];
}

export interface PowerZone {
  id: string;
  capacity: number;
  currentUsage: number;
  critical: boolean;
  equipment: string[];
}

export interface Generator {
  id: string;
  capacity: number;
  fuelLevel: number;
  runtime: number;
  status: 'Online' | 'Offline' | 'Maintenance';
}

export interface UPS {
  id: string;
  capacity: number;
  batteryLevel: number;
  connectedEquipment: string[];
  status: 'Online' | 'Offline' | 'Battery';
}

export interface SecuritySystem {
  personnel: SecurityPersonnel[];
  checkpoints: Checkpoint[];
  surveillance: SurveillanceCamera[];
  emergencyProtocols: EmergencyProtocol[];
}

export interface SecurityPersonnel {
  id: string;
  role: 'Guard' | 'Supervisor' | 'Manager' | 'Coordinator';
  location: Location;
  status: 'Available' | 'Busy' | 'OffDuty';
  incidents: string[];
}

export interface Checkpoint {
  id: string;
  type: 'Entry' | 'Exit' | 'VIP' | 'Backstage';
  location: Location;
  queueLength: number;
  processingTime: number;
  staff: string[];
}

export interface SurveillanceCamera {
  id: string;
  location: Location;
  coverage: number;
  status: 'Active' | 'Inactive' | 'Maintenance';
  incidents: string[];
}

export interface EmergencyProtocol {
  id: string;
  type: 'Medical' | 'Security' | 'Weather' | 'Technical' | 'Crowd';
  description: string;
  steps: string[];
  contacts: string[];
  escalation: string[];
}

// Re-export enhanced types for comprehensive feature support
export * from './enhanced';
