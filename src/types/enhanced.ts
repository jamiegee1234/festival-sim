// Enhanced Feature Types for Festival Simulator

// ===== ACCREDITATION & ACCESS CONTROL =====

export interface AccreditationSystem {
  badges: Badge[];
  kiosks: AccreditationKiosk[];
  scanners: BadgeScanner[];
  offlineBuffer: OfflineScans[];
  securityLevels: SecurityLevel[];
}

export interface Badge {
  id: string;
  type: BadgeType;
  personId: string;
  name: string;
  photo: string;
  qrCode: string;
  nfcData: string;
  securityLevel: number;
  zones: string[];
  validFrom: Date;
  validUntil: Date;
  status: 'Active' | 'Suspended' | 'Expired' | 'Lost' | 'Replaced';
  lastScan: Date;
  scanHistory: ScanRecord[];
}

export type BadgeType = 'Artist' | 'Crew' | 'Vendor' | 'VIP' | 'Press' | 'Security' | 'Medical' | 'Volunteer' | 'Staff';

export interface AccreditationKiosk {
  id: string;
  location: Location;
  status: 'Online' | 'Offline' | 'Maintenance' | 'Error';
  queueLength: number;
  processingTime: number;
  offlineMode: boolean;
  lastSync: Date;
  issuesCount: number;
}

export interface BadgeScanner {
  id: string;
  location: Location;
  type: 'QR' | 'NFC' | 'Hybrid';
  status: 'Online' | 'Offline' | 'Error';
  batteryLevel: number;
  offlineScans: number;
  lastSync: Date;
}

export interface OfflineScans {
  scannerId: string;
  scans: ScanRecord[];
  timestamp: Date;
}

export interface ScanRecord {
  badgeId: string;
  scannerId: string;
  timestamp: Date;
  location: Location;
  success: boolean;
  denied: boolean;
  reason?: string;
}

export interface SecurityLevel {
  level: number;
  name: string;
  description: string;
  zones: string[];
  restrictions: string[];
}

// ===== CREW & VOLUNTEER MANAGEMENT =====

export interface CrewRosteringSystem {
  shifts: Shift[];
  swapRequests: ShiftSwap[];
  overtimeRules: OvertimeRule[];
  fatigueTracker: FatigueTracker[];
  volunteers: VolunteerProfile[];
}

export interface Shift {
  id: string;
  staffId: string;
  role: string;
  department: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  breakTime: number;
  location: string;
  status: 'Scheduled' | 'Active' | 'Completed' | 'NoShow' | 'Swapped';
  overtime: boolean;
  rate: number;
  supervisor: string;
}

export interface ShiftSwap {
  id: string;
  requesterId: string;
  targetId: string;
  originalShift: string;
  proposedShift: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  approver: string;
  timestamp: Date;
}

export interface OvertimeRule {
  department: string;
  maxHoursDaily: number;
  maxHoursWeekly: number;
  multiplier: number;
  cooldownHours: number;
  autoApprove: boolean;
}

export interface FatigueTracker {
  staffId: string;
  hoursWorked: number;
  consecutiveDays: number;
  fatigueLevel: number;
  penalties: FatiguePenalty[];
  lastRest: Date;
}

export interface FatiguePenalty {
  type: 'PerformanceDegrade' | 'SafetyRisk' | 'MandatoryBreak' | 'SendHome';
  severity: number;
  description: string;
  applied: Date;
}

export interface VolunteerProfile {
  id: string;
  name: string;
  skills: string[];
  availability: Date[];
  noShowProbability: number;
  incentivesEarned: Incentive[];
  trainingStatus: TrainingRecord[];
  performanceScore: number;
  totalHours: number;
}

export interface Incentive {
  type: 'FreeTicket' | 'Merchandise' | 'Food' | 'Meet&Greet' | 'Certificate';
  value: number;
  earned: Date;
  redeemed: boolean;
  description: string;
}

export interface TrainingRecord {
  module: string;
  completed: Date;
  score: number;
  valid: boolean;
  expires: Date;
  required: boolean;
}

// ===== LOGISTICS & ASSET MANAGEMENT =====

export interface LogisticsSystem {
  loadInSlots: LoadInSlot[];
  assetTracking: AssetTracker[];
  changeovers: ChangeoverManager[];
  vehicleRoutes: VehicleRoute[];
}

export interface LoadInSlot {
  id: string;
  dock: string;
  timeSlot: Date;
  duration: number;
  assignedTo: string;
  type: 'Vendor' | 'Artist' | 'Production';
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Delayed';
  congestionLevel: number;
  priority: number;
}

export interface AssetTracker {
  id: string;
  qrCode: string;
  name: string;
  category: 'Roadcase' | 'Equipment' | 'Instrument' | 'Lighting' | 'Audio' | 'Other';
  owner: string;
  location: Location;
  status: 'Located' | 'Missing' | 'InTransit' | 'Lost';
  lastScan: Date;
  lostRisk: number;
  value: number;
  recoveryFlow: RecoveryAction[];
}

export interface RecoveryAction {
  action: string;
  assignedTo: string;
  deadline: Date;
  completed: boolean;
  cost: number;
}

export interface ChangeoverManager {
  id: string;
  stageId: string;
  fromArtist: string;
  toArtist: string;
  scheduledStart: Date;
  actualStart: Date;
  scheduledEnd: Date;
  actualEnd: Date;
  targetTime: number;
  actualTime: number;
  stopwatch: ChangeoverStopwatch;
  penalties: number;
  bonuses: number;
  crew: string[];
}

export interface ChangeoverStopwatch {
  startTime: Date;
  endTime: Date;
  elapsedTime: number;
  checkpoints: Checkpoint[];
  status: 'NotStarted' | 'Running' | 'Completed' | 'Overtime';
}

export interface Checkpoint {
  name: string;
  targetTime: number;
  actualTime: number;
  completed: boolean;
  issues: string[];
}

export interface VehicleRoute {
  id: string;
  name: string;
  type: 'OneWay' | 'TwoWay' | 'Service' | 'Emergency';
  waypoints: Location[];
  marshalPoints: MarshalPoint[];
  bottlenecks: VehicleBottleneck[];
  restrictions: VehicleRestriction[];
  capacity: number;
  currentUsage: number;
}

export interface MarshalPoint {
  location: Location;
  staffId: string;
  status: 'Active' | 'Break' | 'Emergency';
  vehiclesGuided: number;
}

export interface VehicleBottleneck {
  location: Location;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  cause: string;
  estimatedDelay: number;
  mitigation: string[];
}

export interface VehicleRestriction {
  type: 'Weight' | 'Height' | 'Width' | 'Time' | 'Access';
  limit: any;
  enforcement: boolean;
}

// ===== POWER & INFRASTRUCTURE =====

export interface PowerInfrastructure {
  generators: Generator[];
  phaseBalancing: PhaseBalance[];
  breakerPanels: BreakerPanel[];
  fuelLogistics: FuelLogistics;
  scaffoldInspections: ScaffoldInspection[];
}

export interface Generator {
  id: string;
  capacity: number;
  currentLoad: number;
  phases: PhaseLoad[];
  fuelLevel: number;
  fuelConsumption: number;
  status: 'Online' | 'Offline' | 'Maintenance' | 'Error';
  efficiency: number;
  lastMaintenance: Date;
  nextMaintenance: Date;
}

export interface PhaseLoad {
  phase: 'L1' | 'L2' | 'L3';
  load: number;
  capacity: number;
  imbalance: number;
  efficiency: number;
}

export interface PhaseBalance {
  generatorId: string;
  l1Load: number;
  l2Load: number;
  l3Load: number;
  imbalancePercentage: number;
  efficiencyLoss: number;
  autoRebalancing: boolean;
}

export interface BreakerPanel {
  id: string;
  location: Location;
  breakers: Breaker[];
  tripChains: TripChain[];
  safeResetTiming: number;
  lastInspection: Date;
}

export interface Breaker {
  id: string;
  rating: number;
  currentLoad: number;
  status: 'On' | 'Off' | 'Tripped' | 'Maintenance';
  loads: string[];
  tripHistory: Date[];
}

export interface TripChain {
  triggerBreaker: string;
  affectedBreakers: string[];
  affectedLoads: string[];
  resetSequence: string[];
}

export interface FuelLogistics {
  tanks: FuelTank[];
  deliveries: FuelDelivery[];
  consumption: FuelConsumption[];
  pricing: FuelPricing;
}

export interface FuelTank {
  id: string;
  capacity: number;
  currentLevel: number;
  fuelType: string;
  location: Location;
  lastFill: Date;
  consumptionRate: number;
  lowLevelWarning: number;
}

export interface FuelDelivery {
  id: string;
  scheduled: Date;
  actual: Date;
  quantity: number;
  cost: number;
  minimumOrder: number;
  supplier: string;
  status: 'Scheduled' | 'InTransit' | 'Delivered' | 'Delayed';
}

export interface FuelConsumption {
  generatorId: string;
  hourlyRate: number;
  totalConsumed: number;
  efficiency: number;
  forecast: number[];
}

export interface FuelPricing {
  baseRate: number;
  surgeMultiplier: number;
  minimumOrderSurcharge: number;
  emergencyRate: number;
  currentRate: number;
}

export interface ScaffoldInspection {
  id: string;
  location: Location;
  type: 'Daily' | 'Weekly' | 'Monthly' | 'Emergency';
  scheduled: Date;
  completed: Date;
  inspector: string;
  status: 'Scheduled' | 'Overdue' | 'Completed' | 'Failed';
  issues: ScaffoldIssue[];
  shutdownRisk: number;
}

export interface ScaffoldIssue {
  severity: 'Minor' | 'Major' | 'Critical';
  description: string;
  location: string;
  remediation: string;
  cost: number;
  deadline: Date;
}

// ===== SAFETY & ENVIRONMENTAL =====

export interface SafetySystem {
  fohTower: FOHTower;
  groundProtection: GroundProtection;
  spillResponse: SpillResponseSystem;
  firePoints: FirePoint[];
  noiseControl: NoiseControl;
  patrolRoutes: PatrolRoute[];
  residentHotline: ResidentHotline;
}

export interface FOHTower {
  location: Location;
  height: number;
  windThresholds: WindThreshold[];
  paOperations: boolean;
  ledOperations: boolean;
  currentWindSpeed: number;
  restrictions: TowerRestriction[];
}

export interface WindThreshold {
  speed: number;
  action: 'Monitor' | 'Restrict' | 'Shutdown';
  equipmentAffected: string[];
}

export interface TowerRestriction {
  type: 'PA' | 'LED' | 'Full';
  active: boolean;
  reason: string;
  since: Date;
}

export interface GroundProtection {
  matsRented: number;
  matsCost: number;
  mudDamageRisk: number;
  venueGroundsCost: number;
  weatherImpact: number;
  matDeployment: MatDeployment[];
}

export interface MatDeployment {
  zone: string;
  matsRequired: number;
  matsDeployed: number;
  mudLevel: number;
  trafficLevel: number;
}

export interface SpillResponseSystem {
  kits: SpillKit[];
  inspectionSchedule: SpillInspection[];
  oilyAreas: HazardZone[];
  fuelAreas: HazardZone[];
}

export interface SpillKit {
  id: string;
  location: Location;
  type: 'Oil' | 'Fuel' | 'Chemical' | 'Universal';
  capacity: number;
  lastInspection: Date;
  status: 'Ready' | 'Used' | 'Expired' | 'Missing';
  contents: SpillKitItem[];
}

export interface SpillKitItem {
  item: string;
  quantity: number;
  status: 'Available' | 'Used' | 'Expired';
}

export interface SpillInspection {
  kitId: string;
  scheduled: Date;
  completed: Date;
  inspector: string;
  passed: boolean;
  issues: string[];
}

export interface HazardZone {
  id: string;
  location: Location;
  type: 'Oily' | 'Fuel' | 'Chemical';
  riskLevel: number;
  spillKitsRequired: number;
  spillKitsPresent: number;
  lastInspection: Date;
}

export interface FirePoint {
  id: string;
  location: Location;
  type: 'CO2' | 'Foam' | 'Water' | 'Dry';
  capacity: number;
  zone: string;
  lastInspection: Date;
  status: 'Ready' | 'Used' | 'Maintenance' | 'Expired';
  coverage: number;
}

export interface NoiseControl {
  propagationMap: NoisePropagation[];
  soundWalls: SoundWall[];
  monitoringPoints: NoiseMonitor[];
  complaints: NoiseComplaint[];
}

export interface NoisePropagation {
  source: Location;
  level: number;
  frequency: number;
  propagation: PropagationPoint[];
  mitigation: string[];
}

export interface PropagationPoint {
  location: Location;
  level: number;
  impact: number;
}

export interface SoundWall {
  id: string;
  location: Location;
  height: number;
  length: number;
  material: string;
  reduction: number;
  cost: number;
  temporary: boolean;
}

export interface NoiseMonitor {
  id: string;
  location: Location;
  currentLevel: number;
  maxLevel: number;
  violations: number;
  status: 'Active' | 'Inactive' | 'Maintenance';
}

export interface NoiseComplaint {
  id: string;
  timestamp: Date;
  location: string;
  level: number;
  response: string;
  resolved: boolean;
}

export interface PatrolRoute {
  id: string;
  name: string;
  waypoints: Location[];
  frequency: number;
  duration: number;
  assignedOfficer: string;
  responseTimeHeatmap: ResponseHeatmap[];
  status: 'Active' | 'Paused' | 'Emergency';
}

export interface ResponseHeatmap {
  location: Location;
  averageResponseTime: number;
  incidentCount: number;
  severity: 'Low' | 'Medium' | 'High';
}

export interface ResidentHotline {
  phoneNumber: string;
  staffed: boolean;
  calls: ResidentCall[];
  complaintsToday: number;
  goodwillScore: number;
}

export interface ResidentCall {
  id: string;
  timestamp: Date;
  complaint: string;
  severity: number;
  location: string;
  response: string;
  resolved: boolean;
  followUp: boolean;
}

// ===== PRODUCTION & ARTISTS =====

export interface ProductionSystem {
  visaChecks: VisaCheck[];
  backlineSubstitution: BacklineMatrix;
  showfileConverter: ShowfileConverter;
  iemSystem: IEMSystem;
  setlistVariance: SetlistVariance[];
  cascadingDelays: DelayModel[];
  guestAppearances: GuestAppearanceFlow[];
  djCrossfade: DJCrossfadeWindow[];
}

export interface VisaCheck {
  artistId: string;
  nationality: string;
  visaType: string;
  required: boolean;
  status: 'NotRequired' | 'Applied' | 'Approved' | 'Denied' | 'Expired';
  applicationDate: Date;
  approvalDate: Date;
  expiryDate: Date;
  leadTime: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface BacklineMatrix {
  substitutions: BacklineSubstitution[];
  availability: BacklineAvailability[];
  qualityImpact: QualityImpact[];
}

export interface BacklineSubstitution {
  original: string;
  substitute: string;
  compatibility: number;
  qualityLoss: number;
  available: boolean;
  cost: number;
}

export interface BacklineAvailability {
  equipment: string;
  quantity: number;
  reserved: number;
  available: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export interface QualityImpact {
  artistId: string;
  equipment: string;
  impactScore: number;
  acceptanceRisk: number;
}

export interface ShowfileConverter {
  supportedFormats: string[];
  conversions: ShowfileConversion[];
  successRates: ConversionSuccess[];
}

export interface ShowfileConversion {
  id: string;
  from: string;
  to: string;
  artistId: string;
  status: 'Pending' | 'Converting' | 'Success' | 'Failed';
  successProbability: number;
  estimatedTime: number;
  actualTime: number;
  issues: string[];
}

export interface ConversionSuccess {
  fromFormat: string;
  toFormat: string;
  successRate: number;
  averageTime: number;
  commonIssues: string[];
}

export interface IEMSystem {
  frequencies: IEMFrequency[];
  interferenceDetection: boolean;
  autoRecoordination: boolean;
  sparePool: IEMSparePool;
  monitorMixes: MonitorMix[];
}

export interface IEMFrequency {
  frequency: number;
  assigned: boolean;
  artistId: string;
  channel: string;
  interference: boolean;
  signalStrength: number;
  batteryLevel: number;
}

export interface IEMSparePool {
  available: number;
  reserved: number;
  frequencies: number[];
  autoAssignment: boolean;
}

export interface MonitorMix {
  artistId: string;
  channels: number[];
  preset: string;
  customized: boolean;
  soundcheck: boolean;
}

export interface SetlistVariance {
  artistId: string;
  originalSetlist: string[];
  actualSetlist: string[];
  bangerRatio: number;
  deepCutRatio: number;
  crowdEnergyImpact: number;
  spendingImpact: number;
  satisfactionImpact: number;
}

export interface DelayModel {
  stageId: string;
  currentDelay: number;
  cascadeEffects: CascadeEffect[];
  rippleImpact: number;
  mitigationStrategies: string[];
}

export interface CascadeEffect {
  affectedStage: string;
  delayAddition: number;
  conflictProbability: number;
  attendeeDisruption: number;
}

export interface GuestAppearanceFlow {
  id: string;
  mainArtist: string;
  guestArtist: string;
  approved: boolean;
  securityCleared: boolean;
  extraMicsRequired: number;
  inputsRequired: number;
  soundcheckTime: number;
  crowdImpact: number;
}

export interface DJCrossfadeWindow {
  id: string;
  fromDJ: string;
  toDJ: string;
  beatSync: boolean;
  crossfadeDuration: number;
  deadAirTime: number;
  crowdRetention: number;
  technical: DJTechnicalSetup;
}

export interface DJTechnicalSetup {
  mixer: string;
  cdjs: number;
  laptops: number;
  synchronized: boolean;
  bpmMatched: boolean;
  keyMatched: boolean;
}

// ===== RETAIL, BARS & VENDORS =====

export interface RetailSystem {
  inventory: VendorInventory[];
  barOperations: BarOperations[];
  tillReconciliation: TillReconciliation[];
  ageCheckAudits: AgeCheckAudit[];
  shrinkageModel: ShrinkageModel[];
  utilityTracking: VendorUtilityUsage[];
  menuEngineering: MenuEngineering[];
}

export interface VendorInventory {
  vendorId: string;
  kegInventory: KegInventory;
  foodPrep: FoodPrepTime[];
  lineCleaningSchedule: LineCleaningSchedule[];
  throughputImpact: number;
}

export interface KegInventory {
  kegs: Keg[];
  totalCapacity: number;
  currentVolume: number;
  lastClean: Date;
  nextClean: Date;
  downtime: number;
}

export interface Keg {
  id: string;
  beverage: string;
  capacity: number;
  currentLevel: number;
  tapped: Date;
  estimatedEmpty: Date;
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export interface FoodPrepTime {
  sku: string;
  prepTimeMinutes: number;
  staffRequired: number;
  currentStaff: number;
  bottleneck: boolean;
  throughputLimit: number;
}

export interface LineCleaningSchedule {
  line: string;
  frequency: number;
  lastCleaned: Date;
  nextCleaning: Date;
  downtime: number;
  throughputImpact: number;
}

export interface BarOperations {
  vendorId: string;
  tillOperations: TillOperation[];
  dailyLimits: DailyLimits;
  cashVariance: number;
  cardTerminalStatus: 'Online' | 'Offline' | 'Error';
}

export interface TillOperation {
  tillId: string;
  openingBalance: number;
  currentBalance: number;
  transactions: number;
  lastReconciliation: Date;
  variance: number;
}

export interface DailyLimits {
  cashLimit: number;
  cardLimit: number;
  currentCash: number;
  currentCard: number;
  limitReached: boolean;
}

export interface TillReconciliation {
  vendorId: string;
  tillId: string;
  date: Date;
  expectedCash: number;
  actualCash: number;
  variance: number;
  cardTotal: number;
  reconciled: boolean;
  issues: string[];
}

export interface AgeCheckAudit {
  vendorId: string;
  timestamp: Date;
  checker: string;
  passed: boolean;
  failures: number;
  fineRisk: number;
  closureRisk: number;
  complianceScore: number;
}

export interface ShrinkageModel {
  vendorId: string;
  heavyPours: number;
  compDrinks: number;
  wastage: number;
  theft: number;
  totalShrinkage: number;
  impactOnMargin: number;
}

export interface VendorUtilityUsage {
  vendorId: string;
  powerDraw: number;
  waterUsage: number;
  gasDraw: number;
  impactOnGrid: number;
  cost: number;
}

export interface MenuEngineering {
  vendorId: string;
  items: MenuItem[];
  upsellPrompts: UpsellPrompt[];
  queueOptimization: QueueOptimization;
}

export interface MenuItem {
  sku: string;
  name: string;
  cost: number;
  price: number;
  margin: number;
  popularity: number;
  profitability: 'Star' | 'Plow' | 'Puzzle' | 'Dog';
}

export interface UpsellPrompt {
  trigger: string;
  suggestion: string;
  margin: number;
  successRate: number;
  active: boolean;
}

export interface QueueOptimization {
  averageQueueTime: number;
  targetQueueTime: number;
  staffingRecommendations: number;
  menuSimplification: string[];
  throughputGains: number;
}

// ===== CUSTOMER EXPERIENCE & ACCESSIBILITY =====

export interface CustomerExperienceSystem {
  wayfinding: WayfindingSystem;
  heatResponse: HeatResponse;
  sensoryFriendly: SensoryFriendlyFeatures;
  inclusivityFeatures: InclusivityFeatures[];
  complianceZones: ComplianceZone[];
  reentrySystem: ReentrySystem;
  storageServices: StorageServices;
}

export interface WayfindingSystem {
  signage: Signage[];
  budget: number;
  lostGuestRate: number;
  digitalMaps: DigitalMap[];
  staffDirections: number;
}

export interface Signage {
  id: string;
  location: Location;
  type: 'Directional' | 'Informational' | 'Safety' | 'Digital';
  visibility: number;
  effectiveness: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  cost: number;
}

export interface DigitalMap {
  id: string;
  location: Location;
  interactive: boolean;
  accessibility: boolean;
  usage: number;
  satisfaction: number;
}

export interface HeatResponse {
  heatIndex: number;
  responseLevel: 'Green' | 'Yellow' | 'Orange' | 'Red';
  mistingFans: MistingFan[];
  shadeSails: ShadeSail[];
  sunscreenStalls: SunscreenStall[];
  coolingCenters: CoolingCenter[];
}

export interface MistingFan {
  id: string;
  location: Location;
  active: boolean;
  waterUsage: number;
  powerDraw: number;
  coverage: number;
  effectiveness: number;
}

export interface ShadeSail {
  id: string;
  location: Location;
  size: number;
  coverage: number;
  deployed: boolean;
  windRating: number;
  cost: number;
}

export interface SunscreenStall {
  id: string;
  location: Location;
  stock: number;
  dispensed: number;
  cost: number;
  popularity: number;
}

export interface CoolingCenter {
  id: string;
  location: Location;
  capacity: number;
  currentOccupancy: number;
  airConditioning: boolean;
  waterStation: boolean;
  medicalSupport: boolean;
}

export interface SensoryFriendlyFeatures {
  quietHours: QuietHour[];
  lowStrobePresets: StrobePreset[];
  sensoryBreakAreas: SensoryArea[];
  noiseLevelMonitoring: boolean;
}

export interface QuietHour {
  startTime: Date;
  endTime: Date;
  stages: string[];
  volumeLimit: number;
  strobeRestriction: boolean;
  active: boolean;
}

export interface StrobePreset {
  stageId: string;
  preset: string;
  intensity: number;
  frequency: number;
  duration: number;
  epilepsySafe: boolean;
}

export interface SensoryArea {
  id: string;
  location: Location;
  capacity: number;
  currentOccupancy: number;
  features: string[];
  staffed: boolean;
  usage: number;
}

export interface InclusivityFeatures {
  type: 'Prayer' | 'Reflection' | 'Meditation' | 'Nursing' | 'Quiet';
  location: Location;
  capacity: number;
  currentOccupancy: number;
  amenities: string[];
  rating: number;
  feedback: string[];
}

export interface ComplianceZone {
  id: string;
  type: 'Smoking' | 'Vaping' | 'Alcohol' | 'Food';
  location: Location;
  capacity: number;
  currentOccupancy: number;
  patrols: number;
  violations: number;
  fines: number;
  compliance: number;
}

export interface ReentrySystem {
  policy: ReentryPolicy;
  stamps: ReentryStamp[];
  qrCodes: ReentryQR[];
  abuseDetection: AbuseDetection;
  staffingImpact: number;
}

export interface ReentryPolicy {
  allowed: boolean;
  timeRestrictions: string[];
  limitations: number;
  verification: 'Stamp' | 'QR' | 'Biometric';
}

export interface ReentryStamp {
  id: string;
  issued: Date;
  personId: string;
  location: string;
  used: boolean;
  expired: boolean;
}

export interface ReentryQR {
  id: string;
  qrCode: string;
  issued: Date;
  personId: string;
  uses: number;
  maxUses: number;
  expired: boolean;
}

export interface AbuseDetection {
  multipleEntries: number;
  suspiciousActivity: string[];
  flaggedIndividuals: string[];
  preventedAbuse: number;
}

export interface StorageServices {
  lockers: LockerService;
  cloakroom: CloakroomService;
  egressImpact: number;
}

export interface LockerService {
  lockers: Locker[];
  totalCapacity: number;
  occupancy: number;
  revenue: number;
  overloaded: boolean;
}

export interface Locker {
  id: string;
  size: 'Small' | 'Medium' | 'Large';
  occupied: boolean;
  rental: number;
  keyType: 'Physical' | 'Digital' | 'RFID';
  location: Location;
}

export interface CloakroomService {
  capacity: number;
  currentItems: number;
  staffRequired: number;
  currentStaff: number;
  averageRetrievalTime: number;
  queueLength: number;
  overloaded: boolean;
  revenue: number;
}

// ===== UI/GRAPHICS SYSTEM =====

export interface UIGraphicsSystem {
  themeMode: 'ThemePark' | 'Hospital' | 'Industrial' | 'Modern';
  colorScheme: ColorScheme;
  iconSets: IconSet[];
  animations: AnimationSet[];
  accessibility: UIAccessibility;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  background: string;
  surface: string;
  text: string;
}

export interface IconSet {
  name: string;
  style: 'Outlined' | 'Filled' | 'Sharp' | 'Round';
  icons: Record<string, string>;
}

export interface AnimationSet {
  name: string;
  transitions: string[];
  durations: Record<string, number>;
  easings: Record<string, string>;
}

export interface UIAccessibility {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}