import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { SimulationSettings, Festival, Location } from '../../types';
import { 
  SafetySystem, FOHTower, GroundProtection, SpillResponseSystem, FirePoint,
  NoiseControl, PatrolRoute, ResidentHotline, WindThreshold, TowerRestriction,
  MatDeployment, SpillKit, SpillInspection, HazardZone, NoisePropagation,
  SoundWall, NoiseMonitor, NoiseComplaint, ResponseHeatmap, ResidentCall
} from '../../types/enhanced';

export class EnhancedSafetyEngine extends EventEmitter {
  private system: SafetySystem;
  private settings: SimulationSettings;
  private festival: Festival;

  constructor(festival: Festival, settings: SimulationSettings) {
    super();
    this.festival = festival;
    this.settings = settings;
    this.system = this.initializeSystem();
  }

  private initializeSystem(): SafetySystem {
    return {
      fohTower: this.createFOHTower(),
      groundProtection: this.createGroundProtection(),
      spillResponse: this.createSpillResponseSystem(),
      firePoints: this.createFirePoints(),
      noiseControl: this.createNoiseControl(),
      patrolRoutes: this.createPatrolRoutes(),
      residentHotline: this.createResidentHotline()
    };
  }

  public process(currentTime: Date): void {
    this.monitorFOHTower(currentTime);
    this.manageGroundProtection(currentTime);
    this.processSpillResponse(currentTime);
    this.monitorFirePoints(currentTime);
    this.controlNoise(currentTime);
    this.managePatrols(currentTime);
    this.handleResidentCalls(currentTime);
    this.assessEnvironmentalRisk(currentTime);
  }

  private monitorFOHTower(currentTime: Date): void {
    const tower = this.system.fohTower;
    
    // Simulate wind speed variations
    const windVariation = (Math.random() - 0.5) * 5; // ±2.5 m/s variation
    tower.currentWindSpeed = Math.max(0, tower.currentWindSpeed + windVariation);

    // Check wind thresholds
    for (const threshold of tower.windThresholds) {
      if (tower.currentWindSpeed >= threshold.speed) {
        const restriction: TowerRestriction = {
          type: threshold.equipmentAffected.includes('PA') && threshold.equipmentAffected.includes('LED') ? 'Full' :
                threshold.equipmentAffected.includes('PA') ? 'PA' : 'LED',
          active: true,
          reason: `Wind speed ${tower.currentWindSpeed.toFixed(1)} m/s exceeds threshold`,
          since: currentTime
        };

        // Check if this restriction is new
        const existingRestriction = tower.restrictions.find(r => 
          r.type === restriction.type && r.active
        );

        if (!existingRestriction) {
          tower.restrictions.push(restriction);
          
          // Apply restrictions
          switch (restriction.type) {
            case 'PA':
              tower.paOperations = false;
              break;
            case 'LED':
              tower.ledOperations = false;
              break;
            case 'Full':
              tower.paOperations = false;
              tower.ledOperations = false;
              break;
          }

          this.emit('towerRestrictionActivated', { 
            tower, 
            restriction, 
            windSpeed: tower.currentWindSpeed,
            time: currentTime 
          });
        }
      }
    }

    // Remove restrictions if wind drops
    for (const restriction of tower.restrictions) {
      if (restriction.active) {
        const threshold = tower.windThresholds.find(t => 
          t.equipmentAffected.some(eq => restriction.type.includes(eq.substring(0, 2)))
        );

        if (threshold && tower.currentWindSpeed < threshold.speed - 2) { // 2 m/s hysteresis
          restriction.active = false;
          
          // Remove operational restrictions
          if (restriction.type === 'PA' || restriction.type === 'Full') {
            tower.paOperations = true;
          }
          if (restriction.type === 'LED' || restriction.type === 'Full') {
            tower.ledOperations = true;
          }

          this.emit('towerRestrictionLifted', { 
            tower, 
            restriction, 
            windSpeed: tower.currentWindSpeed,
            time: currentTime 
          });
        }
      }
    }
  }

  private manageGroundProtection(currentTime: Date): void {
    const protection = this.system.groundProtection;
    
    // Update weather impact on mud levels
    const precipitation = this.festival.weather.current.precipitation || 0;
    protection.weatherImpact = Math.min(1, precipitation / 50); // 50mm = max impact

    // Update mat deployment based on conditions
    for (const deployment of protection.matDeployment) {
      // Increase mud level based on weather and traffic
      deployment.mudLevel = Math.min(10, deployment.mudLevel + 
        (protection.weatherImpact * 0.5) + (deployment.trafficLevel * 0.1)
      );

      // Determine mats required
      const requiredMats = Math.ceil(deployment.mudLevel * deployment.trafficLevel / 10);
      deployment.matsRequired = requiredMats;

      // Deploy mats if needed and available
      const availableMats = protection.matsRented - 
        protection.matDeployment.reduce((sum, d) => sum + d.matsDeployed, 0);

      if (deployment.matsDeployed < deployment.matsRequired && availableMats > 0) {
        const matsToDeploy = Math.min(
          deployment.matsRequired - deployment.matsDeployed,
          availableMats
        );
        deployment.matsDeployed += matsToDeploy;
        
        this.emit('matsDeployed', { 
          zone: deployment.zone,
          matsDeployed: matsToDeploy,
          totalDeployed: deployment.matsDeployed,
          time: currentTime 
        });
      }

      // Calculate venue damage risk
      if (deployment.mudLevel > 7 && deployment.matsDeployed < deployment.matsRequired) {
        protection.mudDamageRisk = Math.min(1, protection.mudDamageRisk + 0.1);
        
        this.emit('venueDamageRisk', { 
          zone: deployment.zone,
          mudLevel: deployment.mudLevel,
          riskLevel: protection.mudDamageRisk,
          time: currentTime 
        });
      }
    }

    // Calculate potential venue damage costs
    if (protection.mudDamageRisk > 0.5) {
      protection.venueGroundsCost = protection.mudDamageRisk * 50000; // Up to $50k damage
      
      if (protection.mudDamageRisk > 0.8) {
        this.emit('severeVenueDamage', { 
          estimatedCost: protection.venueGroundsCost,
          riskLevel: protection.mudDamageRisk,
          time: currentTime 
        });
      }
    }
  }

  private processSpillResponse(currentTime: Date): void {
    const response = this.system.spillResponse;
    
    // Process spill kit inspections
    for (const inspection of response.inspectionSchedule) {
      if (inspection.scheduled <= currentTime && !inspection.completed) {
        this.performSpillInspection(inspection, currentTime);
      }
    }

    // Monitor hazard zones
    for (const zone of response.oilyAreas.concat(response.fuelAreas)) {
      this.monitorHazardZone(zone, currentTime);
      
      // Check spill kit availability
      const availableKits = response.kits.filter(kit => 
        kit.status === 'Ready' && this.isKitSuitable(kit, zone)
      ).length;

      if (availableKits < zone.spillKitsRequired) {
        this.emit('inadequateSpillKits', { 
          zone, 
          required: zone.spillKitsRequired,
          available: availableKits,
          time: currentTime 
        });
      }
    }

    // Random spill events
    if (Math.random() < 0.001) { // 0.1% chance per tick
      this.simulateSpillIncident(currentTime);
    }

    // Spill kit maintenance
    this.maintainSpillKits(currentTime);
  }

  private monitorFirePoints(currentTime: Date): void {
    for (const firePoint of this.system.firePoints) {
      // Regular inspections
      const daysSinceInspection = (currentTime.getTime() - firePoint.lastInspection.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceInspection > 30) { // Monthly inspections
        this.performFirePointInspection(firePoint, currentTime);
      }

      // Check expiry
      if (firePoint.type === 'Dry' && daysSinceInspection > 365) {
        firePoint.status = 'Expired';
        this.emit('firePointExpired', { firePoint, time: currentTime });
      }

      // Random usage/depletion
      if (Math.random() < 0.002) { // 0.2% chance
        if (firePoint.status === 'Ready') {
          firePoint.status = 'Used';
          firePoint.capacity = Math.max(0, firePoint.capacity - Math.random() * 50);
          
          this.emit('firePointUsed', { 
            firePoint, 
            remainingCapacity: firePoint.capacity,
            time: currentTime 
          });
        }
      }
    }

    // Check fire point density coverage
    this.checkFireCoverage(currentTime);
  }

  private controlNoise(currentTime: Date): void {
    const noise = this.system.noiseControl;
    
    // Update noise propagation
    this.updateNoisePropagation(noise, currentTime);
    
    // Monitor noise levels at monitoring points
    for (const monitor of noise.monitoringPoints) {
      if (monitor.status === 'Active') {
        // Simulate noise level readings
        const baseLevel = 70 + Math.random() * 30; // 70-100 dB base
        const stageFactor = this.getStageNoiseFactor(currentTime);
        monitor.currentLevel = baseLevel * stageFactor;

        // Check violations
        if (monitor.currentLevel > monitor.maxLevel) {
          monitor.violations++;
          
          this.emit('noiseViolation', { 
            monitor, 
            currentLevel: monitor.currentLevel,
            maxLevel: monitor.maxLevel,
            time: currentTime 
          });

          // Auto-deploy sound walls if available
          this.deployEmergencySoundWalls(monitor.location, currentTime);
        }
      }
    }

    // Process noise complaints
    this.processNoiseComplaints(noise, currentTime);
    
    // Optimize sound wall placement
    this.optimizeSoundWalls(noise, currentTime);
  }

  private managePatrols(currentTime: Date): void {
    for (const route of this.system.patrolRoutes) {
      if (route.status === 'Active') {
        // Update patrol progress
        this.updatePatrolProgress(route, currentTime);
        
        // Update response time heatmap
        this.updateResponseHeatmap(route, currentTime);
        
        // Check for incidents requiring response
        if (Math.random() < 0.05) { // 5% chance per tick
          this.simulatePatrolIncident(route, currentTime);
        }
      }

      // Handle patrol breaks and shift changes
      this.managePatrolSchedule(route, currentTime);
    }

    // Optimize patrol routes based on incident patterns
    this.optimizePatrolRoutes(currentTime);
  }

  private handleResidentCalls(currentTime: Date): void {
    const hotline = this.system.residentHotline;
    
    // Process incoming calls
    if (hotline.staffed && Math.random() < 0.02) { // 2% chance per tick
      this.simulateResidentCall(hotline, currentTime);
    }

    // Update daily complaint count
    const today = currentTime.toDateString();
    hotline.complaintsToday = hotline.calls.filter(call => 
      call.timestamp.toDateString() === today
    ).length;

    // Update goodwill score based on complaint handling
    this.updateGoodwillScore(hotline, currentTime);

    // Process unresolved calls
    this.processUnresolvedCalls(hotline, currentTime);
  }

  private assessEnvironmentalRisk(currentTime: Date): void {
    // Calculate overall environmental risk score
    let riskScore = 0;

    // Weather risk
    const windRisk = Math.min(1, this.system.fohTower.currentWindSpeed / 25); // 25 m/s = max
    riskScore += windRisk * 0.2;

    // Ground damage risk
    riskScore += this.system.groundProtection.mudDamageRisk * 0.15;

    // Spill risk
    const spillRisk = this.system.spillResponse.oilyAreas.length * 0.1 + 
                     this.system.spillResponse.fuelAreas.length * 0.15;
    riskScore += Math.min(1, spillRisk) * 0.2;

    // Fire safety risk
    const expiredFirePoints = this.system.firePoints.filter(fp => fp.status === 'Expired').length;
    const fireRisk = expiredFirePoints / this.system.firePoints.length;
    riskScore += fireRisk * 0.25;

    // Noise compliance risk
    const noiseViolations = this.system.noiseControl.monitoringPoints.reduce(
      (sum, monitor) => sum + monitor.violations, 0
    );
    const noiseRisk = Math.min(1, noiseViolations / 10);
    riskScore += noiseRisk * 0.1;

    // Community goodwill risk
    const goodwillRisk = 1 - (this.system.residentHotline.goodwillScore / 10);
    riskScore += goodwillRisk * 0.1;

    // Emit risk alerts
    if (riskScore > 0.7) {
      this.emit('highEnvironmentalRisk', { 
        riskScore, 
        components: {
          wind: windRisk,
          ground: this.system.groundProtection.mudDamageRisk,
          spill: spillRisk,
          fire: fireRisk,
          noise: noiseRisk,
          community: goodwillRisk
        },
        time: currentTime 
      });
    }
  }

  // Helper methods
  private performSpillInspection(inspection: SpillInspection, currentTime: Date): void {
    inspection.completed = currentTime;
    inspection.passed = Math.random() > 0.1; // 90% pass rate
    
    const kit = this.system.spillResponse.kits.find(k => k.id === inspection.kitId);
    if (kit) {
      if (!inspection.passed) {
        inspection.issues = [
          'Expired absorbent materials',
          'Missing containment boom',
          'Damaged container'
        ].filter(() => Math.random() > 0.7); // Random issues
        
        kit.status = 'Expired';
        this.emit('spillKitFailed', { kit, inspection, time: currentTime });
      } else {
        kit.status = 'Ready';
      }
    }
  }

  private monitorHazardZone(zone: HazardZone, currentTime: Date): void {
    // Increase risk level over time
    if (Math.random() < 0.01) {
      zone.riskLevel = Math.min(10, zone.riskLevel + 0.1);
    }

    // Check inspection schedule
    const daysSinceInspection = (currentTime.getTime() - zone.lastInspection.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceInspection > 7) { // Weekly inspections for hazard zones
      zone.lastInspection = currentTime;
      zone.riskLevel = Math.max(1, zone.riskLevel - 0.5); // Risk reduction after inspection
      
      this.emit('hazardZoneInspected', { zone, time: currentTime });
    }

    // High risk alert
    if (zone.riskLevel > 7) {
      this.emit('highRiskHazardZone', { zone, time: currentTime });
    }
  }

  private isKitSuitable(kit: SpillKit, zone: HazardZone): boolean {
    const suitableTypes: Record<string, string[]> = {
      'Oily': ['Oil', 'Universal'],
      'Fuel': ['Fuel', 'Universal'],
      'Chemical': ['Chemical', 'Universal']
    };
    
    return suitableTypes[zone.type]?.includes(kit.type) || false;
  }

  private simulateSpillIncident(currentTime: Date): void {
    const hazardZones = [...this.system.spillResponse.oilyAreas, ...this.system.spillResponse.fuelAreas];
    if (hazardZones.length === 0) return;

    const affectedZone = hazardZones[Math.floor(Math.random() * hazardZones.length)];
    affectedZone.riskLevel = Math.min(10, affectedZone.riskLevel + 2);

    // Find suitable response kits
    const availableKits = this.system.spillResponse.kits.filter(kit => 
      kit.status === 'Ready' && this.isKitSuitable(kit, affectedZone)
    );

    if (availableKits.length > 0) {
      const usedKit = availableKits[0];
      usedKit.status = 'Used';
      
      this.emit('spillIncident', { 
        zone: affectedZone,
        responseKit: usedKit,
        severity: affectedZone.riskLevel > 7 ? 'Major' : 'Minor',
        time: currentTime 
      });
    } else {
      this.emit('spillIncidentNoResponse', { 
        zone: affectedZone,
        severity: 'Critical',
        time: currentTime 
      });
    }
  }

  private maintainSpillKits(currentTime: Date): void {
    for (const kit of this.system.spillResponse.kits) {
      const daysSinceInspection = (currentTime.getTime() - kit.lastInspection.getTime()) / (1000 * 60 * 60 * 24);
      
      // Monthly kit inspections
      if (daysSinceInspection > 30) {
        kit.lastInspection = currentTime;
        
        // Refill used kits
        if (kit.status === 'Used' && Math.random() > 0.3) { // 70% refill success
          kit.status = 'Ready';
          // Refill contents
          for (const item of kit.contents) {
            if (item.status === 'Used') {
              item.status = 'Available';
              item.quantity = Math.ceil(item.quantity * 1.5); // Increase quantity
            }
          }
          
          this.emit('spillKitRefilled', { kit, time: currentTime });
        }
      }

      // Check for expired items
      for (const item of kit.contents) {
        if (Math.random() < 0.005) { // 0.5% chance per tick
          item.status = 'Expired';
        }
      }

      // Overall kit status based on contents
      const expiredItems = kit.contents.filter(item => item.status === 'Expired').length;
      if (expiredItems > kit.contents.length * 0.3) { // More than 30% expired
        kit.status = 'Expired';
      }
    }
  }

  private performFirePointInspection(firePoint: FirePoint, currentTime: Date): void {
    firePoint.lastInspection = currentTime;
    
    // 95% pass rate for fire point inspections
    if (Math.random() > 0.05) {
      firePoint.status = 'Ready';
      firePoint.capacity = Math.min(100, firePoint.capacity + 10); // Top up capacity
    } else {
      firePoint.status = 'Maintenance';
      this.emit('firePointMaintenanceRequired', { firePoint, time: currentTime });
    }
  }

  private checkFireCoverage(currentTime: Date): void {
    // Simple grid-based coverage check
    const zones = ['Stage', 'VIP', 'General', 'Backstage', 'Vendor'];
    
    for (const zone of zones) {
      const zoneFirePoints = this.system.firePoints.filter(fp => 
        fp.zone === zone && fp.status === 'Ready'
      );
      
      const coverage = Math.min(100, zoneFirePoints.length * 25); // 25% per fire point
      
      if (coverage < 75) {
        this.emit('inadequateFireCoverage', { 
          zone, 
          coverage, 
          firePoints: zoneFirePoints.length,
          time: currentTime 
        });
      }
    }
  }

  private updateNoisePropagation(noise: NoiseControl, currentTime: Date): void {
    for (const propagation of noise.propagationMap) {
      // Update noise levels based on stage activity
      const stageFactor = this.getStageNoiseFactor(currentTime);
      propagation.level = (80 + Math.random() * 20) * stageFactor; // 80-100 dB base

      // Calculate propagation to various points
      for (const point of propagation.propagation) {
        const distance = Math.sqrt(
          Math.pow(point.location.x - propagation.source.x, 2) + 
          Math.pow(point.location.y - propagation.source.y, 2)
        );
        
        // Simple inverse square law with distance
        point.level = propagation.level * Math.max(0.1, 1 / (1 + distance / 100));
        point.impact = point.level > 75 ? (point.level - 75) / 25 : 0; // Impact above 75 dB
      }
    }
  }

  private getStageNoiseFactor(currentTime: Date): number {
    const hour = currentTime.getHours();
    
    // Peak noise during evening hours
    if (hour >= 19 && hour <= 23) {
      return 1.0;
    } else if (hour >= 16 && hour <= 18) {
      return 0.8;
    } else if (hour >= 12 && hour <= 15) {
      return 0.6;
    } else {
      return 0.3;
    }
  }

  private deployEmergencySoundWalls(location: Location, currentTime: Date): void {
    const availableWalls = this.system.noiseControl.soundWalls.filter(wall => !wall.temporary);
    
    if (availableWalls.length > 0) {
      const wall = availableWalls[0];
      wall.location = { ...location };
      wall.temporary = true;
      
      this.emit('emergencySoundWallDeployed', { wall, location, time: currentTime });
    }
  }

  private processNoiseComplaints(noise: NoiseControl, currentTime: Date): void {
    // Random noise complaints
    if (Math.random() < 0.01) { // 1% chance per tick
      const complaint: NoiseComplaint = {
        id: uuidv4(),
        timestamp: currentTime,
        location: `Resident Area ${Math.floor(Math.random() * 5) + 1}`,
        level: 70 + Math.random() * 20, // 70-90 dB
        response: '',
        resolved: false
      };
      
      noise.complaints.push(complaint);
      this.emit('noiseComplaintReceived', { complaint, time: currentTime });
    }

    // Process unresolved complaints
    for (const complaint of noise.complaints) {
      if (!complaint.resolved && 
          (currentTime.getTime() - complaint.timestamp.getTime()) > 30 * 60 * 1000) { // 30 minutes
        
        complaint.resolved = true;
        complaint.response = 'Noise levels adjusted, sound walls deployed';
        
        this.emit('noiseComplaintResolved', { complaint, time: currentTime });
      }
    }
  }

  private optimizeSoundWalls(noise: NoiseControl, currentTime: Date): void {
    // Find high-impact areas needing sound walls
    const highImpactAreas = noise.propagationMap
      .flatMap(prop => prop.propagation)
      .filter(point => point.impact > 0.7)
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 3); // Top 3 areas

    for (const area of highImpactAreas) {
      const nearbyWall = noise.soundWalls.find(wall => {
        const distance = Math.sqrt(
          Math.pow(wall.location.x - area.location.x, 2) + 
          Math.pow(wall.location.y - area.location.y, 2)
        );
        return distance < 50; // Within 50 units
      });

      if (!nearbyWall) {
        this.emit('soundWallRecommended', { 
          location: area.location,
          impact: area.impact,
          estimatedReduction: Math.min(15, area.impact * 20), // dB reduction
          time: currentTime 
        });
      }
    }
  }

  private updatePatrolProgress(route: PatrolRoute, currentTime: Date): void {
    // Simulate patrol completion
    if (Math.random() < 0.1) { // 10% chance per tick
      const completionTime = Math.random() * route.duration;
      
      this.emit('patrolCompleted', { 
        route,
        completionTime,
        incidentsFound: Math.floor(Math.random() * 3), // 0-2 incidents
        time: currentTime 
      });
    }
  }

  private updateResponseHeatmap(route: PatrolRoute, currentTime: Date): void {
    for (const heatpoint of route.responseTimeHeatmap) {
      // Simulate response times based on distance and patrol efficiency
      const baseResponseTime = 5 + Math.random() * 10; // 5-15 minutes base
      const distanceFactor = Math.sqrt(
        Math.pow(heatpoint.location.x, 2) + Math.pow(heatpoint.location.y, 2)
      ) / 100; // Distance factor
      
      heatpoint.averageResponseTime = baseResponseTime * (1 + distanceFactor);
      
      // Update severity based on response time
      if (heatpoint.averageResponseTime > 15) {
        heatpoint.severity = 'High';
      } else if (heatpoint.averageResponseTime > 10) {
        heatpoint.severity = 'Medium';
      } else {
        heatpoint.severity = 'Low';
      }
    }
  }

  private simulatePatrolIncident(route: PatrolRoute, currentTime: Date): void {
    const incidentTypes = [
      'Suspicious Activity',
      'Medical Emergency',
      'Disturbance',
      'Lost Property',
      'Safety Hazard'
    ];
    
    const incident = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
    const responseTime = 2 + Math.random() * 8; // 2-10 minutes
    
    this.emit('patrolIncident', { 
      route,
      incident,
      responseTime,
      location: route.waypoints[Math.floor(Math.random() * route.waypoints.length)],
      time: currentTime 
    });

    // Update heatmap
    const nearbyHeatpoint = route.responseTimeHeatmap.find(hp => Math.random() < 0.3);
    if (nearbyHeatpoint) {
      nearbyHeatpoint.incidentCount++;
      nearbyHeatpoint.averageResponseTime = 
        (nearbyHeatpoint.averageResponseTime + responseTime) / 2;
    }
  }

  private managePatrolSchedule(route: PatrolRoute, currentTime: Date): void {
    // Random patrol breaks
    if (route.status === 'Active' && Math.random() < 0.02) { // 2% chance
      route.status = 'Paused';
      this.emit('patrolBreak', { route, time: currentTime });
    } else if (route.status === 'Paused' && Math.random() < 0.1) { // 10% chance to resume
      route.status = 'Active';
      this.emit('patrolResumed', { route, time: currentTime });
    }
  }

  private optimizePatrolRoutes(currentTime: Date): void {
    // Find routes with high incident counts
    const problematicRoutes = this.system.patrolRoutes.filter(route => {
      const totalIncidents = route.responseTimeHeatmap.reduce(
        (sum, hp) => sum + hp.incidentCount, 0
      );
      return totalIncidents > 10; // More than 10 incidents
    });

    for (const route of problematicRoutes) {
      this.emit('patrolRouteOptimizationNeeded', { 
        route,
        recommendation: 'Increase patrol frequency or add additional waypoints',
        time: currentTime 
      });
    }
  }

  private simulateResidentCall(hotline: ResidentHotline, currentTime: Date): void {
    const complaintTypes = [
      'Noise too loud',
      'Parking issues',
      'Traffic congestion',
      'Litter problems',
      'Security concerns'
    ];

    const call: ResidentCall = {
      id: uuidv4(),
      timestamp: currentTime,
      complaint: complaintTypes[Math.floor(Math.random() * complaintTypes.length)],
      severity: Math.floor(Math.random() * 10) + 1, // 1-10
      location: `Neighborhood ${Math.floor(Math.random() * 5) + 1}`,
      response: '',
      resolved: false,
      followUp: false
    };

    hotline.calls.push(call);
    this.emit('residentCallReceived', { call, time: currentTime });
  }

  private updateGoodwillScore(hotline: ResidentHotline, currentTime: Date): void {
    const recentCalls = hotline.calls.filter(call => 
      (currentTime.getTime() - call.timestamp.getTime()) < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const resolvedCalls = recentCalls.filter(call => call.resolved).length;
    const totalCalls = recentCalls.length;
    
    if (totalCalls > 0) {
      const resolutionRate = resolvedCalls / totalCalls;
      const averageSeverity = recentCalls.reduce((sum, call) => sum + call.severity, 0) / totalCalls;
      
      // Score based on resolution rate and complaint severity
      const baseScore = resolutionRate * 10; // 0-10 based on resolution
      const severityPenalty = (averageSeverity - 5) * 0.2; // Penalty for high severity
      
      hotline.goodwillScore = Math.max(0, Math.min(10, baseScore - severityPenalty));
    }

    // Gradual improvement over time if no complaints
    if (hotline.complaintsToday === 0) {
      hotline.goodwillScore = Math.min(10, hotline.goodwillScore + 0.1);
    }
  }

  private processUnresolvedCalls(hotline: ResidentHotline, currentTime: Date): void {
    for (const call of hotline.calls) {
      if (!call.resolved && 
          (currentTime.getTime() - call.timestamp.getTime()) > 2 * 60 * 60 * 1000) { // 2 hours
        
        // Auto-resolve with standard response
        call.resolved = true;
        call.response = 'Issue acknowledged and appropriate measures taken';
        call.followUp = call.severity > 7; // High severity gets follow-up
        
        this.emit('residentCallAutoResolved', { call, time: currentTime });
      }
    }
  }

  // Initialize helper methods
  private createFOHTower(): FOHTower {
    return {
      location: { x: 200, y: 200, zone: 'Main Stage' },
      height: 25, // 25 meters
      windThresholds: [
        {
          speed: 15, // 15 m/s
          action: 'Monitor',
          equipmentAffected: ['PA', 'LED']
        },
        {
          speed: 20, // 20 m/s  
          action: 'Restrict',
          equipmentAffected: ['LED']
        },
        {
          speed: 25, // 25 m/s
          action: 'Shutdown',
          equipmentAffected: ['PA', 'LED']
        }
      ],
      paOperations: true,
      ledOperations: true,
      currentWindSpeed: 5 + Math.random() * 10, // 5-15 m/s initial
      restrictions: []
    };
  }

  private createGroundProtection(): GroundProtection {
    return {
      matsRented: 500,
      matsCost: 50000, // $50k rental
      mudDamageRisk: 0,
      venueGroundsCost: 0,
      weatherImpact: 0,
      matDeployment: [
        {
          zone: 'Main Stage',
          matsRequired: 100,
          matsDeployed: 80,
          mudLevel: 2,
          trafficLevel: 8
        },
        {
          zone: 'Vendor Area',
          matsRequired: 150,
          matsDeployed: 120,
          mudLevel: 3,
          trafficLevel: 9
        },
        {
          zone: 'Backstage',
          matsRequired: 80,
          matsDeployed: 60,
          mudLevel: 1,
          trafficLevel: 6
        }
      ]
    };
  }

  private createSpillResponseSystem(): SpillResponseSystem {
    const kits: SpillKit[] = [];
    const inspections: SpillInspection[] = [];
    const oilyAreas: HazardZone[] = [];
    const fuelAreas: HazardZone[] = [];

    // Create spill kits
    for (let i = 0; i < 10; i++) {
      const kit: SpillKit = {
        id: uuidv4(),
        location: { x: Math.random() * 500, y: Math.random() * 500, zone: `Area ${i + 1}` },
        type: ['Oil', 'Fuel', 'Chemical', 'Universal'][Math.floor(Math.random() * 4)] as any,
        capacity: 50 + Math.random() * 100, // 50-150 liters
        lastInspection: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: 'Ready',
        contents: [
          { item: 'Absorbent Pads', quantity: 20, status: 'Available' },
          { item: 'Containment Boom', quantity: 2, status: 'Available' },
          { item: 'Disposal Bags', quantity: 10, status: 'Available' }
        ]
      };
      kits.push(kit);

      // Create inspection schedule
      inspections.push({
        kitId: kit.id,
        scheduled: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        completed: new Date(),
        inspector: `Inspector ${Math.floor(Math.random() * 3) + 1}`,
        passed: true,
        issues: []
      });
    }

    // Create hazard zones
    for (let i = 0; i < 5; i++) {
      oilyAreas.push({
        id: `oily_${i}`,
        location: { x: Math.random() * 500, y: Math.random() * 500, zone: `Oily Zone ${i + 1}` },
        type: 'Oily',
        riskLevel: Math.random() * 5 + 1, // 1-6 risk level
        spillKitsRequired: 2,
        spillKitsPresent: 2,
        lastInspection: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });

      fuelAreas.push({
        id: `fuel_${i}`,
        location: { x: Math.random() * 500, y: Math.random() * 500, zone: `Fuel Zone ${i + 1}` },
        type: 'Fuel',
        riskLevel: Math.random() * 7 + 2, // 2-9 risk level (higher for fuel)
        spillKitsRequired: 3,
        spillKitsPresent: 2,
        lastInspection: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });
    }

    return {
      kits,
      inspectionSchedule: inspections,
      oilyAreas,
      fuelAreas
    };
  }

  private createFirePoints(): FirePoint[] {
    const firePoints: FirePoint[] = [];
    const zones = ['Stage', 'VIP', 'General', 'Backstage', 'Vendor'];
    const types: FirePoint['type'][] = ['CO2', 'Foam', 'Water', 'Dry'];

    for (let i = 0; i < 20; i++) {
      firePoints.push({
        id: `fire_${i}`,
        location: { x: Math.random() * 500, y: Math.random() * 500, zone: zones[i % zones.length] },
        type: types[Math.floor(Math.random() * types.length)],
        capacity: 50 + Math.random() * 100, // 50-150 units
        zone: zones[i % zones.length],
        lastInspection: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: 'Ready',
        coverage: 25 + Math.random() * 25 // 25-50 meter coverage
      });
    }

    return firePoints;
  }

  private createNoiseControl(): NoiseControl {
    const propagationMap: NoisePropagation[] = [];
    const soundWalls: SoundWall[] = [];
    const monitoringPoints: NoiseMonitor[] = [];
    const complaints: NoiseComplaint[] = [];

    // Create noise sources (stages)
    const stages = [
      { x: 200, y: 200, name: 'Main Stage' },
      { x: 300, y: 100, name: 'Second Stage' },
      { x: 100, y: 300, name: 'Acoustic Stage' }
    ];

    for (const stage of stages) {
      const propagation: NoisePropagation = {
        source: { x: stage.x, y: stage.y, zone: stage.name },
        level: 95, // 95 dB at source
        frequency: 1000, // 1kHz center frequency
        propagation: [],
        mitigation: ['Sound walls', 'Directional speakers', 'Volume limits']
      };

      // Calculate propagation points
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * 2 * Math.PI;
        const distance = 100 + Math.random() * 200;
        propagation.propagation.push({
          location: {
            x: stage.x + distance * Math.cos(angle),
            y: stage.y + distance * Math.sin(angle),
            zone: `Point ${i + 1}`
          },
          level: 0, // Will be calculated
          impact: 0
        });
      }

      propagationMap.push(propagation);
    }

    // Create sound walls
    for (let i = 0; i < 5; i++) {
      soundWalls.push({
        id: `wall_${i}`,
        location: { x: Math.random() * 500, y: Math.random() * 500, zone: `Wall ${i + 1}` },
        height: 3 + Math.random() * 2, // 3-5 meters
        length: 20 + Math.random() * 30, // 20-50 meters
        material: ['Concrete', 'Wood', 'Composite'][Math.floor(Math.random() * 3)],
        reduction: 10 + Math.random() * 10, // 10-20 dB reduction
        cost: 5000 + Math.random() * 15000, // $5k-20k
        temporary: false
      });
    }

    // Create monitoring points
    for (let i = 0; i < 8; i++) {
      monitoringPoints.push({
        id: `monitor_${i}`,
        location: { x: Math.random() * 500, y: Math.random() * 500, zone: `Monitor ${i + 1}` },
        currentLevel: 60 + Math.random() * 20, // 60-80 dB
        maxLevel: 75, // 75 dB limit
        violations: 0,
        status: 'Active'
      });
    }

    return {
      propagationMap,
      soundWalls,
      monitoringPoints,
      complaints
    };
  }

  private createPatrolRoutes(): PatrolRoute[] {
    const routes: PatrolRoute[] = [];
    
    for (let i = 0; i < 4; i++) {
      const waypoints: Location[] = [];
      const heatmap: ResponseHeatmap[] = [];
      
      // Create waypoints for route
      for (let j = 0; j < 6; j++) {
        const waypoint = {
          x: (i * 100) + (j * 50) + Math.random() * 30,
          y: (i * 100) + Math.random() * 50,
          zone: `Patrol Zone ${i + 1}-${j + 1}`
        };
        waypoints.push(waypoint);
        
        // Create heatmap point
        heatmap.push({
          location: waypoint,
          averageResponseTime: 5 + Math.random() * 10, // 5-15 minutes
          incidentCount: Math.floor(Math.random() * 5),
          severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as any
        });
      }
      
      routes.push({
        id: `patrol_${i}`,
        name: `Patrol Route ${i + 1}`,
        waypoints,
        frequency: 60 + Math.random() * 60, // 60-120 minutes
        duration: 30 + Math.random() * 30, // 30-60 minutes
        assignedOfficer: `Officer ${i + 1}`,
        responseTimeHeatmap: heatmap,
        status: 'Active'
      });
    }

    return routes;
  }

  private createResidentHotline(): ResidentHotline {
    return {
      phoneNumber: '+1-800-FESTIVAL',
      staffed: true,
      calls: [],
      complaintsToday: 0,
      goodwillScore: 7.5 // Start with decent community relations
    };
  }

  // Public methods for external access
  public getMetrics(): any {
    const spillKitsReady = this.system.spillResponse.kits.filter(k => k.status === 'Ready').length;
    const firePointsReady = this.system.firePoints.filter(fp => fp.status === 'Ready').length;
    const noiseViolations = this.system.noiseControl.monitoringPoints.reduce((sum, m) => sum + m.violations, 0);
    const activePatrols = this.system.patrolRoutes.filter(r => r.status === 'Active').length;

    return {
      fohTower: {
        windSpeed: this.system.fohTower.currentWindSpeed,
        paOperational: this.system.fohTower.paOperations,
        ledOperational: this.system.fohTower.ledOperations,
        activeRestrictions: this.system.fohTower.restrictions.filter(r => r.active).length
      },
      groundProtection: {
        mudDamageRisk: this.system.groundProtection.mudDamageRisk,
        matsDeployed: this.system.groundProtection.matDeployment.reduce((sum, d) => sum + d.matsDeployed, 0),
        estimatedDamageCost: this.system.groundProtection.venueGroundsCost
      },
      spillResponse: {
        spillKitsReady,
        totalSpillKits: this.system.spillResponse.kits.length,
        highRiskZones: [...this.system.spillResponse.oilyAreas, ...this.system.spillResponse.fuelAreas]
          .filter(zone => zone.riskLevel > 7).length
      },
      firePoints: {
        firePointsReady,
        totalFirePoints: this.system.firePoints.length,
        coveragePercentage: (firePointsReady / this.system.firePoints.length) * 100
      },
      noise: {
        violations: noiseViolations,
        complaintsToday: this.system.noiseControl.complaints.filter(c => 
          c.timestamp.toDateString() === new Date().toDateString()
        ).length,
        soundWallsDeployed: this.system.noiseControl.soundWalls.filter(w => w.temporary).length
      },
      security: {
        activePatrols,
        totalPatrols: this.system.patrolRoutes.length,
        averageResponseTime: this.system.patrolRoutes.reduce((sum, route) => 
          sum + route.responseTimeHeatmap.reduce((rsum, hp) => rsum + hp.averageResponseTime, 0) / route.responseTimeHeatmap.length
        , 0) / this.system.patrolRoutes.length
      },
      community: {
        goodwillScore: this.system.residentHotline.goodwillScore,
        complaintsToday: this.system.residentHotline.complaintsToday,
        hotlineStaffed: this.system.residentHotline.staffed
      }
    };
  }

  public getFOHTowerStatus(): FOHTower {
    return this.system.fohTower;
  }

  public getSpillResponseStatus(): SpillResponseSystem {
    return this.system.spillResponse;
  }

  public getNoiseControlStatus(): NoiseControl {
    return this.system.noiseControl;
  }

  public getPatrolStatus(): PatrolRoute[] {
    return this.system.patrolRoutes;
  }

  public getResidentHotlineStatus(): ResidentHotline {
    return this.system.residentHotline;
  }
}