import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { SimulationSettings, Venue, Location } from '../../types';
import { 
  PowerInfrastructure, Generator, PhaseBalance, BreakerPanel, FuelLogistics,
  ScaffoldInspection, PhaseLoad, Breaker, TripChain, FuelTank, FuelDelivery,
  FuelConsumption, FuelPricing, ScaffoldIssue
} from '../../types/enhanced';

export class PowerInfrastructureEngine extends EventEmitter {
  private infrastructure: PowerInfrastructure;
  private settings: SimulationSettings;
  private venue: Venue;

  constructor(venue: Venue, settings: SimulationSettings) {
    super();
    this.venue = venue;
    this.settings = settings;
    this.infrastructure = this.initializeInfrastructure();
  }

  private initializeInfrastructure(): PowerInfrastructure {
    return {
      generators: this.createGenerators(),
      phaseBalancing: this.createPhaseBalancing(),
      breakerPanels: this.createBreakerPanels(),
      fuelLogistics: this.createFuelLogistics(),
      scaffoldInspections: this.createScaffoldInspections()
    };
  }

  public process(currentTime: Date): void {
    this.processGenerators(currentTime);
    this.monitorPhaseBalancing(currentTime);
    this.manageBreakerPanels(currentTime);
    this.handleFuelLogistics(currentTime);
    this.processScaffoldInspections(currentTime);
    this.optimizePowerDistribution(currentTime);
  }

  private processGenerators(currentTime: Date): void {
    for (const generator of this.infrastructure.generators) {
      if (generator.status === 'Online') {
        // Update fuel consumption
        this.updateFuelConsumption(generator, currentTime);
        
        // Monitor load and efficiency
        this.monitorGeneratorPerformance(generator, currentTime);
        
        // Check for maintenance needs
        this.checkMaintenanceSchedule(generator, currentTime);
        
        // Random failures
        if (Math.random() < 0.001) { // 0.1% chance per tick
          this.handleGeneratorFailure(generator, currentTime);
        }
      } else if (generator.status === 'Maintenance') {
        // Check if maintenance is complete
        if (currentTime >= generator.nextMaintenance) {
          generator.status = 'Online';
          generator.lastMaintenance = currentTime;
          generator.nextMaintenance = new Date(currentTime.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
          generator.efficiency = Math.min(1, generator.efficiency + 0.1);
          
          this.emit('generatorMaintenanceComplete', { generator, time: currentTime });
        }
      }
    }
  }

  private monitorPhaseBalancing(currentTime: Date): void {
    for (const balance of this.infrastructure.phaseBalancing) {
      const generator = this.infrastructure.generators.find(g => g.id === balance.generatorId);
      if (!generator) continue;

      // Update phase loads from generator
      balance.l1Load = generator.phases.find(p => p.phase === 'L1')?.load || 0;
      balance.l2Load = generator.phases.find(p => p.phase === 'L2')?.load || 0;
      balance.l3Load = generator.phases.find(p => p.phase === 'L3')?.load || 0;

      // Calculate imbalance
      const maxLoad = Math.max(balance.l1Load, balance.l2Load, balance.l3Load);
      const minLoad = Math.min(balance.l1Load, balance.l2Load, balance.l3Load);
      balance.imbalancePercentage = maxLoad > 0 ? (maxLoad - minLoad) / maxLoad : 0;

      // Calculate efficiency loss due to imbalance
      balance.efficiencyLoss = balance.imbalancePercentage * 0.15; // Up to 15% loss

      // Auto-rebalancing if enabled and imbalance is significant
      if (balance.autoRebalancing && balance.imbalancePercentage > 0.2) {
        this.performAutoRebalancing(balance, generator, currentTime);
      }

      // Alert for critical imbalance
      if (balance.imbalancePercentage > 0.4) {
        this.emit('criticalPhaseImbalance', { 
          generator, 
          balance, 
          efficiencyLoss: balance.efficiencyLoss,
          time: currentTime 
        });
      }
    }
  }

  private manageBreakerPanels(currentTime: Date): void {
    for (const panel of this.infrastructure.breakerPanels) {
      // Update breaker loads
      this.updateBreakerLoads(panel, currentTime);
      
      // Check for overloads and trips
      this.checkBreakerTrips(panel, currentTime);
      
      // Process trip chains
      this.processTripChains(panel, currentTime);
      
      // Schedule inspections
      this.scheduleInspection(panel, currentTime);
    }
  }

  private handleFuelLogistics(currentTime: Date): void {
    const logistics = this.infrastructure.fuelLogistics;
    
    // Update tank levels based on consumption
    this.updateFuelTanks(logistics, currentTime);
    
    // Process scheduled deliveries
    this.processDeliveries(logistics, currentTime);
    
    // Update fuel pricing
    this.updateFuelPricing(logistics, currentTime);
    
    // Check for low fuel warnings
    this.checkFuelLevels(logistics, currentTime);
    
    // Forecast consumption
    this.updateConsumptionForecast(logistics, currentTime);
  }

  private processScaffoldInspections(currentTime: Date): void {
    for (const inspection of this.infrastructure.scaffoldInspections) {
      // Check if inspection is due
      if (inspection.status === 'Scheduled' && currentTime >= inspection.scheduled) {
        this.performScaffoldInspection(inspection, currentTime);
      }
      
      // Check for overdue inspections
      if (inspection.status === 'Overdue') {
        inspection.shutdownRisk = Math.min(1, inspection.shutdownRisk + 0.05);
        
        if (inspection.shutdownRisk > 0.8) {
          this.emit('scaffoldShutdownRisk', { 
            inspection, 
            riskLevel: 'Critical',
            time: currentTime 
          });
        }
      }
      
      // Process failed inspections
      if (inspection.status === 'Failed') {
        this.handleFailedInspection(inspection, currentTime);
      }
    }
  }

  private optimizePowerDistribution(currentTime: Date): void {
    // Calculate total system efficiency
    const totalCapacity = this.infrastructure.generators.reduce((sum, gen) => sum + gen.capacity, 0);
    const totalLoad = this.infrastructure.generators.reduce((sum, gen) => sum + gen.currentLoad, 0);
    const systemUtilization = totalLoad / totalCapacity;

    // Optimize generator assignments
    if (systemUtilization < 0.4) {
      this.consolidateGeneration(currentTime);
    } else if (systemUtilization > 0.9) {
      this.expandGeneration(currentTime);
    }

    // Load balancing recommendations
    const imbalancedGenerators = this.infrastructure.phaseBalancing.filter(
      balance => balance.imbalancePercentage > 0.3
    );

    if (imbalancedGenerators.length > 0) {
      this.emit('loadBalancingNeeded', { 
        generators: imbalancedGenerators,
        systemUtilization,
        time: currentTime 
      });
    }
  }

  private updateFuelConsumption(generator: Generator, currentTime: Date): void {
    const consumptionRate = this.calculateConsumptionRate(generator);
    const hoursSinceLastUpdate = 1 / 60; // Assuming 1-minute ticks
    
    const consumed = consumptionRate * hoursSinceLastUpdate;
    generator.fuelLevel = Math.max(0, generator.fuelLevel - consumed);
    generator.fuelConsumption += consumed;

    // Update consumption tracking
    let consumption = this.infrastructure.fuelLogistics.consumption.find(c => c.generatorId === generator.id);
    if (!consumption) {
      consumption = {
        generatorId: generator.id,
        hourlyRate: 0,
        totalConsumed: 0,
        efficiency: generator.efficiency,
        forecast: Array(24).fill(0)
      };
      this.infrastructure.fuelLogistics.consumption.push(consumption);
    }
    
    consumption.hourlyRate = consumptionRate;
    consumption.totalConsumed = generator.fuelConsumption;
    consumption.efficiency = generator.efficiency;

    // Low fuel warning
    if (generator.fuelLevel < 50) { // Less than 50 liters
      this.emit('lowFuelWarning', { generator, level: generator.fuelLevel, time: currentTime });
    }

    // Critical fuel level
    if (generator.fuelLevel < 20) {
      this.emit('criticalFuelLevel', { generator, time: currentTime });
      
      if (generator.fuelLevel === 0) {
        generator.status = 'Offline';
        this.emit('generatorOutOfFuel', { generator, time: currentTime });
      }
    }
  }

  private calculateConsumptionRate(generator: Generator): number {
    // Base consumption based on load
    const loadFactor = generator.currentLoad / generator.capacity;
    const baseConsumption = generator.capacity * 0.25; // 0.25 L/kW/h base
    
    // Consumption increases non-linearly with load
    const loadConsumption = baseConsumption * (0.3 + 0.7 * Math.pow(loadFactor, 1.2));
    
    // Efficiency factor
    const efficiencyAdjusted = loadConsumption / generator.efficiency;
    
    return efficiencyAdjusted;
  }

  private monitorGeneratorPerformance(generator: Generator, currentTime: Date): void {
    // Update phase loads with random variation
    for (const phase of generator.phases) {
      const targetLoad = (generator.currentLoad / 3) + (Math.random() - 0.5) * 50; // ±25kW variation
      phase.load = Math.max(0, Math.min(phase.capacity, targetLoad));
      phase.imbalance = Math.abs(phase.load - generator.currentLoad / 3) / (generator.currentLoad / 3 || 1);
    }

    // Update current load based on demand
    const demandVariation = (Math.random() - 0.5) * 0.2; // ±10% variation
    generator.currentLoad = Math.max(0, Math.min(generator.capacity, 
      generator.currentLoad * (1 + demandVariation)
    ));

    // Efficiency degradation over time
    if (Math.random() < 0.01) { // 1% chance per tick
      generator.efficiency = Math.max(0.7, generator.efficiency - 0.005);
    }

    // Performance alerts
    if (generator.efficiency < 0.8) {
      this.emit('generatorEfficiencyAlert', { 
        generator, 
        efficiency: generator.efficiency,
        time: currentTime 
      });
    }

    if (generator.currentLoad / generator.capacity > 0.95) {
      this.emit('generatorOverload', { 
        generator, 
        loadPercentage: generator.currentLoad / generator.capacity,
        time: currentTime 
      });
    }
  }

  private checkMaintenanceSchedule(generator: Generator, currentTime: Date): void {
    const hoursUntilMaintenance = (generator.nextMaintenance.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilMaintenance <= 24 && hoursUntilMaintenance > 0) {
      this.emit('maintenanceScheduled', { 
        generator, 
        hoursUntil: hoursUntilMaintenance,
        time: currentTime 
      });
    } else if (currentTime > generator.nextMaintenance) {
      generator.status = 'Maintenance';
      this.emit('generatorMaintenance', { generator, time: currentTime });
    }
  }

  private handleGeneratorFailure(generator: Generator, currentTime: Date): void {
    generator.status = 'Error';
    
    const failureTypes = ['Overheating', 'Fuel System', 'Electrical', 'Mechanical'];
    const failureType = failureTypes[Math.floor(Math.random() * failureTypes.length)];
    
    this.emit('generatorFailure', { 
      generator, 
      failureType, 
      estimatedRepairTime: Math.random() * 4 + 1, // 1-5 hours
      time: currentTime 
    });

    // Attempt automatic restart after some time
    setTimeout(() => {
      if (Math.random() < 0.7) { // 70% success rate
        generator.status = 'Online';
        generator.efficiency = Math.max(0.7, generator.efficiency - 0.05);
        this.emit('generatorRestored', { generator, time: new Date() });
      }
    }, (Math.random() * 2 + 0.5) * 60 * 1000); // 0.5-2.5 minutes
  }

  private performAutoRebalancing(balance: PhaseBalance, generator: Generator, currentTime: Date): void {
    const totalLoad = balance.l1Load + balance.l2Load + balance.l3Load;
    const targetLoad = totalLoad / 3;

    // Redistribute loads
    const l1Phase = generator.phases.find(p => p.phase === 'L1')!;
    const l2Phase = generator.phases.find(p => p.phase === 'L2')!;
    const l3Phase = generator.phases.find(p => p.phase === 'L3')!;

    // Smooth adjustment towards target
    l1Phase.load += (targetLoad - l1Phase.load) * 0.1;
    l2Phase.load += (targetLoad - l2Phase.load) * 0.1;
    l3Phase.load += (targetLoad - l3Phase.load) * 0.1;

    // Update balance metrics
    balance.l1Load = l1Phase.load;
    balance.l2Load = l2Phase.load;
    balance.l3Load = l3Phase.load;

    this.emit('autoRebalancePerformed', { 
      generator, 
      balance, 
      targetLoad,
      time: currentTime 
    });
  }

  private updateBreakerLoads(panel: BreakerPanel, currentTime: Date): void {
    for (const breaker of panel.breakers) {
      // Simulate load variations
      const loadVariation = (Math.random() - 0.5) * 0.2; // ±10% variation
      breaker.currentLoad = Math.max(0, Math.min(breaker.rating * 0.8, // 80% of rating max
        breaker.currentLoad * (1 + loadVariation)
      ));
    }
  }

  private checkBreakerTrips(panel: BreakerPanel, currentTime: Date): void {
    for (const breaker of panel.breakers) {
      // Check for overload
      if (breaker.currentLoad > breaker.rating && breaker.status === 'On') {
        breaker.status = 'Tripped';
        breaker.tripHistory.push(currentTime);
        
        this.emit('breakerTripped', { 
          panel, 
          breaker, 
          overload: breaker.currentLoad - breaker.rating,
          time: currentTime 
        });

        // Process trip chain
        const tripChain = panel.tripChains.find(tc => tc.triggerBreaker === breaker.id);
        if (tripChain) {
          this.executeTripChain(panel, tripChain, currentTime);
        }
      }
    }
  }

  private processTripChains(panel: BreakerPanel, currentTime: Date): void {
    for (const tripChain of panel.tripChains) {
      const triggerBreaker = panel.breakers.find(b => b.id === tripChain.triggerBreaker);
      
      if (triggerBreaker?.status === 'Tripped') {
        // Check if safe reset timing has passed
        const lastTrip = triggerBreaker.tripHistory[triggerBreaker.tripHistory.length - 1];
        const timeSinceTrip = currentTime.getTime() - lastTrip.getTime();
        
        if (timeSinceTrip >= panel.safeResetTiming * 60 * 1000) { // Convert minutes to ms
          this.attemptBreakerReset(panel, tripChain, currentTime);
        }
      }
    }
  }

  private executeTripChain(panel: BreakerPanel, tripChain: TripChain, currentTime: Date): void {
    // Trip affected breakers
    for (const breakerId of tripChain.affectedBreakers) {
      const breaker = panel.breakers.find(b => b.id === breakerId);
      if (breaker && breaker.status === 'On') {
        breaker.status = 'Tripped';
        breaker.tripHistory.push(currentTime);
      }
    }

    this.emit('tripChainExecuted', { 
      panel, 
      tripChain, 
      affectedLoads: tripChain.affectedLoads,
      time: currentTime 
    });
  }

  private attemptBreakerReset(panel: BreakerPanel, tripChain: TripChain, currentTime: Date): void {
    // Reset in sequence
    for (const breakerId of tripChain.resetSequence) {
      const breaker = panel.breakers.find(b => b.id === breakerId);
      if (breaker && breaker.status === 'Tripped') {
        if (Math.random() < 0.9) { // 90% success rate
          breaker.status = 'On';
          breaker.currentLoad = breaker.currentLoad * 0.8; // Reduced load after reset
          
          this.emit('breakerReset', { 
            panel, 
            breaker, 
            automatic: true,
            time: currentTime 
          });
        } else {
          this.emit('breakerResetFailed', { 
            panel, 
            breaker, 
            reason: 'Persistent fault',
            time: currentTime 
          });
        }
        break; // Reset one at a time
      }
    }
  }

  private scheduleInspection(panel: BreakerPanel, currentTime: Date): void {
    const daysSinceInspection = (currentTime.getTime() - panel.lastInspection.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceInspection > 7) { // Weekly inspections
      this.emit('breakerInspectionDue', { panel, daysSince: daysSinceInspection, time: currentTime });
    }
  }

  private updateFuelTanks(logistics: FuelLogistics, currentTime: Date): void {
    for (const tank of logistics.tanks) {
      // Update consumption rate based on connected generators
      const connectedGenerators = this.infrastructure.generators.filter(g => g.status === 'Online');
      const totalConsumption = connectedGenerators.reduce((sum, gen) => {
        const consumption = logistics.consumption.find(c => c.generatorId === gen.id);
        return sum + (consumption?.hourlyRate || 0);
      }, 0);

      tank.consumptionRate = totalConsumption / logistics.tanks.length; // Distribute across tanks
      
      // Update tank level
      const hoursSinceLastUpdate = 1 / 60; // 1-minute ticks
      const consumed = tank.consumptionRate * hoursSinceLastUpdate;
      tank.currentLevel = Math.max(0, tank.currentLevel - consumed);

      // Low level warning
      if (tank.currentLevel < tank.lowLevelWarning && tank.currentLevel > 0) {
        this.emit('fuelTankLow', { 
          tank, 
          currentLevel: tank.currentLevel,
          warningLevel: tank.lowLevelWarning,
          time: currentTime 
        });
      }

      // Empty tank
      if (tank.currentLevel === 0) {
        this.emit('fuelTankEmpty', { tank, time: currentTime });
      }
    }
  }

  private processDeliveries(logistics: FuelLogistics, currentTime: Date): void {
    for (const delivery of logistics.deliveries) {
      if (delivery.status === 'Scheduled' && currentTime >= delivery.scheduled) {
        delivery.status = 'InTransit';
        // Random delay chance
        if (Math.random() < 0.1) { // 10% delay chance
          delivery.status = 'Delayed';
          delivery.actual = new Date(delivery.scheduled.getTime() + Math.random() * 4 * 60 * 60 * 1000); // 0-4 hour delay
          this.emit('fuelDeliveryDelayed', { delivery, time: currentTime });
        } else {
          delivery.actual = delivery.scheduled;
        }
      }

      if ((delivery.status === 'InTransit' || delivery.status === 'Delayed') && currentTime >= delivery.actual) {
        delivery.status = 'Delivered';
        
        // Fill tanks
        const availableTank = logistics.tanks.find(tank => 
          tank.capacity - tank.currentLevel >= delivery.quantity
        );
        
        if (availableTank) {
          availableTank.currentLevel += delivery.quantity;
          availableTank.lastFill = currentTime;
          
          this.emit('fuelDelivered', { 
            delivery, 
            tank: availableTank, 
            time: currentTime 
          });
        } else {
          this.emit('fuelDeliveryFailed', { 
            delivery, 
            reason: 'No available tank capacity',
            time: currentTime 
          });
        }
      }
    }
  }

  private updateFuelPricing(logistics: FuelLogistics, currentTime: Date): void {
    const pricing = logistics.pricing;
    
    // Surge pricing based on demand and supply
    const totalDemand = logistics.consumption.reduce((sum, c) => sum + c.hourlyRate, 0);
    const totalSupply = logistics.tanks.reduce((sum, tank) => sum + tank.currentLevel, 0);
    
    // Calculate supply ratio
    const supplyRatio = totalSupply / (totalDemand * 24); // Days of supply
    
    if (supplyRatio < 1) {
      pricing.surgeMultiplier = Math.min(3, 1 + (1 - supplyRatio) * 2); // Up to 3x surge
    } else {
      pricing.surgeMultiplier = Math.max(1, pricing.surgeMultiplier - 0.05); // Gradual decrease
    }
    
    pricing.currentRate = pricing.baseRate * pricing.surgeMultiplier;

    if (pricing.surgeMultiplier > 2) {
      this.emit('fuelSurgePricing', { 
        multiplier: pricing.surgeMultiplier,
        currentRate: pricing.currentRate,
        supplyRatio,
        time: currentTime 
      });
    }
  }

  private checkFuelLevels(logistics: FuelLogistics, currentTime: Date): void {
    const totalFuel = logistics.tanks.reduce((sum, tank) => sum + tank.currentLevel, 0);
    const totalCapacity = logistics.tanks.reduce((sum, tank) => sum + tank.capacity, 0);
    const fuelRatio = totalFuel / totalCapacity;

    if (fuelRatio < 0.2) { // Less than 20% fuel remaining
      this.emit('criticalFuelShortage', { 
        totalFuel, 
        totalCapacity, 
        ratio: fuelRatio,
        time: currentTime 
      });
      
      // Schedule emergency delivery
      this.scheduleEmergencyDelivery(logistics, currentTime);
    } else if (fuelRatio < 0.4) {
      this.emit('lowFuelWarning', { 
        totalFuel, 
        ratio: fuelRatio,
        time: currentTime 
      });
    }
  }

  private updateConsumptionForecast(logistics: FuelLogistics, currentTime: Date): void {
    for (const consumption of logistics.consumption) {
      // Simple 24-hour forecast based on current trends
      const currentHour = currentTime.getHours();
      
      for (let i = 0; i < 24; i++) {
        const forecastHour = (currentHour + i) % 24;
        
        // Peak usage during evening hours (18-22)
        let multiplier = 1;
        if (forecastHour >= 18 && forecastHour <= 22) {
          multiplier = 1.5;
        } else if (forecastHour >= 6 && forecastHour <= 10) {
          multiplier = 1.2;
        } else if (forecastHour >= 0 && forecastHour <= 6) {
          multiplier = 0.7;
        }
        
        consumption.forecast[i] = consumption.hourlyRate * multiplier;
      }
    }
  }

  private scheduleEmergencyDelivery(logistics: FuelLogistics, currentTime: Date): void {
    const emergencyDelivery: FuelDelivery = {
      id: uuidv4(),
      scheduled: new Date(currentTime.getTime() + 2 * 60 * 60 * 1000), // 2 hours
      actual: new Date(),
      quantity: logistics.pricing.minimumOrder * 2, // Double minimum for emergency
      cost: logistics.pricing.emergencyRate * logistics.pricing.minimumOrder * 2,
      minimumOrder: logistics.pricing.minimumOrder,
      supplier: 'Emergency Supplier',
      status: 'Scheduled'
    };

    logistics.deliveries.push(emergencyDelivery);
    this.emit('emergencyFuelDelivery', { delivery: emergencyDelivery, time: currentTime });
  }

  private performScaffoldInspection(inspection: ScaffoldInspection, currentTime: Date): void {
    inspection.completed = currentTime;
    
    // Random inspection results
    const passRate = inspection.type === 'Daily' ? 0.95 : 0.9;
    
    if (Math.random() < passRate) {
      inspection.status = 'Completed';
      inspection.shutdownRisk = Math.max(0, inspection.shutdownRisk - 0.2);
      this.emit('scaffoldInspectionPassed', { inspection, time: currentTime });
    } else {
      inspection.status = 'Failed';
      
      // Generate random issues
      const issues = this.generateScaffoldIssues();
      inspection.issues = issues;
      
      this.emit('scaffoldInspectionFailed', { 
        inspection, 
        issues, 
        time: currentTime 
      });
    }
  }

  private handleFailedInspection(inspection: ScaffoldInspection, currentTime: Date): void {
    // Calculate total remediation cost
    const totalCost = inspection.issues.reduce((sum, issue) => sum + issue.cost, 0);
    
    // Check if critical issues exist
    const criticalIssues = inspection.issues.filter(issue => issue.severity === 'Critical');
    
    if (criticalIssues.length > 0) {
      this.emit('criticalScaffoldIssues', { 
        inspection, 
        criticalIssues, 
        totalCost,
        time: currentTime 
      });
      
      // Immediate shutdown required
      inspection.shutdownRisk = 1;
    }
    
    // Schedule remediation
    for (const issue of inspection.issues) {
      if (!issue.deadline) {
        const urgencyDays = issue.severity === 'Critical' ? 0.5 : 
                           issue.severity === 'Major' ? 3 : 7;
        issue.deadline = new Date(currentTime.getTime() + urgencyDays * 24 * 60 * 60 * 1000);
      }
    }
  }

  private consolidateGeneration(currentTime: Date): void {
    // Turn off unnecessary generators to improve efficiency
    const onlineGenerators = this.infrastructure.generators.filter(g => g.status === 'Online');
    const totalLoad = onlineGenerators.reduce((sum, gen) => sum + gen.currentLoad, 0);
    
    // Find generator to turn off
    const candidateGenerator = onlineGenerators
      .sort((a, b) => a.currentLoad - b.currentLoad)[0];
    
    if (candidateGenerator && candidateGenerator.currentLoad < 100) {
      candidateGenerator.status = 'Offline';
      
      // Redistribute load
      const remainingGenerators = onlineGenerators.filter(g => g.id !== candidateGenerator.id);
      const redistributedLoad = candidateGenerator.currentLoad / remainingGenerators.length;
      
      for (const gen of remainingGenerators) {
        gen.currentLoad = Math.min(gen.capacity, gen.currentLoad + redistributedLoad);
      }
      
      this.emit('generatorConsolidation', { 
        offlineGenerator: candidateGenerator,
        remainingGenerators,
        time: currentTime 
      });
    }
  }

  private expandGeneration(currentTime: Date): void {
    // Bring additional generators online
    const offlineGenerators = this.infrastructure.generators.filter(g => g.status === 'Offline');
    
    if (offlineGenerators.length > 0) {
      const generatorToStart = offlineGenerators[0];
      generatorToStart.status = 'Online';
      generatorToStart.currentLoad = 0;
      
      this.emit('generatorExpansion', { 
        newGenerator: generatorToStart,
        time: currentTime 
      });
    } else {
      this.emit('powerCapacityWarning', { 
        message: 'No additional generators available',
        time: currentTime 
      });
    }
  }

  // Private helper methods for initialization
  private createGenerators(): Generator[] {
    const generators: Generator[] = [];
    
    for (let i = 0; i < 4; i++) {
      const capacity = 250 + Math.random() * 250; // 250-500kW
      
      generators.push({
        id: `gen_${uuidv4()}`,
        capacity,
        currentLoad: Math.random() * capacity * 0.6, // 0-60% initial load
        phases: [
          { phase: 'L1', load: 0, capacity: capacity / 3, imbalance: 0, efficiency: 0.9 },
          { phase: 'L2', load: 0, capacity: capacity / 3, imbalance: 0, efficiency: 0.9 },
          { phase: 'L3', load: 0, capacity: capacity / 3, imbalance: 0, efficiency: 0.9 }
        ],
        fuelLevel: 800 + Math.random() * 400, // 800-1200 liters
        fuelConsumption: 0,
        status: Math.random() > 0.8 ? 'Offline' : 'Online', // 80% online
        efficiency: 0.85 + Math.random() * 0.1, // 85-95% efficiency
        lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        nextMaintenance: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }
    
    return generators;
  }

  private createPhaseBalancing(): PhaseBalance[] {
    return this.infrastructure.generators.map(gen => ({
      generatorId: gen.id,
      l1Load: gen.phases[0].load,
      l2Load: gen.phases[1].load,
      l3Load: gen.phases[2].load,
      imbalancePercentage: 0,
      efficiencyLoss: 0,
      autoRebalancing: Math.random() > 0.5
    }));
  }

  private createBreakerPanels(): BreakerPanel[] {
    const panels: BreakerPanel[] = [];
    
    for (let i = 0; i < 3; i++) {
      const breakers: Breaker[] = [];
      const tripChains: TripChain[] = [];
      
      // Create breakers
      for (let j = 0; j < 12; j++) {
        const rating = [20, 30, 50, 100][Math.floor(Math.random() * 4)];
        const breaker: Breaker = {
          id: `breaker_${i}_${j}`,
          rating,
          currentLoad: Math.random() * rating * 0.7, // 0-70% of rating
          status: 'On',
          loads: [`Load_${i}_${j}`],
          tripHistory: []
        };
        breakers.push(breaker);
      }
      
      // Create trip chains
      for (let k = 0; k < 2; k++) {
        const triggerBreaker = breakers[Math.floor(Math.random() * breakers.length)];
        const affectedBreakers = breakers
          .filter(b => b.id !== triggerBreaker.id)
          .slice(0, 2 + Math.floor(Math.random() * 3))
          .map(b => b.id);
        
        tripChains.push({
          triggerBreaker: triggerBreaker.id,
          affectedBreakers,
          affectedLoads: affectedBreakers.map(id => `Load_${id}`),
          resetSequence: [triggerBreaker.id, ...affectedBreakers]
        });
      }
      
      panels.push({
        id: `panel_${i}`,
        location: { x: 100 * i, y: 100, zone: `Panel Room ${i + 1}` },
        breakers,
        tripChains,
        safeResetTiming: 5, // 5 minutes
        lastInspection: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });
    }
    
    return panels;
  }

  private createFuelLogistics(): FuelLogistics {
    const tanks: FuelTank[] = [];
    const deliveries: FuelDelivery[] = [];
    const consumption: FuelConsumption[] = [];
    
    // Create fuel tanks
    for (let i = 0; i < 3; i++) {
      tanks.push({
        id: `tank_${i}`,
        capacity: 2000 + Math.random() * 1000, // 2000-3000 liters
        currentLevel: Math.random() * 1500 + 500, // 500-2000 liters
        fuelType: 'Diesel',
        location: { x: 50 * i, y: 300, zone: `Tank Farm ${i + 1}` },
        lastFill: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        consumptionRate: 0,
        lowLevelWarning: 300
      });
    }
    
    // Schedule some deliveries
    for (let i = 0; i < 2; i++) {
      deliveries.push({
        id: uuidv4(),
        scheduled: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000),
        actual: new Date(),
        quantity: 1000 + Math.random() * 500,
        cost: 1500 + Math.random() * 500,
        minimumOrder: 1000,
        supplier: `Fuel Supplier ${i + 1}`,
        status: 'Scheduled'
      });
    }
    
    const pricing: FuelPricing = {
      baseRate: 1.5, // $1.50/liter
      surgeMultiplier: 1,
      minimumOrderSurcharge: 0.2,
      emergencyRate: 3.0,
      currentRate: 1.5
    };
    
    return {
      tanks,
      deliveries,
      consumption,
      pricing
    };
  }

  private createScaffoldInspections(): ScaffoldInspection[] {
    const inspections: ScaffoldInspection[] = [];
    const types: ScaffoldInspection['type'][] = ['Daily', 'Weekly', 'Monthly'];
    
    for (let i = 0; i < 10; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const scheduled = new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000);
      
      inspections.push({
        id: `scaffold_${i}`,
        location: { 
          x: Math.random() * 500, 
          y: Math.random() * 500, 
          zone: `Scaffold Zone ${i + 1}` 
        },
        type,
        scheduled,
        completed: new Date(),
        inspector: `Inspector ${Math.floor(Math.random() * 3) + 1}`,
        status: 'Scheduled',
        issues: [],
        shutdownRisk: Math.random() * 0.3 // 0-30% initial risk
      });
    }
    
    return inspections;
  }

  private generateScaffoldIssues(): ScaffoldIssue[] {
    const issues: ScaffoldIssue[] = [];
    const severities: ScaffoldIssue['severity'][] = ['Minor', 'Major', 'Critical'];
    const descriptions = [
      'Loose bolts detected',
      'Guardrail displacement',
      'Base plate instability',
      'Missing safety components',
      'Structural fatigue signs',
      'Corrosion on joints'
    ];
    
    const numIssues = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numIssues; i++) {
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const baseCost = severity === 'Critical' ? 5000 : 
                     severity === 'Major' ? 2000 : 500;
      
      issues.push({
        severity,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        location: `Section ${Math.floor(Math.random() * 10) + 1}`,
        remediation: `Replace/Repair ${severity.toLowerCase()} issue`,
        cost: baseCost + Math.random() * baseCost,
        deadline: new Date()
      });
    }
    
    return issues;
  }

  // Public methods for external access
  public getMetrics(): any {
    const totalCapacity = this.infrastructure.generators.reduce((sum, gen) => sum + gen.capacity, 0);
    const totalLoad = this.infrastructure.generators.reduce((sum, gen) => sum + gen.currentLoad, 0);
    const onlineGenerators = this.infrastructure.generators.filter(g => g.status === 'Online').length;
    const averageEfficiency = this.infrastructure.generators.reduce((sum, gen) => sum + gen.efficiency, 0) / this.infrastructure.generators.length;

    const imbalancedGenerators = this.infrastructure.phaseBalancing.filter(b => b.imbalancePercentage > 0.2).length;
    const trippedBreakers = this.infrastructure.breakerPanels.reduce((sum, panel) => 
      sum + panel.breakers.filter(b => b.status === 'Tripped').length, 0
    );

    const totalFuel = this.infrastructure.fuelLogistics.tanks.reduce((sum, tank) => sum + tank.currentLevel, 0);
    const totalFuelCapacity = this.infrastructure.fuelLogistics.tanks.reduce((sum, tank) => sum + tank.capacity, 0);

    const overdueInspections = this.infrastructure.scaffoldInspections.filter(i => i.status === 'Overdue').length;
    const criticalIssues = this.infrastructure.scaffoldInspections.reduce((sum, insp) => 
      sum + insp.issues.filter(issue => issue.severity === 'Critical').length, 0
    );

    return {
      power: {
        totalCapacity,
        totalLoad,
        utilization: totalLoad / totalCapacity,
        onlineGenerators,
        averageEfficiency,
        imbalancedGenerators
      },
      electrical: {
        totalBreakers: this.infrastructure.breakerPanels.reduce((sum, panel) => sum + panel.breakers.length, 0),
        trippedBreakers,
        panelsInspected: this.infrastructure.breakerPanels.filter(p => 
          (Date.now() - p.lastInspection.getTime()) < 7 * 24 * 60 * 60 * 1000
        ).length
      },
      fuel: {
        totalFuel,
        totalCapacity: totalFuelCapacity,
        fuelLevel: totalFuel / totalFuelCapacity,
        deliveriesPending: this.infrastructure.fuelLogistics.deliveries.filter(d => d.status !== 'Delivered').length,
        currentPrice: this.infrastructure.fuelLogistics.pricing.currentRate
      },
      scaffolding: {
        totalInspections: this.infrastructure.scaffoldInspections.length,
        overdueInspections,
        criticalIssues,
        averageRisk: this.infrastructure.scaffoldInspections.reduce((sum, insp) => sum + insp.shutdownRisk, 0) / this.infrastructure.scaffoldInspections.length
      }
    };
  }

  public getPowerStatus(): any {
    return {
      generators: this.infrastructure.generators,
      phaseBalancing: this.infrastructure.phaseBalancing,
      totalLoad: this.infrastructure.generators.reduce((sum, gen) => sum + gen.currentLoad, 0),
      totalCapacity: this.infrastructure.generators.reduce((sum, gen) => sum + gen.capacity, 0)
    };
  }

  public getBreakerStatus(): BreakerPanel[] {
    return this.infrastructure.breakerPanels;
  }

  public getFuelStatus(): FuelLogistics {
    return this.infrastructure.fuelLogistics;
  }

  public getScaffoldStatus(): ScaffoldInspection[] {
    return this.infrastructure.scaffoldInspections;
  }
}