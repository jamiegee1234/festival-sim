import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Festival, SimulationSettings, FestivalStatus, Incident, WeatherSystem } from '../types';
import { WeatherEngine } from './systems/WeatherEngine';
import { CrowdEngine } from './systems/CrowdEngine';
import { LogisticsEngine } from './systems/LogisticsEngine';
import { FinancialEngine } from './systems/FinancialEngine';
import { SafetyEngine } from './systems/SafetyEngine';
import { PerformanceEngine } from './systems/PerformanceEngine';
import { VendorEngine } from './systems/VendorEngine';
import { StaffEngine } from './systems/StaffEngine';
import { PowerEngine } from './systems/PowerEngine';
import { SecurityEngine } from './systems/SecurityEngine';
import { AIEngine } from './systems/AIEngine';
import { VenueEngine } from './systems/VenueEngine';
import { TechnicalEngine } from './systems/TechnicalEngine';
import { ComplianceEngine } from './systems/ComplianceEngine';

export class SimulationEngine extends EventEmitter {
  private festival: Festival;
  private settings: SimulationSettings;
  private isRunning: boolean = false;
  private currentTime: Date;
  private timeScale: number = 1;
  private tickInterval: NodeJS.Timeout | null = null;
  private tickRate: number = 1000; // 1 second per tick

  // Core system engines
  private weatherEngine: WeatherEngine;
  private crowdEngine: CrowdEngine;
  private logisticsEngine: LogisticsEngine;
  private financialEngine: FinancialEngine;
  private safetyEngine: SafetyEngine;
  private performanceEngine: PerformanceEngine;
  private vendorEngine: VendorEngine;
  private staffEngine: StaffEngine;
  private powerEngine: PowerEngine;
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
    compliance: {}
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
  }

  private initializeEngines(): void {
    this.weatherEngine = new WeatherEngine(this.festival.weather, this.settings);
    this.crowdEngine = new CrowdEngine(this.festival, this.settings);
    this.logisticsEngine = new LogisticsEngine(this.festival, this.settings);
    this.financialEngine = new FinancialEngine(this.festival.budget, this.settings);
    this.safetyEngine = new SafetyEngine(this.festival, this.settings);
    this.performanceEngine = new PerformanceEngine(this.festival.schedule, this.settings);
    this.vendorEngine = new VendorEngine(this.festival.vendors, this.settings);
    this.staffEngine = new StaffEngine(this.festival.staff, this.settings);
    this.powerEngine = new PowerEngine(this.festival.venue, this.settings);
    this.securityEngine = new SecurityEngine(this.festival, this.settings);
    this.aiEngine = new AIEngine(this.festival, this.settings);
    this.venueEngine = new VenueEngine(this.festival);
    this.technicalEngine = new TechnicalEngine(this.festival);
    this.complianceEngine = new ComplianceEngine(this.festival);

    // Set up event listeners for cross-system communication
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Weather impacts
    this.weatherEngine.on('weatherChange', (weather) => {
      this.handleWeatherChange(weather);
    });

    // Crowd behavior changes
    this.crowdEngine.on('crowdDensityChange', (data) => {
      this.handleCrowdDensityChange(data);
    });

    // Safety incidents
    this.safetyEngine.on('incident', (incident) => {
      this.handleIncident(incident);
    });

    // Performance changes
    this.performanceEngine.on('performanceUpdate', (performance) => {
      this.handlePerformanceUpdate(performance);
    });

    // Financial updates
    this.financialEngine.on('budgetAlert', (alert) => {
      this.handleBudgetAlert(alert);
    });

    // Venue management
    this.venueEngine.on('capacityWarning', (warning) => {
      this.handleCapacityWarning(warning);
    });

    this.venueEngine.on('fireCodeViolation', (violation) => {
      this.handleIncident(violation);
    });

    this.venueEngine.on('noiseViolation', (violation) => {
      this.handleIncident(violation);
    });

    // Technical issues
    this.technicalEngine.on('equipmentFailure', (failure) => {
      this.handleIncident(failure);
    });

    this.technicalEngine.on('technicalIssue', (issue) => {
      this.handleIncident(issue);
    });

    // Compliance violations
    this.complianceEngine.on('complianceViolation', (violation) => {
      this.handleIncident(violation);
    });

    this.complianceEngine.on('permitExpired', (expiry) => {
      this.handlePermitExpiry(expiry);
    });

    this.complianceEngine.on('licenseExpired', (expiry) => {
      this.handleLicenseExpiry(expiry);
    });
  }

  public start(): void {
    if (this.isRunning) {
      throw new Error('Simulation is already running');
    }

    this.isRunning = true;
    this.festival.status = 'Setup';
    this.emit('simulationStarted', { festival: this.festival, time: this.currentTime });

    // Start the main simulation loop
    this.startSimulationLoop();
  }

  public pause(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    this.isRunning = false;
    this.emit('simulationPaused', { time: this.currentTime });
  }

  public resume(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startSimulationLoop();
      this.emit('simulationResumed', { time: this.currentTime });
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    this.festival.status = 'Complete';
    this.emit('simulationStopped', { festival: this.festival, time: this.currentTime });
  }

  private startSimulationLoop(): void {
    this.tickInterval = setInterval(() => {
      this.tick();
    }, this.tickRate / this.timeScale);
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
    const timeAdvance = this.timeScale * (this.tickRate / 1000);
    this.currentTime = new Date(this.currentTime.getTime() + timeAdvance * 1000);
  }

  private processSystems(): void {
    try {
      // Process weather first (affects everything else)
      this.weatherEngine.process(this.currentTime);

      // Process crowd behavior
      this.crowdEngine.process(this.currentTime);

      // Process performances
      this.performanceEngine.process(this.currentTime);

      // Process logistics
      this.logisticsEngine.process(this.currentTime);

      // Process vendors
      this.vendorEngine.process(this.currentTime);

      // Process staff
      this.staffEngine.process(this.currentTime);

      // Process power
      this.powerEngine.process(this.currentTime);

      // Process security
      this.securityEngine.process(this.currentTime);

      // Process safety
      this.safetyEngine.process(this.currentTime);

      // Process financial
      this.financialEngine.process(this.currentTime);

      // Process venue management
      this.venueEngine.process(this.currentTime);

      // Process technical requirements
      this.technicalEngine.process(this.currentTime);

      // Process compliance
      this.complianceEngine.process(this.currentTime);

      // Process AI decisions
      this.aiEngine.process(this.currentTime);

    } catch (error) {
      console.error('Error processing systems:', error);
      this.emit('error', { error, time: this.currentTime });
    }
  }

  private updateMetrics(): void {
    this.metrics = {
      time: this.currentTime,
      attendance: this.crowdEngine.getAttendanceMetrics(),
      financial: this.financialEngine.getFinancialMetrics(),
      safety: this.safetyEngine.getSafetyMetrics(),
      operational: this.logisticsEngine.getOperationalMetrics(),
      weather: this.weatherEngine.getWeatherMetrics(),
      performance: this.performanceEngine.getPerformanceMetrics(),
      venue: this.venueEngine.getVenueMetrics(),
      technical: this.technicalEngine.getTechnicalMetrics(),
      compliance: this.complianceEngine.getComplianceMetrics()
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
    if (this.safetyEngine.hasCriticalIncident()) {
      this.emit('criticalIncident', {
        incident: this.safetyEngine.getLastCriticalIncident(),
        time: this.currentTime
      });
    }

    // Check budget constraints
    if (this.financialEngine.isBankrupt()) {
      this.emit('bankruptcy', {
        budget: this.festival.budget,
        time: this.currentTime
      });
    }
  }

  // Event handlers for cross-system communication
  private handleWeatherChange(weather: WeatherSystem): void {
    this.festival.weather = weather;
    
    // Update crowd behavior based on weather
    this.crowdEngine.updateWeatherImpact(weather);
    
    // Update logistics based on weather
    this.logisticsEngine.updateWeatherImpact(weather);
    
    // Update safety considerations
    this.safetyEngine.updateWeatherImpact(weather);
    
    this.emit('weatherChanged', { weather, time: this.currentTime });
  }

  private handleCrowdDensityChange(data: any): void {
    // Update venue capacity
    this.festival.currentAttendees = data.totalAttendees;
    
    // Check for capacity violations
    if (data.totalAttendees > this.festival.venue.capacity.fireCodeLimit) {
      this.safetyEngine.triggerCapacityViolation(data);
    }
    
    // Update security needs
    this.securityEngine.updateCrowdDensity(data);
    
    this.emit('crowdDensityChanged', { data, time: this.currentTime });
  }

  private handleIncident(incident: Incident): void {
    this.incidents.push(incident);
    
    // Update metrics
    this.metrics.safety.incidents++;
    
    // Trigger response protocols
    this.safetyEngine.triggerResponse(incident);
    
    // Update financial impact
    this.financialEngine.addIncidentCost(incident.cost);
    
    this.emit('incident', { incident, time: this.currentTime });
  }

  private handlePerformanceUpdate(performance: any): void {
    // Update crowd satisfaction
    this.crowdEngine.updatePerformanceSatisfaction(performance);
    
    // Update financial projections
    this.financialEngine.updatePerformanceRevenue(performance);
    
    this.emit('performanceUpdated', { performance, time: this.currentTime });
  }

  private handleBudgetAlert(alert: any): void {
    this.alerts.push(alert);
    
    // Trigger cost-cutting measures
    this.financialEngine.triggerCostCutting(alert);
    
    this.emit('budgetAlert', { alert, time: this.currentTime });
  }

  private handleCapacityWarning(warning: any): void {
    this.alerts.push(warning);
    
    // Notify security and logistics
    this.securityEngine.processDecision({ type: 'capacityWarning', data: warning });
    this.logisticsEngine.processDecision({ type: 'capacityWarning', data: warning });
    
    this.emit('capacityWarning', { warning, time: this.currentTime });
  }

  private handlePermitExpiry(expiry: any): void {
    this.alerts.push(expiry);
    
    // Notify compliance engine
    this.complianceEngine.processDecision({ type: 'permitExpiry', data: expiry });
    
    this.emit('permitExpiry', { expiry, time: this.currentTime });
  }

  private handleLicenseExpiry(expiry: any): void {
    this.alerts.push(expiry);
    
    // Notify compliance engine
    this.complianceEngine.processDecision({ type: 'licenseExpiry', data: expiry });
    
    this.emit('licenseExpiry', { expiry, time: this.currentTime });
  }

  // Public API methods
  public getFestival(): Festival {
    return this.festival;
  }

  public getCurrentTime(): Date {
    return this.currentTime;
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

  public makeDecision(decision: any): void {
    this.decisions.push({
      ...decision,
      timestamp: this.currentTime,
      id: uuidv4()
    });

    // Process the decision through relevant systems
    this.processDecision(decision);
    
    this.emit('decisionMade', { decision, time: this.currentTime });
  }

  private processDecision(decision: any): void {
    switch (decision.type) {
      case 'budget':
        this.financialEngine.processDecision(decision);
        break;
      case 'staffing':
        this.staffEngine.processDecision(decision);
        break;
      case 'security':
        this.securityEngine.processDecision(decision);
        break;
      case 'logistics':
        this.logisticsEngine.processDecision(decision);
        break;
      case 'performance':
        this.performanceEngine.processDecision(decision);
        break;
      case 'venue':
        this.venueEngine.processDecision(decision);
        break;
      case 'technical':
        this.technicalEngine.processDecision(decision);
        break;
      case 'compliance':
        this.complianceEngine.processDecision(decision);
        break;
      default:
        console.warn(`Unknown decision type: ${decision.type}`);
    }
  }

  public setTimeScale(scale: number): void {
    this.timeScale = Math.max(0.1, Math.min(10, scale));
    
    // Restart the simulation loop with new time scale
    if (this.isRunning) {
      this.pause();
      this.resume();
    }
  }

  public getTimeScale(): number {
    return this.timeScale;
  }

  public isSimulationRunning(): boolean {
    return this.isRunning;
  }

  public getFestivalStatus(): FestivalStatus {
    return this.festival.status;
  }

  // Emergency controls
  public emergencyStop(): void {
    this.festival.status = 'Cancelled';
    this.stop();
    this.emit('emergencyStop', { 
      reason: 'Emergency stop triggered',
      time: this.currentTime 
    });
  }

  public triggerEmergencyProtocol(protocol: string): void {
    this.safetyEngine.triggerEmergencyProtocol(protocol);
    this.emit('emergencyProtocol', { 
      protocol,
      time: this.currentTime 
    });
  }
}
