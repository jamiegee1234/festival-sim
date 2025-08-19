import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Festival, SimulationSettings, FestivalStatus, Incident, WeatherSystem } from '../types';

// Enhanced system engines
import { AccreditationEngine } from './systems/AccreditationEngine';
import { CrewManagementEngine } from './systems/CrewManagementEngine';
import { EnhancedLogisticsEngine } from './systems/EnhancedLogisticsEngine';
import { PowerInfrastructureEngine } from './systems/PowerInfrastructureEngine';
import { EnhancedSafetyEngine } from './systems/EnhancedSafetyEngine';

// Original engines
import { WeatherEngine } from './systems/WeatherEngine';
import { CrowdEngine } from './systems/CrowdEngine';
import { FinancialEngine } from './systems/FinancialEngine';
import { PerformanceEngine } from './systems/PerformanceEngine';
import { VendorEngine } from './systems/VendorEngine';
import { SecurityEngine } from './systems/SecurityEngine';
import { AIEngine } from './systems/AIEngine';
import { VenueEngine } from './systems/VenueEngine';
import { TechnicalEngine } from './systems/TechnicalEngine';
import { ComplianceEngine } from './systems/ComplianceEngine';

// Enhanced types
import { 
  AccreditationSystem, CrewRosteringSystem, LogisticsSystem, 
  PowerInfrastructure, SafetySystem 
} from '../types/enhanced';

export class EnhancedSimulationEngine extends EventEmitter {
  private festival: Festival;
  private settings: SimulationSettings;
  private isRunning: boolean = false;
  private currentTime: Date;
  private timeScale: number = 1;
  private tickInterval: NodeJS.Timeout | null = null;
  private tickRate: number = 1000; // 1 second per tick

  // Enhanced system engines
  private accreditationEngine: AccreditationEngine;
  private crewManagementEngine: CrewManagementEngine;
  private enhancedLogisticsEngine: EnhancedLogisticsEngine;
  private powerInfrastructureEngine: PowerInfrastructureEngine;
  private enhancedSafetyEngine: EnhancedSafetyEngine;

  // Original system engines
  private weatherEngine: WeatherEngine;
  private crowdEngine: CrowdEngine;
  private financialEngine: FinancialEngine;
  private performanceEngine: PerformanceEngine;
  private vendorEngine: VendorEngine;
  private securityEngine: SecurityEngine;
  private aiEngine: AIEngine;
  private venueEngine: VenueEngine;
  private technicalEngine: TechnicalEngine;
  private complianceEngine: ComplianceEngine;

  // Simulation state
  private incidents: Incident[] = [];
  private metrics: any = {
    safety: { incidents: 0 },
    attendance: {},
    financial: {},
    operational: {},
    weather: {},
    performance: {},
    venue: {},
    technical: {},
    compliance: {},
    // Enhanced metrics
    accreditation: {},
    crewManagement: {},
    logistics: {},
    powerInfrastructure: {},
    enhancedSafety: {}
  };
  private decisions: any[] = [];
  private alerts: any[] = [];

  constructor(festival: Festival, settings: SimulationSettings) {
    super();
    this.festival = festival;
    this.settings = settings;
    this.currentTime = festival.startDate;
    this.timeScale = settings.timeScale;

    // Initialize all system engines
    this.initializeEngines();
    this.setupEngineEventListeners();
  }

  private initializeEngines(): void {
    // Enhanced engines
    this.accreditationEngine = new AccreditationEngine(this.createAccreditationSystem(), this.settings);
    this.crewManagementEngine = new CrewManagementEngine(this.festival, this.settings);
    this.enhancedLogisticsEngine = new EnhancedLogisticsEngine(this.festival, this.settings);
    this.powerInfrastructureEngine = new PowerInfrastructureEngine(this.festival.venue, this.settings);
    this.enhancedSafetyEngine = new EnhancedSafetyEngine(this.festival, this.settings);

    // Original engines
    this.weatherEngine = new WeatherEngine(this.festival.weather, this.settings);
    this.crowdEngine = new CrowdEngine(this.festival, this.settings);
    this.financialEngine = new FinancialEngine(this.festival.budget, this.settings);
    this.performanceEngine = new PerformanceEngine(this.festival.schedule, this.settings);
    this.vendorEngine = new VendorEngine(this.festival.vendors, this.settings);
    this.securityEngine = new SecurityEngine(this.festival, this.settings);
    this.aiEngine = new AIEngine(this.festival, this.settings);
    this.venueEngine = new VenueEngine(this.festival);
    this.technicalEngine = new TechnicalEngine(this.festival);
    this.complianceEngine = new ComplianceEngine(this.festival);
  }

  private setupEngineEventListeners(): void {
    // Weather engine events
    this.weatherEngine.on('weatherChange', (data) => {
      this.handleWeatherChange(data);
      this.emit('weatherChange', data);
    });

    // Enhanced accreditation events
    this.accreditationEngine.on('badgeScan', (data) => {
      this.emit('badgeScan', { ...data, time: this.currentTime });
    });

    this.accreditationEngine.on('securityAlert', (data) => {
      this.handleSecurityAlert(data);
      this.emit('securityAlert', data);
    });

    this.accreditationEngine.on('kioskOffline', (data) => {
      this.handleIncident({
        id: uuidv4(),
        type: 'Technical',
        severity: 'Moderate',
        location: data.kiosk.location,
        description: 'Accreditation kiosk went offline',
        timestamp: this.currentTime,
        resolved: false,
        response: { responseTime: 0, staffInvolved: [], actions: [], followUp: [] },
        cost: 500
      });
    });

    // Crew management events
    this.crewManagementEngine.on('shiftNoShow', (data) => {
      this.handleIncident({
        id: uuidv4(),
        type: 'Security',
        severity: 'Minor',
        location: { x: 0, y: 0, zone: data.shift.location },
        description: `Staff no-show: ${data.shift.role}`,
        timestamp: this.currentTime,
        resolved: false,
        response: { responseTime: 0, staffInvolved: [], actions: [], followUp: [] },
        cost: data.shift.rate * data.shift.duration
      });
    });

    this.crewManagementEngine.on('mandatoryRest', (data) => {
      this.emit('mandatoryRest', { ...data, time: this.currentTime });
    });

    this.crewManagementEngine.on('fatiguePenalty', (data) => {
      this.emit('staffFatigue', { ...data, time: this.currentTime });
    });

    // Enhanced logistics events
    this.enhancedLogisticsEngine.on('assetMissing', (data) => {
      this.handleIncident({
        id: uuidv4(),
        type: 'Equipment',
        severity: data.asset.value > 10000 ? 'Major' : 'Minor',
        location: data.asset.location,
        description: `Missing asset: ${data.asset.name}`,
        timestamp: this.currentTime,
        resolved: false,
        response: { responseTime: 0, staffInvolved: [], actions: [], followUp: [] },
        cost: data.asset.value * 0.1 // 10% of asset value for search/replace
      });
    });

    this.enhancedLogisticsEngine.on('changeoverOvertime', (data) => {
      this.emit('changeoverDelay', { ...data, time: this.currentTime });
    });

    this.enhancedLogisticsEngine.on('criticalBottleneck', (data) => {
      this.emit('trafficBottleneck', { ...data, time: this.currentTime });
    });

    // Power infrastructure events
    this.powerInfrastructureEngine.on('generatorFailure', (data) => {
      this.handleIncident({
        id: uuidv4(),
        type: 'Technical',
        severity: 'Major',
        location: { x: 0, y: 0, zone: 'Generator Farm' },
        description: `Generator failure: ${data.failureType}`,
        timestamp: this.currentTime,
        resolved: false,
        response: { responseTime: 0, staffInvolved: [], actions: [], followUp: [] },
        cost: 5000 + Math.random() * 15000
      });
    });

    this.powerInfrastructureEngine.on('criticalFuelShortage', (data) => {
      this.emit('fuelShortage', { ...data, time: this.currentTime });
    });

    this.powerInfrastructureEngine.on('breakerTripped', (data) => {
      this.emit('powerOutage', { ...data, time: this.currentTime });
    });

    // Enhanced safety events
    this.enhancedSafetyEngine.on('towerRestrictionActivated', (data) => {
      this.emit('weatherRestriction', { ...data, time: this.currentTime });
    });

    this.enhancedSafetyEngine.on('spillIncident', (data) => {
      this.handleIncident({
        id: uuidv4(),
        type: 'Safety',
        severity: data.severity === 'Major' ? 'Major' : 'Minor',
        location: data.zone.location,
        description: `Spill incident in ${data.zone.type} area`,
        timestamp: this.currentTime,
        resolved: false,
        response: { responseTime: 0, staffInvolved: [], actions: [], followUp: [] },
        cost: data.severity === 'Major' ? 10000 : 2000
      });
    });

    this.enhancedSafetyEngine.on('noiseViolation', (data) => {
      this.emit('noiseComplaint', { ...data, time: this.currentTime });
    });

    // Original engine events (maintaining compatibility)
    this.safetyEngine?.on('incident', (incident) => {
      this.handleIncident(incident);
    });

    this.financialEngine.on('budgetAlert', (data) => {
      this.emit('budgetAlert', { ...data, time: this.currentTime });
    });

    this.performanceEngine.on('performanceUpdate', (data) => {
      this.handlePerformanceUpdate(data);
    });

    this.crowdEngine.on('crowdDensityChanged', (data) => {
      this.handleCrowdDensityChange(data);
    });
  }

  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.emit('simulationStarted', {
      time: this.currentTime,
      festival: this.festival
    });

    this.tickInterval = setInterval(() => {
      this.tick();
    }, this.tickRate / this.timeScale);
  }

  public pause(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    
    this.emit('simulationPaused', {
      time: this.currentTime,
      festival: this.festival
    });
  }

  public resume(): void {
    if (this.isRunning) return;

    this.start();
    this.emit('simulationResumed', {
      time: this.currentTime,
      festival: this.festival
    });
  }

  public stop(): void {
    this.isRunning = false;
    
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    this.emit('simulationStopped', {
      time: this.currentTime,
      festival: this.festival,
      metrics: this.metrics
    });
  }

  private tick(): void {
    if (!this.isRunning) return;

    // Advance time
    this.advanceTime();

    // Process all systems
    this.processSystems();

    // Update metrics
    this.updateMetrics();

    // Check for end conditions
    this.checkEndConditions();

    // Emit tick event
    this.emit('tick', {
      time: this.currentTime,
      festival: this.festival,
      metrics: this.metrics
    });
  }

  private advanceTime(): void {
    // Advance simulation time based on time scale
    const timeIncrement = (this.tickRate * this.timeScale) / 1000; // Convert to seconds
    this.currentTime = new Date(this.currentTime.getTime() + timeIncrement);
  }

  private processSystems(): void {
    try {
      // Process enhanced systems first
      this.accreditationEngine.process(this.currentTime);
      this.crewManagementEngine.process(this.currentTime);
      this.enhancedLogisticsEngine.process(this.currentTime);
      this.powerInfrastructureEngine.process(this.currentTime);
      this.enhancedSafetyEngine.process(this.currentTime);

      // Process original systems
      this.weatherEngine.process(this.currentTime);
      this.crowdEngine.process(this.currentTime);
      this.performanceEngine.process(this.currentTime);
      this.vendorEngine.process(this.currentTime);
      this.financialEngine.process(this.currentTime);
      this.securityEngine.process(this.currentTime);
      this.aiEngine.process(this.currentTime);
      this.venueEngine.process(this.currentTime);
      this.technicalEngine.process(this.currentTime);
      this.complianceEngine.process(this.currentTime);

    } catch (error) {
      this.emit('error', { 
        error: error, 
        time: this.currentTime,
        system: 'processSystems'
      });
    }
  }

  private updateMetrics(): void {
    this.metrics = {
      time: this.currentTime,
      // Enhanced metrics
      accreditation: this.accreditationEngine.getMetrics(),
      crewManagement: this.crewManagementEngine.getMetrics(),
      logistics: this.enhancedLogisticsEngine.getMetrics(),
      powerInfrastructure: this.powerInfrastructureEngine.getMetrics(),
      enhancedSafety: this.enhancedSafetyEngine.getMetrics(),
      // Original metrics
      attendance: this.crowdEngine.getAttendanceMetrics(),
      financial: this.financialEngine.getFinancialMetrics(),
      operational: {}, // LogisticsEngine metrics would go here
      weather: this.weatherEngine.getWeatherMetrics(),
      performance: this.performanceEngine.getPerformanceMetrics(),
      venue: this.venueEngine.getVenueMetrics(),
      technical: this.technicalEngine.getTechnicalMetrics(),
      compliance: this.complianceEngine.getComplianceMetrics(),
      safety: { incidents: this.incidents.length }
    };
  }

  private checkEndConditions(): void {
    // Check if festival has ended
    if (this.currentTime >= this.festival.endDate) {
      this.festival.status = 'Complete';
      this.stop();
      return;
    }

    // Check for critical failures
    const criticalIncidents = this.incidents.filter(i => i.severity === 'Critical').length;
    if (criticalIncidents > 10) {
      this.emit('criticalFailure', {
        reason: 'Too many critical incidents',
        incidents: criticalIncidents,
        time: this.currentTime
      });
    }

    // Check budget constraints
    if (this.financialEngine.isBankrupt()) {
      this.emit('bankruptcy', {
        reason: 'Insufficient funds',
        budget: this.festival.budget,
        time: this.currentTime
      });
    }
  }

  private handleWeatherChange(data: any): void {
    // Notify all weather-dependent systems
    this.enhancedSafetyEngine.process(this.currentTime); // FOH tower wind checks
    this.powerInfrastructureEngine.process(this.currentTime); // Weather impact on power
  }

  private handleSecurityAlert(data: any): void {
    this.alerts.push({
      id: uuidv4(),
      type: 'Security',
      description: data.type,
      timestamp: this.currentTime,
      resolved: false
    });
  }

  private handleIncident(incident: Incident): void {
    this.incidents.push(incident);
    
    // Update metrics
    this.metrics.safety.incidents++;
    
    // Trigger response protocols if safety engine exists
    if (this.enhancedSafetyEngine) {
      // Enhanced safety response
      this.emit('enhancedSafetyResponse', { incident, time: this.currentTime });
    }
    
    // Update financial impact
    this.financialEngine.addIncidentCost(incident.cost);
    
    this.emit('incident', { incident, time: this.currentTime });
  }

  private handlePerformanceUpdate(performance: any): void {
    // Update crowd satisfaction
    this.crowdEngine.updatePerformanceSatisfaction(performance);
    
    // Update financial metrics based on performance
    this.financialEngine.updatePerformanceRevenue(performance);
  }

  private handleCrowdDensityChange(data: any): void {
    // Notify security systems of crowd changes
    this.securityEngine.updateCrowdDensity(data);
    
    this.emit('crowdDensityChanged', { data, time: this.currentTime });
  }

  private createAccreditationSystem(): AccreditationSystem {
    return {
      badges: [],
      kiosks: [],
      scanners: [],
      offlineBuffer: [],
      securityLevels: []
    };
  }

  // Public methods for external access
  public getFestival(): Festival {
    return this.festival;
  }

  public getFestivalStatus(): FestivalStatus {
    return this.festival.status;
  }

  public getCurrentTime(): Date {
    return this.currentTime;
  }

  public isSimulationRunning(): boolean {
    return this.isRunning;
  }

  public getMetrics(): any {
    return this.metrics;
  }

  public getIncidents(): Incident[] {
    return this.incidents;
  }

  public getAlerts(): any[] {
    return this.alerts;
  }

  // Enhanced system getters
  public getAccreditationStatus(): any {
    return this.accreditationEngine.getSystemStatus();
  }

  public getCrewManagementStatus(): any {
    return {
      shifts: this.crewManagementEngine.getShiftSchedule(),
      volunteers: this.crewManagementEngine.getVolunteerStatus(),
      fatigue: this.crewManagementEngine.getFatigueReport()
    };
  }

  public getLogisticsStatus(): any {
    return {
      loadIn: this.enhancedLogisticsEngine.getLoadInSchedule(),
      assets: this.enhancedLogisticsEngine.getAssetStatus(),
      changeovers: this.enhancedLogisticsEngine.getChangeoverStatus(),
      routes: this.enhancedLogisticsEngine.getVehicleRoutes()
    };
  }

  public getPowerStatus(): any {
    return this.powerInfrastructureEngine.getPowerStatus();
  }

  public getSafetyStatus(): any {
    return {
      fohTower: this.enhancedSafetyEngine.getFOHTowerStatus(),
      spillResponse: this.enhancedSafetyEngine.getSpillResponseStatus(),
      noise: this.enhancedSafetyEngine.getNoiseControlStatus(),
      patrols: this.enhancedSafetyEngine.getPatrolStatus(),
      residents: this.enhancedSafetyEngine.getResidentHotlineStatus()
    };
  }

  // Enhanced functionality methods
  public createAccreditationBadge(type: any, personId: string, name: string, securityLevel: number): any {
    return this.accreditationEngine.createBadge(type, personId, name, securityLevel);
  }

  public requestShiftSwap(requesterId: string, targetId: string, originalShift: string, proposedShift: string, reason: string): string {
    return this.crewManagementEngine.requestShiftSwap(requesterId, targetId, originalShift, proposedShift, reason);
  }

  public scheduleLoadIn(assignedTo: string, dock: string, duration: number, type: any, priority?: number): string {
    return this.enhancedLogisticsEngine.scheduleLoadIn(assignedTo, dock, duration, type, priority);
  }

  public trackAsset(name: string, category: any, owner: string, value: number): string {
    return this.enhancedLogisticsEngine.trackAsset(name, category, owner, value);
  }

  public getComprehensiveMetrics(): any {
    return {
      simulation: {
        currentTime: this.currentTime,
        status: this.festival.status,
        running: this.isRunning,
        incidents: this.incidents.length,
        alerts: this.alerts.length
      },
      enhanced: {
        accreditation: this.metrics.accreditation,
        crewManagement: this.metrics.crewManagement,
        logistics: this.metrics.logistics,
        powerInfrastructure: this.metrics.powerInfrastructure,
        safety: this.metrics.enhancedSafety
      },
      traditional: {
        attendance: this.metrics.attendance,
        financial: this.metrics.financial,
        weather: this.metrics.weather,
        performance: this.metrics.performance,
        venue: this.metrics.venue,
        technical: this.metrics.technical,
        compliance: this.metrics.compliance
      }
    };
  }
}