import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Festival, SimulationSettings, FestivalStatus, Incident } from '../types';

// Enhanced system engines
import { AccreditationEngine } from './systems/AccreditationEngine';
import { CrewManagementEngine } from './systems/CrewManagementEngine';
import { EnhancedLogisticsEngine } from './systems/EnhancedLogisticsEngine';
import { PowerInfrastructureEngine } from './systems/PowerInfrastructureEngine';
import { EnhancedSafetyEngine } from './systems/EnhancedSafetyEngine';
import { ProductionEngine } from './systems/ProductionEngine';
import { VendorOperationsEngine } from './systems/VendorOperationsEngine';
import { CustomerExperienceEngine } from './systems/CustomerExperienceEngine';

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
  PowerInfrastructure, SafetySystem, ProductionSystem,
  RetailSystem, CustomerExperienceSystem 
} from '../types/enhanced';

export class ComprehensiveSimulationEngine extends EventEmitter {
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
  private productionEngine: ProductionEngine;
  private vendorOperationsEngine: VendorOperationsEngine;
  private customerExperienceEngine: CustomerExperienceEngine;

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
  private metrics: any = {};
  private decisions: any[] = [];
  private alerts: any[] = [];
  private systemIntegrationStatus: any = {};

  constructor(festival: Festival, settings: SimulationSettings) {
    super();
    this.festival = festival;
    this.settings = settings;
    this.currentTime = festival.startDate;
    this.timeScale = settings.timeScale;

    // Initialize all system engines
    this.initializeEngines();
    this.setupEngineEventListeners();
    this.initializeSystemIntegration();
  }

  private initializeEngines(): void {
    // Enhanced engines
    this.accreditationEngine = new AccreditationEngine(this.createAccreditationSystem(), this.settings);
    this.crewManagementEngine = new CrewManagementEngine(this.festival, this.settings);
    this.enhancedLogisticsEngine = new EnhancedLogisticsEngine(this.festival, this.settings);
    this.powerInfrastructureEngine = new PowerInfrastructureEngine(this.festival.venue, this.settings);
    this.enhancedSafetyEngine = new EnhancedSafetyEngine(this.festival, this.settings);
    this.productionEngine = new ProductionEngine(this.festival, this.settings);
    this.vendorOperationsEngine = new VendorOperationsEngine(this.festival, this.settings);
    this.customerExperienceEngine = new CustomerExperienceEngine(this.festival, this.settings);

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
    // Weather engine events - cascade to all weather-dependent systems
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
      this.cascadeSecurityAlert(data);
    });

    // Crew management events - affect multiple systems
    this.crewManagementEngine.on('shiftNoShow', (data) => {
      this.handleStaffingShortage(data);
    });

    this.crewManagementEngine.on('mandatoryRest', (data) => {
      this.handleFatigueEvent(data);
    });

    // Enhanced logistics events
    this.enhancedLogisticsEngine.on('assetMissing', (data) => {
      this.handleAssetLoss(data);
    });

    this.enhancedLogisticsEngine.on('criticalBottleneck', (data) => {
      this.handleTrafficIssue(data);
    });

    // Power infrastructure events - critical system dependencies
    this.powerInfrastructureEngine.on('generatorFailure', (data) => {
      this.handlePowerFailure(data);
    });

    this.powerInfrastructureEngine.on('breakerTripped', (data) => {
      this.handlePowerOutage(data);
    });

    // Enhanced safety events
    this.enhancedSafetyEngine.on('towerRestrictionActivated', (data) => {
      this.handleWeatherRestriction(data);
    });

    this.enhancedSafetyEngine.on('spillIncident', (data) => {
      this.handleSpillIncident(data);
    });

    // Production events - affect performances and artists
    this.productionEngine.on('visaDenied', (data) => {
      this.handleVisaIssue(data);
    });

    this.productionEngine.on('showfileConversionFailed', (data) => {
      this.handleTechnicalIssue(data);
    });

    // Vendor operations events - affect customer experience
    this.vendorOperationsEngine.on('foodPrepBottleneck', (data) => {
      this.handleVendorIssue(data);
    });

    this.vendorOperationsEngine.on('ageCheckAuditFailed', (data) => {
      this.handleComplianceIssue(data);
    });

    // Customer experience events - affect satisfaction
    this.customerExperienceEngine.on('heatEmergencyActivated', (data) => {
      this.handleEmergencyActivation(data);
    });

    this.customerExperienceEngine.on('storageEgressImpact', (data) => {
      this.handleEgressImpact(data);
    });

    // Original engine events (maintaining compatibility)
    this.performanceEngine.on('performanceUpdate', (data) => {
      this.handlePerformanceUpdate(data);
    });

    this.crowdEngine.on('crowdDensityChanged', (data) => {
      this.handleCrowdDensityChange(data);
    });

    this.financialEngine.on('budgetAlert', (data) => {
      this.emit('budgetAlert', { ...data, time: this.currentTime });
    });
  }

  private initializeSystemIntegration(): void {
    this.systemIntegrationStatus = {
      accreditation: { online: true, lastUpdate: this.currentTime, dependencies: ['security', 'crowd'] },
      crewManagement: { online: true, lastUpdate: this.currentTime, dependencies: ['logistics', 'safety'] },
      logistics: { online: true, lastUpdate: this.currentTime, dependencies: ['power', 'crew'] },
      powerInfrastructure: { online: true, lastUpdate: this.currentTime, dependencies: ['weather', 'fuel'] },
      safety: { online: true, lastUpdate: this.currentTime, dependencies: ['weather', 'crowd', 'power'] },
      production: { online: true, lastUpdate: this.currentTime, dependencies: ['technical', 'logistics'] },
      vendorOperations: { online: true, lastUpdate: this.currentTime, dependencies: ['power', 'compliance'] },
      customerExperience: { online: true, lastUpdate: this.currentTime, dependencies: ['safety', 'weather'] }
    };
  }

  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.emit('simulationStarted', {
      time: this.currentTime,
      festival: this.festival,
      systems: Object.keys(this.systemIntegrationStatus)
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
    
    this.emit('simulationPaused', { time: this.currentTime });
  }

  public resume(): void {
    if (this.isRunning) return;
    this.start();
    this.emit('simulationResumed', { time: this.currentTime });
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
      metrics: this.metrics,
      summary: this.generateFinalSummary()
    });
  }

  private tick(): void {
    if (!this.isRunning) return;

    // Advance time
    this.advanceTime();

    // Process all systems in dependency order
    this.processSystems();

    // Update comprehensive metrics
    this.updateComprehensiveMetrics();

    // Check system integration status
    this.checkSystemIntegration();

    // Check for end conditions
    this.checkEndConditions();

    // Emit comprehensive tick event
    this.emit('tick', {
      time: this.currentTime,
      festival: this.festival,
      metrics: this.metrics,
      systemStatus: this.systemIntegrationStatus,
      alerts: this.alerts.slice(-10) // Last 10 alerts
    });
  }

  private advanceTime(): void {
    const timeIncrement = (this.tickRate * this.timeScale) / 1000;
    this.currentTime = new Date(this.currentTime.getTime() + timeIncrement);
  }

  private processSystems(): void {
    try {
      // Process weather first (affects everything)
      this.weatherEngine.process(this.currentTime);

      // Process core infrastructure
      this.powerInfrastructureEngine.process(this.currentTime);
      
      // Process safety systems
      this.enhancedSafetyEngine.process(this.currentTime);
      
      // Process crowd and security
      this.crowdEngine.process(this.currentTime);
      this.accreditationEngine.process(this.currentTime);
      this.securityEngine.process(this.currentTime);

      // Process operational systems
      this.crewManagementEngine.process(this.currentTime);
      this.enhancedLogisticsEngine.process(this.currentTime);
      
      // Process production systems
      this.productionEngine.process(this.currentTime);
      this.performanceEngine.process(this.currentTime);
      
      // Process vendor operations
      this.vendorOperationsEngine.process(this.currentTime);
      this.vendorEngine.process(this.currentTime);

      // Process customer experience
      this.customerExperienceEngine.process(this.currentTime);

      // Process support systems
      this.financialEngine.process(this.currentTime);
      this.aiEngine.process(this.currentTime);
      this.venueEngine.process(this.currentTime);
      this.technicalEngine.process(this.currentTime);
      this.complianceEngine.process(this.currentTime);

    } catch (error) {
      this.emit('systemError', { 
        error: error, 
        time: this.currentTime,
        system: 'processSystems'
      });
    }
  }

  private updateComprehensiveMetrics(): void {
    this.metrics = {
      timestamp: this.currentTime,
      
      // Enhanced system metrics
      accreditation: this.accreditationEngine.getMetrics(),
      crewManagement: this.crewManagementEngine.getMetrics(),
      logistics: this.enhancedLogisticsEngine.getMetrics(),
      powerInfrastructure: this.powerInfrastructureEngine.getMetrics(),
      enhancedSafety: this.enhancedSafetyEngine.getMetrics(),
      production: this.productionEngine.getMetrics(),
      vendorOperations: this.vendorOperationsEngine.getMetrics(),
      customerExperience: this.customerExperienceEngine.getMetrics(),
      
      // Original system metrics
      weather: this.weatherEngine.getWeatherMetrics(),
      attendance: this.crowdEngine.getAttendanceMetrics(),
      financial: this.financialEngine.getFinancialMetrics(),
      performance: this.performanceEngine.getPerformanceMetrics(),
      vendor: this.vendorEngine.getVendorMetrics(),
      security: this.securityEngine.getSecurityMetrics(),
      venue: this.venueEngine.getVenueMetrics(),
      technical: this.technicalEngine.getTechnicalMetrics(),
      compliance: this.complianceEngine.getComplianceMetrics(),

      // Integrated metrics
      overall: this.calculateOverallPerformance(),
      systemIntegration: this.systemIntegrationStatus,
      criticalAlerts: this.alerts.filter(alert => alert.severity === 'Critical').length,
      totalIncidents: this.incidents.length
    };
  }

  private checkSystemIntegration(): void {
    // Monitor system dependencies and integration health
    for (const [systemName, status] of Object.entries(this.systemIntegrationStatus)) {
      const timeSinceUpdate = this.currentTime.getTime() - (status as any).lastUpdate.getTime();
      
      if (timeSinceUpdate > 5 * 60 * 1000) { // 5 minutes without update
        (status as any).online = false;
        
        this.emit('systemIntegrationIssue', {
          system: systemName,
          issue: 'System not responding',
          timeSinceUpdate: timeSinceUpdate / 1000,
          time: this.currentTime
        });
      }
    }
  }

  private checkEndConditions(): void {
    // Check if festival has ended
    if (this.currentTime >= this.festival.endDate) {
      this.festival.status = 'Complete';
      this.stop();
      return;
    }

    // Check for critical system failures
    const offlineSystems = Object.values(this.systemIntegrationStatus)
      .filter(status => !(status as any).online).length;
    
    if (offlineSystems > 3) {
      this.emit('criticalSystemFailure', {
        reason: 'Multiple system failures',
        offlineCount: offlineSystems,
        time: this.currentTime
      });
    }

    // Check for emergency conditions
    const criticalIncidents = this.incidents.filter(i => 
      i.severity === 'Critical' && 
      (this.currentTime.getTime() - i.timestamp.getTime()) < 60 * 60 * 1000 // Last hour
    ).length;

    if (criticalIncidents > 5) {
      this.emit('emergencyCondition', {
        reason: 'Multiple critical incidents',
        incidentCount: criticalIncidents,
        time: this.currentTime
      });
    }
  }

  // Event handlers for system integration
  private handleWeatherChange(data: any): void {
    // Weather affects multiple systems
    this.systemIntegrationStatus.powerInfrastructure.lastUpdate = this.currentTime;
    this.systemIntegrationStatus.safety.lastUpdate = this.currentTime;
    this.systemIntegrationStatus.customerExperience.lastUpdate = this.currentTime;
  }

  private handleSecurityAlert(data: any): void {
    const alert = {
      id: uuidv4(),
      type: 'Security',
      severity: 'High',
      description: data.type,
      timestamp: this.currentTime,
      resolved: false
    };
    
    this.alerts.push(alert);
    this.cascadeSecurityAlert(data);
  }

  private cascadeSecurityAlert(data: any): void {
    // Security alerts affect crowd management and accreditation
    this.emit('securityCascade', {
      originalAlert: data,
      affectedSystems: ['accreditation', 'crowd', 'customerExperience'],
      time: this.currentTime
    });
  }

  private handleStaffingShortage(data: any): void {
    const incident: Incident = {
      id: uuidv4(),
      type: 'Security',
      severity: 'Minor',
      location: { x: 0, y: 0, zone: data.shift.location },
      description: `Staff shortage: ${data.shift.role} no-show`,
      timestamp: this.currentTime,
      resolved: false,
      response: { responseTime: 0, staffInvolved: [], actions: [], followUp: [] },
      cost: data.shift.rate * data.shift.duration
    };

    this.incidents.push(incident);
    this.financialEngine.addIncidentCost(incident.cost);

    // Cascade to affected systems
    this.emit('staffingImpact', {
      shortage: data,
      affectedOperations: this.identifyAffectedOperations(data.shift.department),
      time: this.currentTime
    });
  }

  private handleFatigueEvent(data: any): void {
    this.emit('fatigueAlert', {
      staff: data.tracker,
      impact: 'Performance degradation',
      mitigationRequired: true,
      time: this.currentTime
    });
  }

  private handleAssetLoss(data: any): void {
    const incident: Incident = {
      id: uuidv4(),
      type: 'Equipment',
      severity: data.asset.value > 10000 ? 'Major' : 'Minor',
      location: data.asset.location,
      description: `Asset missing: ${data.asset.name}`,
      timestamp: this.currentTime,
      resolved: false,
      response: { responseTime: 0, staffInvolved: [], actions: [], followUp: [] },
      cost: data.asset.value * 0.1
    };

    this.incidents.push(incident);
    this.financialEngine.addIncidentCost(incident.cost);
  }

  private handleTrafficIssue(data: any): void {
    // Traffic bottlenecks affect logistics and customer experience
    this.emit('trafficCascade', {
      bottleneck: data,
      affectedSystems: ['logistics', 'customerExperience', 'vendorOperations'],
      estimatedDelay: data.bottleneck.estimatedDelay,
      time: this.currentTime
    });
  }

  private handlePowerFailure(data: any): void {
    const incident: Incident = {
      id: uuidv4(),
      type: 'Technical',
      severity: 'Critical',
      location: { x: 0, y: 0, zone: 'Power Infrastructure' },
      description: `Generator failure: ${data.failureType}`,
      timestamp: this.currentTime,
      resolved: false,
      response: { responseTime: 0, staffInvolved: [], actions: [], followUp: [] },
      cost: 15000
    };

    this.incidents.push(incident);
    this.financialEngine.addIncidentCost(incident.cost);

    // Power failures affect all electrical systems
    this.emit('powerFailureCascade', {
      generator: data.generator,
      affectedSystems: ['accreditation', 'vendorOperations', 'customerExperience', 'technical'],
      time: this.currentTime
    });
  }

  private handlePowerOutage(data: any): void {
    this.emit('powerOutage', {
      panel: data.panel,
      breaker: data.breaker,
      affectedLoads: data.breaker.loads,
      time: this.currentTime
    });
  }

  private handleWeatherRestriction(data: any): void {
    // Weather restrictions affect performances and customer experience
    this.emit('performanceRestriction', {
      restriction: data.restriction,
      affectedEquipment: data.restriction.type,
      time: this.currentTime
    });
  }

  private handleSpillIncident(data: any): void {
    const incident: Incident = {
      id: uuidv4(),
      type: 'Safety',
      severity: data.severity === 'Major' ? 'Major' : 'Minor',
      location: data.zone.location,
      description: `Spill in ${data.zone.type} area`,
      timestamp: this.currentTime,
      resolved: false,
      response: { responseTime: 0, staffInvolved: [], actions: [], followUp: [] },
      cost: data.severity === 'Major' ? 10000 : 2000
    };

    this.incidents.push(incident);
    this.financialEngine.addIncidentCost(incident.cost);
  }

  private handleVisaIssue(data: any): void {
    // Visa issues affect production and performance schedules
    this.emit('productionImpact', {
      visaIssue: data,
      artistAffected: data.visaCheck.artistId,
      financialImpact: data.impact,
      time: this.currentTime
    });
  }

  private handleTechnicalIssue(data: any): void {
    this.emit('technicalFailure', {
      conversion: data.conversion,
      artist: data.conversion.artistId,
      backup_plan: 'Manual setup required',
      time: this.currentTime
    });
  }

  private handleVendorIssue(data: any): void {
    // Vendor issues affect customer satisfaction
    this.emit('customerServiceImpact', {
      vendor: data.vendorId,
      issue: 'Food preparation bottleneck',
      expectedDelay: data.throughputLimit,
      time: this.currentTime
    });
  }

  private handleComplianceIssue(data: any): void {
    const incident: Incident = {
      id: uuidv4(),
      type: 'Compliance',
      severity: 'Major',
      location: { x: 0, y: 0, zone: 'Vendor Area' },
      description: 'Age verification compliance failure',
      timestamp: this.currentTime,
      resolved: false,
      response: { responseTime: 0, staffInvolved: [], actions: [], followUp: [] },
      cost: data.audit.fineRisk * 1000
    };

    this.incidents.push(incident);
    this.financialEngine.addIncidentCost(incident.cost);
  }

  private handleEmergencyActivation(data: any): void {
    this.emit('emergencyProtocolActivated', {
      type: 'Heat Emergency',
      level: data.level,
      actions: data.actions,
      affectedSystems: ['safety', 'customerExperience', 'vendorOperations'],
      time: this.currentTime
    });
  }

  private handleEgressImpact(data: any): void {
    this.emit('egressAlert', {
      impact: data.impact,
      causes: data.causes,
      safetyImplication: 'Emergency evacuation may be affected',
      time: this.currentTime
    });
  }

  private handlePerformanceUpdate(data: any): void {
    this.crowdEngine.updatePerformanceSatisfaction(data);
    this.financialEngine.updatePerformanceRevenue(data);
    
    // Cascade to customer experience
    this.emit('performanceFeedback', {
      performance: data,
      crowdResponse: 'positive',
      time: this.currentTime
    });
  }

  private handleCrowdDensityChange(data: any): void {
    this.securityEngine.updateCrowdDensity(data);
    
    // High density affects customer experience and safety
    if (data.density > 0.8) {
      this.emit('crowdDensityAlert', {
        density: data.density,
        location: data.location,
        recommendedAction: 'Implement crowd control measures',
        time: this.currentTime
      });
    }
  }

  private identifyAffectedOperations(department: string): string[] {
    const operationMap: Record<string, string[]> = {
      'Security': ['accreditation', 'customerExperience', 'crowd'],
      'Technical': ['production', 'powerInfrastructure', 'performance'],
      'Medical': ['safety', 'customerExperience', 'compliance'],
      'Logistics': ['vendorOperations', 'logistics', 'crew'],
      'Vendor': ['vendorOperations', 'customerExperience', 'financial']
    };

    return operationMap[department] || [];
  }

  private calculateOverallPerformance(): any {
    const systemScores = {
      accreditation: this.calculateSystemScore('accreditation'),
      safety: this.calculateSystemScore('safety'),
      logistics: this.calculateSystemScore('logistics'),
      production: this.calculateSystemScore('production'),
      customerExperience: this.calculateSystemScore('customerExperience'),
      financial: this.calculateSystemScore('financial')
    };

    const averageScore = Object.values(systemScores).reduce((sum, score) => sum + score, 0) / Object.keys(systemScores).length;

    return {
      overallScore: averageScore,
      systemBreakdown: systemScores,
      grade: this.calculateGrade(averageScore),
      recommendations: this.generateRecommendations(systemScores)
    };
  }

  private calculateSystemScore(systemType: string): number {
    switch (systemType) {
      case 'accreditation':
        const accredMetrics = this.metrics.accreditation || {};
        return Math.min(10, 5 + (accredMetrics.activeBadges || 0) / 100);
      
      case 'safety':
        const safetyMetrics = this.metrics.enhancedSafety || {};
        return Math.max(0, 10 - (this.incidents.filter(i => i.type === 'Safety').length * 0.5));
      
      case 'logistics':
        const logisticsMetrics = this.metrics.logistics || {};
        return Math.min(10, (logisticsMetrics.routes?.utilization || 0.5) * 10);
      
      case 'production':
        const productionMetrics = this.metrics.production || {};
        return (productionMetrics.productionReadiness || 0.8) * 10;
      
      case 'customerExperience':
        const customerMetrics = this.metrics.customerExperience || {};
        return customerMetrics.customerSatisfaction?.overall || 7;
      
      case 'financial':
        const financialMetrics = this.metrics.financial || {};
        return Math.max(0, 10 - ((financialMetrics.costs || 0) / (financialMetrics.revenue || 1)) * 10);
      
      default:
        return 7;
    }
  }

  private calculateGrade(score: number): string {
    if (score >= 9) return 'A+';
    if (score >= 8) return 'A';
    if (score >= 7) return 'B+';
    if (score >= 6) return 'B';
    if (score >= 5) return 'C+';
    if (score >= 4) return 'C';
    if (score >= 3) return 'D';
    return 'F';
  }

  private generateRecommendations(systemScores: Record<string, number>): string[] {
    const recommendations: string[] = [];
    
    for (const [system, score] of Object.entries(systemScores)) {
      if (score < 6) {
        recommendations.push(`Improve ${system} system performance (current score: ${score.toFixed(1)})`);
      }
    }

    if (this.incidents.length > 20) {
      recommendations.push('Implement proactive incident prevention measures');
    }

    if (this.alerts.length > 10) {
      recommendations.push('Address system alerts to improve overall stability');
    }

    return recommendations;
  }

  private generateFinalSummary(): any {
    const totalRevenue = this.metrics.financial?.revenue || 0;
    const totalCosts = this.metrics.financial?.costs || 0;
    const totalIncidents = this.incidents.length;
    const totalAttendees = this.metrics.attendance?.total || 0;

    return {
      duration: {
        start: this.festival.startDate,
        end: this.currentTime,
        totalHours: (this.currentTime.getTime() - this.festival.startDate.getTime()) / (1000 * 60 * 60)
      },
      financial: {
        revenue: totalRevenue,
        costs: totalCosts,
        profit: totalRevenue - totalCosts,
        roi: totalCosts > 0 ? ((totalRevenue - totalCosts) / totalCosts) * 100 : 0
      },
      attendance: {
        total: totalAttendees,
        capacity: this.festival.capacity,
        utilization: (totalAttendees / this.festival.capacity) * 100
      },
      safety: {
        totalIncidents,
        criticalIncidents: this.incidents.filter(i => i.severity === 'Critical').length,
        incidentRate: totalIncidents / Math.max(1, totalAttendees) * 1000 // Per 1000 attendees
      },
      performance: this.metrics.overall,
      topIssues: this.identifyTopIssues(),
      achievements: this.identifyAchievements()
    };
  }

  private identifyTopIssues(): string[] {
    const issueCount: Record<string, number> = {};
    
    for (const incident of this.incidents) {
      issueCount[incident.type] = (issueCount[incident.type] || 0) + 1;
    }

    return Object.entries(issueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => `${type}: ${count} incidents`);
  }

  private identifyAchievements(): string[] {
    const achievements: string[] = [];
    
    if (this.metrics.overall?.overallScore >= 8) {
      achievements.push('Excellent overall performance');
    }
    
    if (this.incidents.filter(i => i.severity === 'Critical').length === 0) {
      achievements.push('Zero critical incidents');
    }
    
    if (this.metrics.customerExperience?.customerSatisfaction?.overall >= 8) {
      achievements.push('High customer satisfaction achieved');
    }
    
    if (this.metrics.financial?.profit > 0) {
      achievements.push('Profitable event operation');
    }

    return achievements;
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

  // Public API methods
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

  public getComprehensiveMetrics(): any {
    return this.metrics;
  }

  public getSystemIntegrationStatus(): any {
    return this.systemIntegrationStatus;
  }

  public getIncidents(): Incident[] {
    return this.incidents;
  }

  public getAlerts(): any[] {
    return this.alerts;
  }

  // Enhanced system access methods
  public getAccreditationSystem(): any {
    return this.accreditationEngine.getSystemStatus();
  }

  public getCrewManagement(): any {
    return this.crewManagementEngine.getMetrics();
  }

  public getEnhancedLogistics(): any {
    return this.enhancedLogisticsEngine.getMetrics();
  }

  public getPowerInfrastructure(): any {
    return this.powerInfrastructureEngine.getMetrics();
  }

  public getEnhancedSafety(): any {
    return this.enhancedSafetyEngine.getMetrics();
  }

  public getProduction(): any {
    return this.productionEngine.getMetrics();
  }

  public getVendorOperations(): any {
    return this.vendorOperationsEngine.getMetrics();
  }

  public getCustomerExperience(): any {
    return this.customerExperienceEngine.getMetrics();
  }

  // Administrative methods
  public createBadge(type: any, personId: string, name: string, securityLevel: number): any {
    return this.accreditationEngine.createBadge(type, personId, name, securityLevel);
  }

  public scheduleLoadIn(assignedTo: string, dock: string, duration: number, type: any): string {
    return this.enhancedLogisticsEngine.scheduleLoadIn(assignedTo, dock, duration, type);
  }

  public requestShiftSwap(requesterId: string, targetId: string, originalShift: string, proposedShift: string, reason: string): string {
    return this.crewManagementEngine.requestShiftSwap(requesterId, targetId, originalShift, proposedShift, reason);
  }

  public issueReentryPass(personId: string): string {
    return this.customerExperienceEngine.issueReentryQR(personId);
  }

  public forceSystemReset(systemName: string): void {
    if (this.systemIntegrationStatus[systemName]) {
      this.systemIntegrationStatus[systemName].online = true;
      this.systemIntegrationStatus[systemName].lastUpdate = this.currentTime;
      
      this.emit('systemReset', {
        system: systemName,
        time: this.currentTime,
        operator: 'Manual'
      });
    }
  }

  public getMetrics(): any {
    return this.metrics;
  }
}