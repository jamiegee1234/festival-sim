import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { SimulationSettings, Festival, Vendor } from '../../types';
import { 
  RetailSystem, VendorInventory, BarOperations, TillReconciliation, AgeCheckAudit,
  ShrinkageModel, VendorUtilityUsage, MenuEngineering, KegInventory, Keg,
  FoodPrepTime, LineCleaningSchedule, TillOperation, DailyLimits, MenuItem,
  UpsellPrompt, QueueOptimization
} from '../../types/enhanced';

export class VendorOperationsEngine extends EventEmitter {
  private system: RetailSystem;
  private settings: SimulationSettings;
  private festival: Festival;

  constructor(festival: Festival, settings: SimulationSettings) {
    super();
    this.festival = festival;
    this.settings = settings;
    this.system = this.initializeSystem();
  }

  private initializeSystem(): RetailSystem {
    return {
      inventory: this.generateVendorInventories(),
      barOperations: this.generateBarOperations(),
      tillReconciliation: [],
      ageCheckAudits: [],
      shrinkageModel: this.generateShrinkageModels(),
      utilityTracking: this.generateUtilityTracking(),
      menuEngineering: this.generateMenuEngineering()
    };
  }

  public process(currentTime: Date): void {
    this.processInventoryManagement(currentTime);
    this.manageBarOperations(currentTime);
    this.handleTillReconciliation(currentTime);
    this.conductAgeCheckAudits(currentTime);
    this.trackShrinkage(currentTime);
    this.monitorUtilityUsage(currentTime);
    this.optimizeMenuEngineering(currentTime);
    this.updateVendorMetrics(currentTime);
  }

  private processInventoryManagement(currentTime: Date): void {
    for (const inventory of this.system.inventory) {
      // Process keg operations
      this.processKegInventory(inventory.kegInventory, currentTime);
      
      // Process food preparation
      this.processFoodPreparation(inventory.foodPrep, currentTime);
      
      // Handle line cleaning
      this.handleLineCleaning(inventory.lineCleaningSchedule, currentTime);
      
      // Update throughput impact
      this.updateThroughputImpact(inventory, currentTime);
    }
  }

  private processKegInventory(kegInventory: KegInventory, currentTime: Date): void {
    // Process individual kegs
    for (const keg of kegInventory.kegs) {
      // Consumption simulation
      if (keg.currentLevel > 0 && Math.random() < 0.3) { // 30% chance per tick
        const consumption = Math.random() * 5 + 1; // 1-6 liters consumed
        keg.currentLevel = Math.max(0, keg.currentLevel - consumption);
        
        // Update estimated empty time
        if (keg.currentLevel > 0) {
          const consumptionRate = consumption * 60; // Per hour estimate
          const hoursRemaining = keg.currentLevel / consumptionRate;
          keg.estimatedEmpty = new Date(currentTime.getTime() + hoursRemaining * 60 * 60 * 1000);
        } else {
          keg.estimatedEmpty = currentTime;
        }
      }

      // Quality degradation over time
      const daysSinceTapped = (currentTime.getTime() - keg.tapped.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceTapped > 7) { // 7 days max freshness
        keg.quality = 'Poor';
        this.emit('kegQualityDegraded', { keg, daysSinceTapped, time: currentTime });
      } else if (daysSinceTapped > 5) {
        keg.quality = 'Fair';
      } else if (daysSinceTapped > 3) {
        keg.quality = 'Good';
      }

      // Empty keg alerts
      if (keg.currentLevel === 0 && keg.quality !== 'Poor') {
        this.emit('kegEmpty', { keg, time: currentTime });
        
        // Auto-replace if available
        this.attemptKegReplacement(kegInventory, keg, currentTime);
      }

      // Low level warnings
      if (keg.currentLevel < keg.capacity * 0.1 && keg.currentLevel > 0) {
        this.emit('kegLowLevel', { keg, remainingLevel: keg.currentLevel, time: currentTime });
      }
    }

    // Update total inventory metrics
    kegInventory.currentVolume = kegInventory.kegs.reduce((sum, keg) => sum + keg.currentLevel, 0);
    
    // Check if line cleaning is overdue
    const timeSinceLastClean = currentTime.getTime() - kegInventory.lastClean.getTime();
    const hoursSinceClean = timeSinceLastClean / (1000 * 60 * 60);
    
    if (hoursSinceClean >= 24) { // Daily cleaning required
      kegInventory.downtime = Math.min(120, hoursSinceClean * 2); // Up to 2 hours downtime
      
      if (currentTime >= kegInventory.nextClean) {
        this.performLineCleaning(kegInventory, currentTime);
      }
    }
  }

  private processFoodPreparation(foodPrep: FoodPrepTime[], currentTime: Date): void {
    for (const prep of foodPrep) {
      // Check staffing levels
      const staffingRatio = prep.currentStaff / prep.staffRequired;
      
      if (staffingRatio < 1) {
        // Understaffed - bottleneck situation
        prep.bottleneck = true;
        prep.throughputLimit = Math.floor(prep.throughputLimit * staffingRatio);
        
        this.emit('foodPrepBottleneck', { 
          sku: prep.sku,
          staffingRatio,
          throughputLimit: prep.throughputLimit,
          time: currentTime 
        });
      } else {
        // Adequately staffed
        prep.bottleneck = false;
        prep.throughputLimit = Math.floor(60 / prep.prepTimeMinutes * prep.currentStaff); // Items per hour
      }

      // Random staff changes
      if (Math.random() < 0.05) { // 5% chance per tick
        const change = Math.random() < 0.5 ? 1 : -1;
        prep.currentStaff = Math.max(0, Math.min(prep.staffRequired + 2, prep.currentStaff + change));
      }

      // Prep time optimization over time (learning curve)
      if (Math.random() < 0.02) {
        prep.prepTimeMinutes = Math.max(1, prep.prepTimeMinutes - 0.1); // Slight improvement
      }
    }
  }

  private handleLineCleaning(cleaningSchedule: LineCleaningSchedule[], currentTime: Date): void {
    for (const schedule of cleaningSchedule) {
      // Check if cleaning is due
      if (currentTime >= schedule.nextCleaning) {
        schedule.lastCleaned = currentTime;
        schedule.nextCleaning = new Date(currentTime.getTime() + schedule.frequency * 60 * 60 * 1000);
        
        // Simulate cleaning downtime
        const cleaningTime = Math.random() * 30 + 15; // 15-45 minutes
        schedule.downtime = cleaningTime;
        schedule.throughputImpact = cleaningTime / 60 * 0.8; // 80% throughput loss during cleaning
        
        this.emit('lineCleaningStarted', { 
          line: schedule.line,
          downtime: cleaningTime,
          throughputImpact: schedule.throughputImpact,
          time: currentTime 
        });

        // Schedule completion
        setTimeout(() => {
          schedule.downtime = 0;
          schedule.throughputImpact = 0;
          
          this.emit('lineCleaningCompleted', { 
            line: schedule.line,
            time: new Date(currentTime.getTime() + cleaningTime * 60 * 1000)
          });
        }, cleaningTime * 60 * 1000);
      }

      // Overdue cleaning penalties
      const overdueDays = Math.max(0, (currentTime.getTime() - schedule.nextCleaning.getTime()) / (1000 * 60 * 60 * 24));
      if (overdueDays > 1) {
        schedule.throughputImpact += overdueDays * 0.1; // 10% penalty per day overdue
        
        this.emit('lineCleaningOverdue', { 
          line: schedule.line,
          overdueDays,
          throughputPenalty: schedule.throughputImpact,
          time: currentTime 
        });
      }
    }
  }

  private updateThroughputImpact(inventory: VendorInventory, currentTime: Date): void {
    let totalImpact = 0;

    // Keg downtime impact
    totalImpact += inventory.kegInventory.downtime / 60; // Convert to hours

    // Food prep bottlenecks
    const bottleneckedItems = inventory.foodPrep.filter(prep => prep.bottleneck).length;
    totalImpact += bottleneckedItems * 0.2; // 20% impact per bottlenecked item

    // Line cleaning impact
    const cleaningImpact = inventory.lineCleaningSchedule.reduce(
      (sum, schedule) => sum + schedule.throughputImpact, 0
    );
    totalImpact += cleaningImpact;

    inventory.throughputImpact = Math.min(1, totalImpact); // Cap at 100%

    if (inventory.throughputImpact > 0.5) {
      this.emit('severeThroughputImpact', { 
        vendorId: inventory.vendorId,
        impact: inventory.throughputImpact,
        causes: this.identifyThroughputCauses(inventory),
        time: currentTime 
      });
    }
  }

  private manageBarOperations(currentTime: Date): void {
    for (const barOp of this.system.barOperations) {
      // Process till operations
      for (const till of barOp.tillOperations) {
        this.processTillOperation(till, currentTime);
      }

      // Monitor daily limits
      this.checkDailyLimits(barOp.dailyLimits, currentTime);
      
      // Handle card terminal status
      this.manageCardTerminal(barOp, currentTime);
      
      // Calculate cash variance
      this.updateCashVariance(barOp, currentTime);
    }
  }

  private processTillOperation(till: TillOperation, currentTime: Date): void {
    // Simulate transactions
    if (Math.random() < 0.4) { // 40% chance per tick
      const transactionAmount = Math.random() * 50 + 5; // $5-55
      const isCard = Math.random() < 0.7; // 70% card, 30% cash
      
      till.transactions++;
      
      if (isCard) {
        // Card transaction - no till impact
      } else {
        // Cash transaction
        till.currentBalance += transactionAmount;
        
        // Random cash handling errors
        if (Math.random() < 0.02) { // 2% error rate
          const error = (Math.random() - 0.5) * 10; // ±$5 error
          till.variance += error;
        }
      }
    }

    // Till reconciliation checks
    const hoursSinceReconciliation = (currentTime.getTime() - till.lastReconciliation.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceReconciliation >= 8) { // 8-hour reconciliation cycle
      this.performTillReconciliation(till, currentTime);
    }

    // Variance alerts
    if (Math.abs(till.variance) > 50) {
      this.emit('tillVarianceAlert', { 
        tillId: till.tillId,
        variance: till.variance,
        time: currentTime 
      });
    }
  }

  private checkDailyLimits(limits: DailyLimits, currentTime: Date): void {
    // Check if limits are reached
    if (limits.currentCash >= limits.cashLimit) {
      limits.limitReached = true;
      this.emit('cashLimitReached', { limits, time: currentTime });
    }

    if (limits.currentCard >= limits.cardLimit) {
      limits.limitReached = true;
      this.emit('cardLimitReached', { limits, time: currentTime });
    }

    // Reset daily limits at midnight
    const hour = currentTime.getHours();
    if (hour === 0 && limits.currentCash > 0) { // Reset at midnight
      limits.currentCash = 0;
      limits.currentCard = 0;
      limits.limitReached = false;
    }
  }

  private manageCardTerminal(barOp: BarOperations, currentTime: Date): void {
    // Random terminal issues
    if (barOp.cardTerminalStatus === 'Online' && Math.random() < 0.005) { // 0.5% failure rate
      barOp.cardTerminalStatus = 'Error';
      
      this.emit('cardTerminalError', { 
        vendorId: barOp.vendorId,
        time: currentTime 
      });
      
      // Auto-recovery attempt
      setTimeout(() => {
        if (Math.random() < 0.8) { // 80% recovery rate
          barOp.cardTerminalStatus = 'Online';
          this.emit('cardTerminalRecovered', { 
            vendorId: barOp.vendorId,
            time: new Date()
          });
        }
      }, (Math.random() * 10 + 5) * 60 * 1000); // 5-15 minutes
    }

    // Network connectivity issues
    if (barOp.cardTerminalStatus === 'Online' && Math.random() < 0.01) {
      barOp.cardTerminalStatus = 'Offline';
      
      this.emit('cardTerminalOffline', { 
        vendorId: barOp.vendorId,
        cashOnlyMode: true,
        time: currentTime 
      });

      // Network recovery
      setTimeout(() => {
        barOp.cardTerminalStatus = 'Online';
        this.emit('cardTerminalOnline', { 
          vendorId: barOp.vendorId,
          time: new Date()
        });
      }, (Math.random() * 20 + 10) * 60 * 1000); // 10-30 minutes
    }
  }

  private updateCashVariance(barOp: BarOperations, currentTime: Date): void {
    const totalExpected = barOp.tillOperations.reduce(
      (sum, till) => sum + till.openingBalance + till.currentBalance, 0
    );
    const totalActual = barOp.tillOperations.reduce(
      (sum, till) => sum + till.currentBalance, 0
    );
    
    barOp.cashVariance = totalActual - totalExpected;

    // Significant variance alert
    if (Math.abs(barOp.cashVariance) > 100) {
      this.emit('significantCashVariance', { 
        vendorId: barOp.vendorId,
        variance: barOp.cashVariance,
        time: currentTime 
      });
    }
  }

  private handleTillReconciliation(currentTime: Date): void {
    // Process scheduled reconciliations
    for (const reconciliation of this.system.tillReconciliation) {
      if (reconciliation.date <= currentTime && !reconciliation.reconciled) {
        this.processReconciliation(reconciliation, currentTime);
      }
    }

    // Schedule new reconciliations
    if (Math.random() < 0.1) { // 10% chance per tick
      this.scheduleReconciliation(currentTime);
    }
  }

  private conductAgeCheckAudits(currentTime: Date): void {
    // Random age check audits
    if (Math.random() < 0.02) { // 2% chance per tick
      const vendorId = this.festival.vendors[Math.floor(Math.random() * this.festival.vendors.length)].id;
      
      const audit: AgeCheckAudit = {
        vendorId,
        timestamp: currentTime,
        checker: `Inspector ${Math.floor(Math.random() * 5) + 1}`,
        passed: Math.random() > 0.1, // 90% pass rate
        failures: Math.floor(Math.random() * 3), // 0-2 failures
        fineRisk: 0,
        closureRisk: 0,
        complianceScore: 0
      };

      // Calculate risks based on failures
      if (audit.failures > 0) {
        audit.fineRisk = Math.min(1, audit.failures * 0.3); // 30% risk per failure
        audit.closureRisk = Math.max(0, (audit.failures - 2) * 0.2); // Risk starts at 3+ failures
      }

      // Calculate compliance score
      audit.complianceScore = Math.max(0, 10 - (audit.failures * 2.5));

      this.system.ageCheckAudits.push(audit);

      if (!audit.passed) {
        this.emit('ageCheckAuditFailed', { audit, time: currentTime });
        
        // Implement penalties
        if (audit.fineRisk > 0.5) {
          this.implementAuditPenalties(audit, currentTime);
        }
      } else {
        this.emit('ageCheckAuditPassed', { audit, time: currentTime });
      }
    }
  }

  private trackShrinkage(currentTime: Date): void {
    for (const shrinkage of this.system.shrinkageModel) {
      // Heavy pours simulation
      if (Math.random() < 0.1) { // 10% chance
        shrinkage.heavyPours += Math.random() * 2 + 1; // 1-3 heavy pours
      }

      // Comp drinks
      if (Math.random() < 0.05) { // 5% chance
        shrinkage.compDrinks += Math.random() * 3 + 1; // 1-4 comp drinks
      }

      // Wastage (spillage, returns, etc.)
      if (Math.random() < 0.08) { // 8% chance
        shrinkage.wastage += Math.random() * 1.5 + 0.5; // 0.5-2 units
      }

      // Theft (rare but impactful)
      if (Math.random() < 0.001) { // 0.1% chance
        shrinkage.theft += Math.random() * 5 + 5; // 5-10 units
        this.emit('shrinkageTheftDetected', { 
          vendorId: shrinkage.vendorId,
          amount: shrinkage.theft,
          time: currentTime 
        });
      }

      // Calculate total shrinkage
      shrinkage.totalShrinkage = shrinkage.heavyPours + shrinkage.compDrinks + 
                                shrinkage.wastage + shrinkage.theft;

      // Calculate margin impact
      const averageMargin = 0.65; // 65% margin
      shrinkage.impactOnMargin = shrinkage.totalShrinkage * averageMargin * 15; // $15 average price

      // Shrinkage alerts
      if (shrinkage.totalShrinkage > 50) { // High shrinkage threshold
        this.emit('highShrinkageAlert', { 
          vendorId: shrinkage.vendorId,
          shrinkage,
          recommendations: this.generateShrinkageRecommendations(shrinkage),
          time: currentTime 
        });
      }
    }
  }

  private monitorUtilityUsage(currentTime: Date): void {
    for (const usage of this.system.utilityTracking) {
      // Simulate usage patterns based on vendor type
      const vendor = this.festival.vendors.find(v => v.id === usage.vendorId);
      if (!vendor) continue;

      // Power usage
      let basePowerDraw = 5; // 5kW base
      if (vendor.type === 'Food') basePowerDraw = 20; // Higher for cooking equipment
      if (vendor.type === 'Beverage') basePowerDraw = 8; // Refrigeration
      
      const powerVariation = (Math.random() - 0.5) * 0.3; // ±15% variation
      usage.powerDraw = basePowerDraw * (1 + powerVariation);

      // Water usage (mainly food vendors)
      if (vendor.type === 'Food') {
        usage.waterUsage = Math.random() * 100 + 50; // 50-150 liters/hour
      } else {
        usage.waterUsage = Math.random() * 20 + 5; // 5-25 liters/hour
      }

      // Gas usage (cooking vendors)
      if (vendor.type === 'Food') {
        usage.gasDraw = Math.random() * 15 + 10; // 10-25 cubic meters/hour
      } else {
        usage.gasDraw = 0;
      }

      // Calculate grid impact
      usage.impactOnGrid = usage.powerDraw / 1000; // Convert to MW impact

      // Calculate costs
      const powerCost = usage.powerDraw * 0.15; // $0.15/kWh
      const waterCost = usage.waterUsage * 0.003; // $0.003/liter
      const gasCost = usage.gasDraw * 0.5; // $0.50/cubic meter
      usage.cost = powerCost + waterCost + gasCost;

      // High usage alerts
      if (usage.powerDraw > 50) { // >50kW
        this.emit('highPowerUsage', { 
          vendorId: usage.vendorId,
          powerDraw: usage.powerDraw,
          gridImpact: usage.impactOnGrid,
          time: currentTime 
        });
      }

      if (usage.cost > 200) { // >$200/hour
        this.emit('highUtilityCost', { 
          vendorId: usage.vendorId,
          hourlyCost: usage.cost,
          breakdown: { powerCost, waterCost, gasCost },
          time: currentTime 
        });
      }
    }
  }

  private optimizeMenuEngineering(currentTime: Date): void {
    for (const menu of this.system.menuEngineering) {
      // Update item performance
      this.updateMenuItemPerformance(menu.items, currentTime);
      
      // Process upsell prompts
      this.processUpsellPrompts(menu.upsellPrompts, currentTime);
      
      // Optimize queue operations
      this.optimizeQueueOperations(menu.queueOptimization, currentTime);
      
      // Menu recommendations
      this.generateMenuRecommendations(menu, currentTime);
    }
  }

  private updateVendorMetrics(currentTime: Date): void {
    // Calculate overall vendor performance metrics
    const totalThroughputImpact = this.system.inventory.reduce(
      (sum, inv) => sum + inv.throughputImpact, 0
    ) / this.system.inventory.length;

    const totalShrinkage = this.system.shrinkageModel.reduce(
      (sum, shrink) => sum + shrink.totalShrinkage, 0
    );

    const averageComplianceScore = this.system.ageCheckAudits
      .filter(audit => audit.timestamp > new Date(currentTime.getTime() - 24 * 60 * 60 * 1000))
      .reduce((sum, audit) => sum + audit.complianceScore, 0) / 
      Math.max(1, this.system.ageCheckAudits.length);

    const totalUtilityCost = this.system.utilityTracking.reduce(
      (sum, usage) => sum + usage.cost, 0
    );

    this.emit('vendorMetricsUpdate', { 
      throughputImpact: totalThroughputImpact,
      totalShrinkage,
      averageComplianceScore,
      totalUtilityCost,
      time: currentTime 
    });
  }

  // Helper methods
  private attemptKegReplacement(inventory: KegInventory, emptyKeg: Keg, currentTime: Date): void {
    // Check for available replacement kegs
    const availableKeg = inventory.kegs.find(keg => 
      keg.beverage === emptyKeg.beverage && 
      keg.currentLevel === keg.capacity &&
      keg.quality === 'Excellent'
    );

    if (availableKeg) {
      // Replace the empty keg
      emptyKeg.currentLevel = availableKeg.currentLevel;
      emptyKeg.tapped = currentTime;
      emptyKeg.quality = 'Excellent';
      
      // Mark replacement as used
      availableKeg.currentLevel = 0;
      
      this.emit('kegReplaced', { 
        beverage: emptyKeg.beverage,
        replacementTime: currentTime 
      });
    } else {
      this.emit('kegReplacementUnavailable', { 
        beverage: emptyKeg.beverage,
        time: currentTime 
      });
    }
  }

  private performLineCleaning(inventory: KegInventory, currentTime: Date): void {
    inventory.lastClean = currentTime;
    inventory.nextClean = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000); // Next day
    inventory.downtime = 30; // 30 minutes cleaning time

    this.emit('lineCleaningPerformed', { 
      totalLines: inventory.kegs.length,
      downtime: inventory.downtime,
      time: currentTime 
    });

    // Reset downtime after cleaning
    setTimeout(() => {
      inventory.downtime = 0;
    }, 30 * 60 * 1000);
  }

  private identifyThroughputCauses(inventory: VendorInventory): string[] {
    const causes: string[] = [];

    if (inventory.kegInventory.downtime > 0) {
      causes.push(`Keg system downtime: ${inventory.kegInventory.downtime} minutes`);
    }

    const bottlenecks = inventory.foodPrep.filter(prep => prep.bottleneck);
    if (bottlenecks.length > 0) {
      causes.push(`Food prep bottlenecks: ${bottlenecks.map(b => b.sku).join(', ')}`);
    }

    const overdueCleaning = inventory.lineCleaningSchedule.filter(
      schedule => schedule.throughputImpact > 0
    );
    if (overdueCleaning.length > 0) {
      causes.push(`Line cleaning issues: ${overdueCleaning.map(c => c.line).join(', ')}`);
    }

    return causes;
  }

  private performTillReconciliation(till: TillOperation, currentTime: Date): void {
    const reconciliation: TillReconciliation = {
      vendorId: `vendor_${till.tillId}`,
      tillId: till.tillId,
      date: currentTime,
      expectedCash: till.openingBalance + till.currentBalance,
      actualCash: till.currentBalance + (Math.random() - 0.5) * 20, // ±$10 variance
      variance: 0,
      cardTotal: till.transactions * 25, // Estimate
      reconciled: true,
      issues: []
    };

    reconciliation.variance = reconciliation.actualCash - reconciliation.expectedCash;

    if (Math.abs(reconciliation.variance) > 10) {
      reconciliation.issues.push('Cash variance exceeds threshold');
    }

    this.system.tillReconciliation.push(reconciliation);
    till.lastReconciliation = currentTime;
    till.variance = reconciliation.variance;

    this.emit('tillReconciliationCompleted', { reconciliation, time: currentTime });
  }

  private scheduleReconciliation(currentTime: Date): void {
    // Schedule future reconciliations for random tills
    const futureTime = new Date(currentTime.getTime() + Math.random() * 8 * 60 * 60 * 1000); // Next 8 hours
    const tillId = `till_${Math.floor(Math.random() * 10) + 1}`;

    const reconciliation: TillReconciliation = {
      vendorId: `vendor_${tillId}`,
      tillId,
      date: futureTime,
      expectedCash: 0,
      actualCash: 0,
      variance: 0,
      cardTotal: 0,
      reconciled: false,
      issues: []
    };

    this.system.tillReconciliation.push(reconciliation);
  }

  private processReconciliation(reconciliation: TillReconciliation, currentTime: Date): void {
    // Simulate reconciliation process
    const expectedCash = Math.random() * 1000 + 200; // $200-1200
    const actualCash = expectedCash + (Math.random() - 0.5) * 50; // ±$25 variance
    
    reconciliation.expectedCash = expectedCash;
    reconciliation.actualCash = actualCash;
    reconciliation.variance = actualCash - expectedCash;
    reconciliation.cardTotal = Math.random() * 2000 + 500; // $500-2500
    reconciliation.reconciled = true;

    // Check for issues
    if (Math.abs(reconciliation.variance) > 25) {
      reconciliation.issues.push('High cash variance');
    }

    if (reconciliation.cardTotal < 100) {
      reconciliation.issues.push('Low card transaction volume');
    }

    this.emit('reconciliationProcessed', { reconciliation, time: currentTime });
  }

  private implementAuditPenalties(audit: AgeCheckAudit, currentTime: Date): void {
    const fine = audit.failures * 500; // $500 per failure
    const suspensionDays = audit.failures > 3 ? audit.failures - 2 : 0;

    this.emit('auditPenaltyImplemented', { 
      vendorId: audit.vendorId,
      fine,
      suspensionDays,
      audit,
      time: currentTime 
    });

    if (suspensionDays > 0) {
      // Implement temporary closure
      this.emit('vendorSuspended', { 
        vendorId: audit.vendorId,
        duration: suspensionDays,
        reason: 'Age check audit failures',
        time: currentTime 
      });
    }
  }

  private generateShrinkageRecommendations(shrinkage: ShrinkageModel): string[] {
    const recommendations: string[] = [];

    if (shrinkage.heavyPours > 20) {
      recommendations.push('Implement portion control training');
      recommendations.push('Install automated pour systems');
    }

    if (shrinkage.compDrinks > 15) {
      recommendations.push('Review comp drink policy');
      recommendations.push('Implement manager approval for comps');
    }

    if (shrinkage.wastage > 10) {
      recommendations.push('Improve inventory handling procedures');
      recommendations.push('Review storage conditions');
    }

    if (shrinkage.theft > 5) {
      recommendations.push('Increase security monitoring');
      recommendations.push('Implement inventory spot checks');
    }

    return recommendations;
  }

  private updateMenuItemPerformance(items: MenuItem[], currentTime: Date): void {
    for (const item of items) {
      // Simulate sales and popularity changes
      if (Math.random() < 0.3) { // 30% chance of sales activity
        const salesChange = (Math.random() - 0.5) * 0.1; // ±5% popularity change
        item.popularity = Math.max(0, Math.min(1, item.popularity + salesChange));
      }

      // Calculate profitability category
      const marginPercentage = (item.price - item.cost) / item.price;
      
      if (item.popularity > 0.7 && marginPercentage > 0.6) {
        item.profitability = 'Star'; // High popularity, high margin
      } else if (item.popularity > 0.7 && marginPercentage <= 0.6) {
        item.profitability = 'Plow'; // High popularity, low margin
      } else if (item.popularity <= 0.7 && marginPercentage > 0.6) {
        item.profitability = 'Puzzle'; // Low popularity, high margin
      } else {
        item.profitability = 'Dog'; // Low popularity, low margin
      }
    }
  }

  private processUpsellPrompts(prompts: UpsellPrompt[], currentTime: Date): void {
    for (const prompt of prompts) {
      // Simulate upsell attempts
      if (prompt.active && Math.random() < 0.2) { // 20% chance per tick
        const success = Math.random() < prompt.successRate;
        
        if (success) {
          this.emit('upsellSuccess', { 
            prompt,
            margin: prompt.margin,
            time: currentTime 
          });
        }

        // Adjust success rate based on performance
        if (success) {
          prompt.successRate = Math.min(1, prompt.successRate + 0.01);
        } else {
          prompt.successRate = Math.max(0, prompt.successRate - 0.005);
        }
      }
    }
  }

  private optimizeQueueOperations(optimization: QueueOptimization, currentTime: Date): void {
    // Simulate queue performance
    const queueVariation = (Math.random() - 0.5) * 0.2; // ±10% variation
    optimization.averageQueueTime = Math.max(1, optimization.averageQueueTime * (1 + queueVariation));

    // Generate recommendations if queue time exceeds target
    if (optimization.averageQueueTime > optimization.targetQueueTime) {
      const timeOverage = optimization.averageQueueTime - optimization.targetQueueTime;
      
      // Staffing recommendations
      optimization.staffingRecommendations = Math.ceil(timeOverage / 2); // 1 staff per 2 minutes overage

      // Menu simplification
      optimization.menuSimplification = [
        'Reduce complex preparation items',
        'Implement pre-preparation strategies',
        'Streamline payment process'
      ];

      // Calculate potential gains
      optimization.throughputGains = timeOverage / optimization.averageQueueTime * 100; // Percentage gain

      this.emit('queueOptimizationRecommendation', { 
        optimization,
        timeOverage,
        time: currentTime 
      });
    }
  }

  private generateMenuRecommendations(menu: MenuEngineering, currentTime: Date): void {
    const recommendations: string[] = [];

    // Analyze menu performance
    const starItems = menu.items.filter(item => item.profitability === 'Star');
    const dogItems = menu.items.filter(item => item.profitability === 'Dog');
    const puzzleItems = menu.items.filter(item => item.profitability === 'Puzzle');

    if (starItems.length < 3) {
      recommendations.push('Promote more high-margin, popular items');
    }

    if (dogItems.length > menu.items.length * 0.3) {
      recommendations.push('Remove or reposition low-performing items');
    }

    if (puzzleItems.length > 0) {
      recommendations.push('Market puzzle items to increase popularity');
    }

    // Upsell recommendations
    const activeUpsells = menu.upsellPrompts.filter(prompt => prompt.active).length;
    if (activeUpsells < 3) {
      recommendations.push('Implement more strategic upsell prompts');
    }

    if (recommendations.length > 0) {
      this.emit('menuEngineeringRecommendations', { 
        vendorId: menu.vendorId,
        recommendations,
        time: currentTime 
      });
    }
  }

  // Initialize helper methods
  private generateVendorInventories(): VendorInventory[] {
    const inventories: VendorInventory[] = [];

    for (const vendor of this.festival.vendors) {
      if (vendor.type === 'Beverage' || vendor.type === 'Food') {
        const inventory: VendorInventory = {
          vendorId: vendor.id,
          kegInventory: this.createKegInventory(),
          foodPrep: this.createFoodPrepTimes(vendor.type),
          lineCleaningSchedule: this.createLineCleaningSchedule(),
          throughputImpact: 0
        };

        inventories.push(inventory);
      }
    }

    return inventories;
  }

  private createKegInventory(): KegInventory {
    const kegs: Keg[] = [];
    const beverages = ['Lager', 'IPA', 'Wheat Beer', 'Cider', 'Stout'];

    for (let i = 0; i < 8; i++) {
      const beverage = beverages[i % beverages.length];
      const capacity = 50; // 50 liters

      kegs.push({
        id: uuidv4(),
        beverage,
        capacity,
        currentLevel: Math.random() * capacity * 0.8 + capacity * 0.2, // 20-100% full
        tapped: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Up to 7 days ago
        estimatedEmpty: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000), // Next 24 hours
        quality: 'Excellent'
      });
    }

    return {
      kegs,
      totalCapacity: kegs.reduce((sum, keg) => sum + keg.capacity, 0),
      currentVolume: kegs.reduce((sum, keg) => sum + keg.currentLevel, 0),
      lastClean: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Last 24 hours
      nextClean: new Date(Date.now() + Math.random() * 12 * 60 * 60 * 1000), // Next 12 hours
      downtime: 0
    };
  }

  private createFoodPrepTimes(vendorType: string): FoodPrepTime[] {
    if (vendorType !== 'Food') return [];

    const foodItems = [
      'Burgers', 'Hot Dogs', 'Fries', 'Pizza Slice', 'Nachos',
      'Grilled Chicken', 'Fish & Chips', 'Sandwiches'
    ];

    return foodItems.map(sku => ({
      sku,
      prepTimeMinutes: Math.random() * 8 + 2, // 2-10 minutes
      staffRequired: Math.floor(Math.random() * 3) + 2, // 2-4 staff
      currentStaff: Math.floor(Math.random() * 4) + 1, // 1-4 current staff
      bottleneck: false,
      throughputLimit: 20 // Base throughput
    }));
  }

  private createLineCleaningSchedule(): LineCleaningSchedule[] {
    const lines = ['Line 1', 'Line 2', 'Line 3', 'Line 4'];

    return lines.map(line => ({
      line,
      frequency: 24, // 24 hours
      lastCleaned: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000),
      nextCleaning: new Date(Date.now() + Math.random() * 12 * 60 * 60 * 1000),
      downtime: 0,
      throughputImpact: 0
    }));
  }

  private generateBarOperations(): BarOperations[] {
    const operations: BarOperations[] = [];

    for (const vendor of this.festival.vendors) {
      if (vendor.type === 'Beverage') {
        const tillOps: TillOperation[] = [];
        
        // Create 2-3 tills per bar
        for (let i = 0; i < Math.floor(Math.random() * 2) + 2; i++) {
          tillOps.push({
            tillId: `${vendor.id}_till_${i + 1}`,
            openingBalance: 200, // $200 float
            currentBalance: 200 + Math.random() * 300, // $200-500
            transactions: Math.floor(Math.random() * 50),
            lastReconciliation: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000),
            variance: (Math.random() - 0.5) * 20 // ±$10
          });
        }

        operations.push({
          vendorId: vendor.id,
          tillOperations: tillOps,
          dailyLimits: {
            cashLimit: 5000,
            cardLimit: 20000,
            currentCash: Math.random() * 2000,
            currentCard: Math.random() * 8000,
            limitReached: false
          },
          cashVariance: 0,
          cardTerminalStatus: Math.random() > 0.1 ? 'Online' : 'Offline'
        });
      }
    }

    return operations;
  }

  private generateShrinkageModels(): ShrinkageModel[] {
    return this.festival.vendors
      .filter(vendor => vendor.type === 'Beverage')
      .map(vendor => ({
        vendorId: vendor.id,
        heavyPours: Math.random() * 10,
        compDrinks: Math.random() * 5,
        wastage: Math.random() * 8,
        theft: Math.random() * 2,
        totalShrinkage: 0,
        impactOnMargin: 0
      }));
  }

  private generateUtilityTracking(): VendorUtilityUsage[] {
    return this.festival.vendors.map(vendor => ({
      vendorId: vendor.id,
      powerDraw: Math.random() * 15 + 5, // 5-20kW
      waterUsage: Math.random() * 50 + 10, // 10-60 L/h
      gasDraw: vendor.type === 'Food' ? Math.random() * 10 + 5 : 0,
      impactOnGrid: 0,
      cost: 0
    }));
  }

  private generateMenuEngineering(): MenuEngineering[] {
    return this.festival.vendors.map(vendor => {
      const items: MenuItem[] = [];
      const itemNames = vendor.type === 'Food' ? 
        ['Burger', 'Fries', 'Drink', 'Combo'] :
        ['Beer', 'Wine', 'Cocktail', 'Soft Drink'];

      for (const name of itemNames) {
        const cost = Math.random() * 8 + 2; // $2-10
        const price = cost * (1.5 + Math.random() * 1); // 150-250% markup

        items.push({
          sku: `${vendor.id}_${name}`,
          name,
          cost,
          price,
          margin: price - cost,
          popularity: Math.random(),
          profitability: 'Star' // Will be calculated
        });
      }

      const upsellPrompts: UpsellPrompt[] = [
        {
          trigger: 'Main item ordered',
          suggestion: 'Add fries for $3?',
          margin: 2.5,
          successRate: 0.3,
          active: true
        },
        {
          trigger: 'Single item',
          suggestion: 'Make it a combo?',
          margin: 4,
          successRate: 0.25,
          active: true
        }
      ];

      return {
        vendorId: vendor.id,
        items,
        upsellPrompts,
        queueOptimization: {
          averageQueueTime: Math.random() * 5 + 2, // 2-7 minutes
          targetQueueTime: 3, // 3 minutes target
          staffingRecommendations: 0,
          menuSimplification: [],
          throughputGains: 0
        }
      };
    });
  }

  // Public methods for external access
  public getMetrics(): any {
    const totalThroughputImpact = this.system.inventory.reduce(
      (sum, inv) => sum + inv.throughputImpact, 0
    ) / Math.max(1, this.system.inventory.length);

    const totalShrinkage = this.system.shrinkageModel.reduce(
      (sum, model) => sum + model.totalShrinkage, 0
    );

    const recentAudits = this.system.ageCheckAudits.filter(audit =>
      audit.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    const averageComplianceScore = recentAudits.length > 0 ? 
      recentAudits.reduce((sum, audit) => sum + audit.complianceScore, 0) / recentAudits.length : 10;

    const totalUtilityCost = this.system.utilityTracking.reduce(
      (sum, usage) => sum + usage.cost, 0
    );

    const reconciliationVariance = this.system.tillReconciliation
      .filter(rec => rec.reconciled)
      .reduce((sum, rec) => sum + Math.abs(rec.variance), 0);

    return {
      operations: {
        averageThroughputImpact: totalThroughputImpact,
        totalVendors: this.festival.vendors.length,
        activeInventoryTracking: this.system.inventory.length
      },
      financial: {
        totalShrinkage,
        shrinkageValue: this.system.shrinkageModel.reduce((sum, model) => sum + model.impactOnMargin, 0),
        reconciliationVariance,
        totalUtilityCost
      },
      compliance: {
        averageComplianceScore,
        totalAudits: this.system.ageCheckAudits.length,
        failedAudits: this.system.ageCheckAudits.filter(audit => !audit.passed).length
      },
      efficiency: {
        averageQueueTime: this.system.menuEngineering.reduce(
          (sum, menu) => sum + menu.queueOptimization.averageQueueTime, 0
        ) / Math.max(1, this.system.menuEngineering.length),
        upsellSuccessRate: this.calculateOverallUpsellRate(),
        equipmentUptime: this.calculateEquipmentUptime()
      }
    };
  }

  private calculateOverallUpsellRate(): number {
    const allPrompts = this.system.menuEngineering.flatMap(menu => menu.upsellPrompts);
    if (allPrompts.length === 0) return 0;

    return allPrompts.reduce((sum, prompt) => sum + prompt.successRate, 0) / allPrompts.length;
  }

  private calculateEquipmentUptime(): number {
    let totalUptime = 0;
    let totalSystems = 0;

    for (const inventory of this.system.inventory) {
      // Keg system uptime
      const kegUptime = 1 - (inventory.kegInventory.downtime / 60); // Convert minutes to hour fraction
      totalUptime += Math.max(0, kegUptime);
      totalSystems++;

      // Line cleaning uptime
      for (const schedule of inventory.lineCleaningSchedule) {
        const lineUptime = 1 - schedule.throughputImpact;
        totalUptime += Math.max(0, lineUptime);
        totalSystems++;
      }
    }

    return totalSystems > 0 ? totalUptime / totalSystems : 1;
  }

  public getInventoryStatus(): VendorInventory[] {
    return this.system.inventory;
  }

  public getShrinkageReport(): ShrinkageModel[] {
    return this.system.shrinkageModel;
  }

  public getComplianceStatus(): AgeCheckAudit[] {
    return this.system.ageCheckAudits;
  }

  public getUtilityUsage(): VendorUtilityUsage[] {
    return this.system.utilityTracking;
  }

  public getMenuPerformance(): MenuEngineering[] {
    return this.system.menuEngineering;
  }
}