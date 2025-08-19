import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { SimulationSettings, Festival, Location } from '../../types';
import { 
  LogisticsSystem, LoadInSlot, AssetTracker, ChangeoverManager, 
  VehicleRoute, ChangeoverStopwatch, Checkpoint, RecoveryAction,
  MarshalPoint, VehicleBottleneck, VehicleRestriction
} from '../../types/enhanced';

export class EnhancedLogisticsEngine extends EventEmitter {
  private system: LogisticsSystem;
  private settings: SimulationSettings;
  private festival: Festival;

  constructor(festival: Festival, settings: SimulationSettings) {
    super();
    this.festival = festival;
    this.settings = settings;
    this.system = this.initializeSystem();
  }

  private initializeSystem(): LogisticsSystem {
    return {
      loadInSlots: this.generateLoadInSlots(),
      assetTracking: this.generateAssets(),
      changeovers: this.generateChangeovers(),
      vehicleRoutes: this.createVehicleRoutes()
    };
  }

  public process(currentTime: Date): void {
    this.processLoadInSlots(currentTime);
    this.trackAssets(currentTime);
    this.manageChangeovers(currentTime);
    this.monitorVehicleRoutes(currentTime);
    this.handleCongestion(currentTime);
  }

  private processLoadInSlots(currentTime: Date): void {
    for (const slot of this.system.loadInSlots) {
      // Check for slot start
      if (slot.status === 'Scheduled' && currentTime >= slot.timeSlot) {
        slot.status = 'InProgress';
        this.emit('loadInStarted', { slot, time: currentTime });
      }

      // Process active load-ins
      if (slot.status === 'InProgress') {
        const elapsedTime = currentTime.getTime() - slot.timeSlot.getTime();
        const durationMs = slot.duration * 60 * 1000;

        // Check for completion
        if (elapsedTime >= durationMs) {
          slot.status = 'Completed';
          this.completeLoadIn(slot, currentTime);
        } else {
          // Monitor progress and congestion
          this.monitorLoadInProgress(slot, elapsedTime, currentTime);
        }
      }

      // Update congestion levels
      this.updateDockCongestion(slot, currentTime);
    }
  }

  private trackAssets(currentTime: Date): void {
    for (const asset of this.system.assetTracking) {
      // Simulate asset scanning and location updates
      if (Math.random() < 0.1) { // 10% chance of scan per tick
        this.simulateAssetScan(asset, currentTime);
      }

      // Check for missing assets
      const timeSinceLastScan = currentTime.getTime() - asset.lastScan.getTime();
      if (timeSinceLastScan > 4 * 60 * 60 * 1000) { // 4 hours
        this.handleMissingAsset(asset, currentTime);
      }

      // Update lost risk based on time and value
      this.updateLostRisk(asset, timeSinceLastScan);

      // Process recovery actions
      this.processRecoveryActions(asset, currentTime);
    }
  }

  private manageChangeovers(currentTime: Date): void {
    for (const changeover of this.system.changeovers) {
      // Start changeover
      if (changeover.scheduledStart <= currentTime && !changeover.actualStart) {
        this.startChangeover(changeover, currentTime);
      }

      // Monitor active changeovers
      if (changeover.actualStart && !changeover.actualEnd) {
        this.monitorChangeover(changeover, currentTime);
      }

      // Check for completion
      if (changeover.actualStart && changeover.scheduledEnd <= currentTime && !changeover.actualEnd) {
        this.completeChangeover(changeover, currentTime);
      }
    }
  }

  private monitorVehicleRoutes(currentTime: Date): void {
    for (const route of this.system.vehicleRoutes) {
      // Update route usage
      this.updateRouteUsage(route, currentTime);

      // Monitor bottlenecks
      this.monitorBottlenecks(route, currentTime);

      // Check marshal points
      this.checkMarshalPoints(route, currentTime);

      // Apply restrictions
      this.enforceRestrictions(route, currentTime);
    }
  }

  private handleCongestion(currentTime: Date): void {
    // Find heavily congested areas
    const congestedSlots = this.system.loadInSlots.filter(slot => slot.congestionLevel > 7);
    const congestedRoutes = this.system.vehicleRoutes.filter(route => 
      route.currentUsage / route.capacity > 0.9
    );

    // Emit congestion alerts
    if (congestedSlots.length > 0) {
      this.emit('dockCongestion', { slots: congestedSlots, time: currentTime });
    }

    if (congestedRoutes.length > 0) {
      this.emit('routeCongestion', { routes: congestedRoutes, time: currentTime });
    }

    // Auto-reschedule if possible
    this.attemptCongestionMitigation(currentTime);
  }

  private completeLoadIn(slot: LoadInSlot, currentTime: Date): void {
    // Reduce dock congestion
    slot.congestionLevel = Math.max(0, slot.congestionLevel - 2);
    
    this.emit('loadInCompleted', { slot, time: currentTime });
    
    // Free up dock for next slot
    this.scheduleNextLoadIn(slot.dock, currentTime);
  }

  private monitorLoadInProgress(slot: LoadInSlot, elapsedTime: number, currentTime: Date): void {
    const progressPercent = elapsedTime / (slot.duration * 60 * 1000);
    
    // Check for delays
    if (progressPercent > 1.2) { // 20% overtime
      slot.status = 'Delayed';
      slot.congestionLevel = Math.min(10, slot.congestionLevel + 1);
      this.emit('loadInDelayed', { slot, delay: progressPercent - 1, time: currentTime });
    }

    // Monitor priority items
    if (slot.priority > 8) {
      this.emit('priorityLoadInUpdate', { slot, progress: progressPercent, time: currentTime });
    }
  }

  private updateDockCongestion(slot: LoadInSlot, currentTime: Date): void {
    // Congestion increases with multiple active slots at same dock
    const sameDockSlots = this.system.loadInSlots.filter(
      s => s.dock === slot.dock && s.status === 'InProgress'
    );

    if (sameDockSlots.length > 1) {
      slot.congestionLevel = Math.min(10, slot.congestionLevel + 0.5);
    } else {
      slot.congestionLevel = Math.max(0, slot.congestionLevel - 0.2);
    }
  }

  private simulateAssetScan(asset: AssetTracker, currentTime: Date): void {
    // Random location update
    const locations: Location[] = [
      { x: 100, y: 100, zone: 'Dock A' },
      { x: 200, y: 150, zone: 'Dock B' },
      { x: 150, y: 200, zone: 'Stage 1' },
      { x: 250, y: 250, zone: 'Stage 2' },
      { x: 300, y: 100, zone: 'Storage' }
    ];

    asset.location = locations[Math.floor(Math.random() * locations.length)];
    asset.lastScan = currentTime;

    // Update status based on movement
    if (asset.status === 'Missing' && Math.random() < 0.3) {
      asset.status = 'Located';
      this.emit('assetFound', { asset, time: currentTime });
    } else if (asset.status === 'Located' && Math.random() < 0.02) {
      asset.status = 'InTransit';
    }

    this.emit('assetScanned', { asset, time: currentTime });
  }

  private handleMissingAsset(asset: AssetTracker, currentTime: Date): void {
    if (asset.status !== 'Missing') {
      asset.status = 'Missing';
      asset.lostRisk = Math.min(1, asset.lostRisk + 0.3);
      
      // Initiate recovery procedures
      const recoveryAction: RecoveryAction = {
        action: 'Search and Locate',
        assignedTo: this.assignRecoveryStaff(),
        deadline: new Date(currentTime.getTime() + 2 * 60 * 60 * 1000), // 2 hours
        completed: false,
        cost: asset.value * 0.05 // 5% of asset value for search cost
      };

      asset.recoveryFlow.push(recoveryAction);
      this.emit('assetMissing', { asset, recoveryAction, time: currentTime });
    }
  }

  private updateLostRisk(asset: AssetTracker, timeSinceLastScan: number): void {
    const hoursWithoutScan = timeSinceLastScan / (1000 * 60 * 60);
    
    // Risk increases over time
    if (hoursWithoutScan > 2) {
      asset.lostRisk = Math.min(1, asset.lostRisk + 0.01);
    }

    // High-value items have higher risk
    if (asset.value > 10000) {
      asset.lostRisk = Math.min(1, asset.lostRisk + 0.005);
    }

    // Critical categories have higher risk
    if (asset.category === 'Equipment' || asset.category === 'Instrument') {
      asset.lostRisk = Math.min(1, asset.lostRisk + 0.002);
    }
  }

  private processRecoveryActions(asset: AssetTracker, currentTime: Date): void {
    for (const action of asset.recoveryFlow) {
      if (!action.completed && currentTime >= action.deadline) {
        // Recovery action timed out
        if (Math.random() < 0.6) { // 60% success rate
          action.completed = true;
          asset.status = 'Located';
          asset.lostRisk = Math.max(0, asset.lostRisk - 0.5);
          this.emit('recoverySuccess', { asset, action, time: currentTime });
        } else {
          // Escalate to more expensive recovery
          const escalatedAction: RecoveryAction = {
            action: 'Professional Search',
            assignedTo: 'External Team',
            deadline: new Date(currentTime.getTime() + 4 * 60 * 60 * 1000), // 4 hours
            completed: false,
            cost: asset.value * 0.15 // 15% of asset value
          };
          asset.recoveryFlow.push(escalatedAction);
          this.emit('recoveryEscalated', { asset, action: escalatedAction, time: currentTime });
        }
      }
    }
  }

  private startChangeover(changeover: ChangeoverManager, currentTime: Date): void {
    changeover.actualStart = currentTime;
    changeover.stopwatch = {
      startTime: currentTime,
      endTime: new Date(),
      elapsedTime: 0,
      checkpoints: this.createChangeoverCheckpoints(),
      status: 'Running'
    };

    this.emit('changeoverStarted', { changeover, time: currentTime });
  }

  private monitorChangeover(changeover: ChangeoverManager, currentTime: Date): void {
    const elapsedTime = currentTime.getTime() - changeover.actualStart!.getTime();
    changeover.actualTime = elapsedTime / (1000 * 60); // Convert to minutes
    changeover.stopwatch.elapsedTime = changeover.actualTime;

    // Check checkpoints
    this.updateChangeoverCheckpoints(changeover, currentTime);

    // Check for overtime
    if (changeover.actualTime > changeover.targetTime) {
      changeover.stopwatch.status = 'Overtime';
      const overtimeMinutes = changeover.actualTime - changeover.targetTime;
      changeover.penalties = Math.floor(overtimeMinutes * 100); // $100 per minute penalty
      
      this.emit('changeoverOvertime', { 
        changeover, 
        overtimeMinutes, 
        penalties: changeover.penalties,
        time: currentTime 
      });
    }
  }

  private completeChangeover(changeover: ChangeoverManager, currentTime: Date): void {
    changeover.actualEnd = currentTime;
    changeover.stopwatch.endTime = currentTime;
    changeover.stopwatch.status = 'Completed';

    // Calculate bonuses for being under time
    if (changeover.actualTime < changeover.targetTime) {
      const timeSaved = changeover.targetTime - changeover.actualTime;
      changeover.bonuses = Math.floor(timeSaved * 50); // $50 per minute bonus
      
      this.emit('changeoverBonus', { 
        changeover, 
        timeSaved, 
        bonuses: changeover.bonuses,
        time: currentTime 
      });
    }

    this.emit('changeoverCompleted', { changeover, time: currentTime });
  }

  private updateChangeoverCheckpoints(changeover: ChangeoverManager, currentTime: Date): void {
    for (const checkpoint of changeover.stopwatch.checkpoints) {
      if (!checkpoint.completed) {
        const shouldComplete = Math.random() < 0.3; // 30% chance per tick
        
        if (shouldComplete) {
          checkpoint.completed = true;
          checkpoint.actualTime = changeover.actualTime;
          
          // Check if checkpoint was hit on time
          if (checkpoint.actualTime <= checkpoint.targetTime) {
            this.emit('checkpointHit', { changeover, checkpoint, time: currentTime });
          } else {
            checkpoint.issues.push('Late completion');
            this.emit('checkpointMissed', { changeover, checkpoint, time: currentTime });
          }
          break; // Only complete one checkpoint per tick
        }
      }
    }
  }

  private updateRouteUsage(route: VehicleRoute, currentTime: Date): void {
    // Simulate traffic based on time of day and festival activity
    const hour = currentTime.getHours();
    let baseUsage = 0.3;

    // Higher usage during setup/breakdown hours
    if (hour >= 6 && hour <= 10) baseUsage = 0.7; // Morning setup
    if (hour >= 16 && hour <= 20) baseUsage = 0.8; // Evening activities
    if (hour >= 22 || hour <= 2) baseUsage = 0.6; // Breakdown

    // Add random variation
    const variation = (Math.random() - 0.5) * 0.3;
    const targetUsage = Math.max(0, Math.min(1, baseUsage + variation));
    
    route.currentUsage = Math.floor(route.capacity * targetUsage);
  }

  private monitorBottlenecks(route: VehicleRoute, currentTime: Date): void {
    for (const bottleneck of route.bottlenecks) {
      // Update severity based on route usage
      const utilizationRate = route.currentUsage / route.capacity;
      
      if (utilizationRate > 0.9) {
        bottleneck.severity = 'Critical';
        bottleneck.estimatedDelay = 15 + Math.random() * 10; // 15-25 minutes
      } else if (utilizationRate > 0.7) {
        bottleneck.severity = 'High';
        bottleneck.estimatedDelay = 5 + Math.random() * 10; // 5-15 minutes
      } else if (utilizationRate > 0.5) {
        bottleneck.severity = 'Medium';
        bottleneck.estimatedDelay = Math.random() * 5; // 0-5 minutes
      } else {
        bottleneck.severity = 'Low';
        bottleneck.estimatedDelay = 0;
      }

      // Emit bottleneck alerts for critical situations
      if (bottleneck.severity === 'Critical') {
        this.emit('criticalBottleneck', { route, bottleneck, time: currentTime });
      }
    }
  }

  private checkMarshalPoints(route: VehicleRoute, currentTime: Date): void {
    for (const marshal of route.marshalPoints) {
      // Simulate marshal break times
      if (marshal.status === 'Active' && Math.random() < 0.02) {
        marshal.status = 'Break';
        this.emit('marshalBreak', { route, marshal, time: currentTime });
      } else if (marshal.status === 'Break' && Math.random() < 0.1) {
        marshal.status = 'Active';
      }

      // Update vehicles guided count
      if (marshal.status === 'Active' && Math.random() < 0.4) {
        marshal.vehiclesGuided++;
      }

      // Check for emergency situations
      if (route.currentUsage > route.capacity * 0.95 && marshal.status !== 'Emergency') {
        marshal.status = 'Emergency';
        this.emit('marshalEmergency', { route, marshal, time: currentTime });
      }
    }
  }

  private enforceRestrictions(route: VehicleRoute, currentTime: Date): void {
    for (const restriction of route.restrictions) {
      if (restriction.enforcement) {
        // Simulate restriction violations
        if (Math.random() < 0.05) { // 5% violation rate
          this.emit('restrictionViolation', { 
            route, 
            restriction, 
            violationType: restriction.type,
            time: currentTime 
          });
        }
      }
    }
  }

  private attemptCongestionMitigation(currentTime: Date): void {
    // Find alternative slots for delayed load-ins
    const delayedSlots = this.system.loadInSlots.filter(slot => slot.status === 'Delayed');
    
    for (const slot of delayedSlots) {
      const alternativeSlot = this.findAlternativeLoadInSlot(slot, currentTime);
      if (alternativeSlot) {
        this.rescheduleLoadIn(slot, alternativeSlot, currentTime);
      }
    }

    // Reroute vehicles from congested routes
    const congestedRoutes = this.system.vehicleRoutes.filter(route => 
      route.currentUsage / route.capacity > 0.9
    );
    
    for (const route of congestedRoutes) {
      const alternativeRoute = this.findAlternativeRoute(route);
      if (alternativeRoute) {
        this.suggestRouteChange(route, alternativeRoute, currentTime);
      }
    }
  }

  private scheduleNextLoadIn(dock: string, currentTime: Date): void {
    const nextSlot = this.system.loadInSlots.find(
      slot => slot.dock === dock && slot.status === 'Scheduled' && slot.timeSlot > currentTime
    );

    if (nextSlot) {
      this.emit('nextLoadInReady', { dock, nextSlot, time: currentTime });
    }
  }

  private findAlternativeLoadInSlot(originalSlot: LoadInSlot, currentTime: Date): LoadInSlot | null {
    return this.system.loadInSlots.find(slot => 
      slot.dock !== originalSlot.dock &&
      slot.status === 'Scheduled' &&
      slot.timeSlot > currentTime &&
      slot.congestionLevel < 5
    ) || null;
  }

  private findAlternativeRoute(congestedRoute: VehicleRoute): VehicleRoute | null {
    return this.system.vehicleRoutes.find(route => 
      route.id !== congestedRoute.id &&
      route.type === congestedRoute.type &&
      route.currentUsage / route.capacity < 0.7
    ) || null;
  }

  private rescheduleLoadIn(originalSlot: LoadInSlot, newSlot: LoadInSlot, currentTime: Date): void {
    // Swap the assignments
    const tempAssigned = originalSlot.assignedTo;
    originalSlot.assignedTo = newSlot.assignedTo;
    newSlot.assignedTo = tempAssigned;

    this.emit('loadInRescheduled', { originalSlot, newSlot, time: currentTime });
  }

  private suggestRouteChange(congestedRoute: VehicleRoute, alternativeRoute: VehicleRoute, currentTime: Date): void {
    this.emit('routeChangeRecommended', { 
      congestedRoute, 
      alternativeRoute, 
      estimatedTimeSaving: Math.random() * 15 + 5, // 5-20 minutes
      time: currentTime 
    });
  }

  private assignRecoveryStaff(): string {
    const staffIds = ['staff_001', 'staff_002', 'staff_003', 'staff_004'];
    return staffIds[Math.floor(Math.random() * staffIds.length)];
  }

  private createChangeoverCheckpoints(): Checkpoint[] {
    return [
      {
        name: 'Clear Stage',
        targetTime: 5,
        actualTime: 0,
        completed: false,
        issues: []
      },
      {
        name: 'Setup Equipment',
        targetTime: 15,
        actualTime: 0,
        completed: false,
        issues: []
      },
      {
        name: 'Sound Check',
        targetTime: 25,
        actualTime: 0,
        completed: false,
        issues: []
      },
      {
        name: 'Final Check',
        targetTime: 30,
        actualTime: 0,
        completed: false,
        issues: []
      }
    ];
  }

  private generateLoadInSlots(): LoadInSlot[] {
    const slots: LoadInSlot[] = [];
    const docks = ['Dock A', 'Dock B', 'Dock C', 'Dock D'];
    const types: LoadInSlot['type'][] = ['Vendor', 'Artist', 'Production'];

    for (let i = 0; i < 20; i++) {
      const startTime = new Date(Date.now() + Math.random() * 2 * 24 * 60 * 60 * 1000);
      
      slots.push({
        id: uuidv4(),
        dock: docks[Math.floor(Math.random() * docks.length)],
        timeSlot: startTime,
        duration: 60 + Math.random() * 120, // 1-3 hours
        assignedTo: `Entity_${i + 1}`,
        type: types[Math.floor(Math.random() * types.length)],
        status: 'Scheduled',
        congestionLevel: Math.floor(Math.random() * 3),
        priority: Math.floor(Math.random() * 10) + 1
      });
    }

    return slots;
  }

  private generateAssets(): AssetTracker[] {
    const assets: AssetTracker[] = [];
    const categories: AssetTracker['category'][] = [
      'Roadcase', 'Equipment', 'Instrument', 'Lighting', 'Audio', 'Other'
    ];
    const owners = ['Artist A', 'Artist B', 'Production Co', 'Venue', 'Vendor 1'];

    for (let i = 0; i < 50; i++) {
      assets.push({
        id: uuidv4(),
        qrCode: `QR_${uuidv4()}`,
        name: `Asset ${i + 1}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        owner: owners[Math.floor(Math.random() * owners.length)],
        location: { x: Math.random() * 500, y: Math.random() * 500, zone: 'Initial' },
        status: 'Located',
        lastScan: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000), // Within 2 hours
        lostRisk: Math.random() * 0.3,
        value: Math.floor(Math.random() * 50000) + 1000,
        recoveryFlow: []
      });
    }

    return assets;
  }

  private generateChangeovers(): ChangeoverManager[] {
    const changeovers: ChangeoverManager[] = [];
    const stages = ['Main Stage', 'Second Stage', 'Acoustic Stage'];
    const artists = ['Artist A', 'Artist B', 'Artist C', 'Artist D', 'Artist E'];

    for (let i = 0; i < 10; i++) {
      const start = new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000);
      const targetTime = 30 + Math.random() * 30; // 30-60 minutes
      
      changeovers.push({
        id: uuidv4(),
        stageId: stages[Math.floor(Math.random() * stages.length)],
        fromArtist: artists[Math.floor(Math.random() * artists.length)],
        toArtist: artists[Math.floor(Math.random() * artists.length)],
        scheduledStart: start,
        actualStart: new Date(),
        scheduledEnd: new Date(start.getTime() + targetTime * 60 * 1000),
        actualEnd: new Date(),
        targetTime,
        actualTime: 0,
        stopwatch: {
          startTime: new Date(),
          endTime: new Date(),
          elapsedTime: 0,
          checkpoints: [],
          status: 'NotStarted'
        },
        penalties: 0,
        bonuses: 0,
        crew: [`crew_${i + 1}`, `crew_${i + 2}`]
      });
    }

    return changeovers;
  }

  private createVehicleRoutes(): VehicleRoute[] {
    return [
      {
        id: uuidv4(),
        name: 'Main Access Road',
        type: 'TwoWay',
        waypoints: [
          { x: 0, y: 0, zone: 'Entrance' },
          { x: 100, y: 100, zone: 'Main Area' },
          { x: 200, y: 200, zone: 'Backstage' }
        ],
        marshalPoints: [
          {
            location: { x: 50, y: 50, zone: 'Checkpoint 1' },
            staffId: 'marshal_001',
            status: 'Active',
            vehiclesGuided: 0
          }
        ],
        bottlenecks: [
          {
            location: { x: 100, y: 100, zone: 'Main Junction' },
            severity: 'Medium',
            cause: 'Narrow passage',
            estimatedDelay: 3
          }
        ],
        restrictions: [
          {
            type: 'Weight',
            limit: 10000, // 10 tonnes
            enforcement: true
          }
        ],
        capacity: 20,
        currentUsage: 5
      },
      {
        id: uuidv4(),
        name: 'Service Route',
        type: 'OneWay',
        waypoints: [
          { x: 50, y: 0, zone: 'Service Entrance' },
          { x: 150, y: 50, zone: 'Service Area' },
          { x: 250, y: 100, zone: 'Service Exit' }
        ],
        marshalPoints: [],
        bottlenecks: [],
        restrictions: [
          {
            type: 'Access',
            limit: 'Service Vehicles Only',
            enforcement: true
          }
        ],
        capacity: 10,
        currentUsage: 3
      }
    ];
  }

  // Public methods for external access
  public scheduleLoadIn(assignedTo: string, dock: string, duration: number, type: LoadInSlot['type'], priority: number = 5): string {
    // Find next available slot
    const availableTime = this.findNextAvailableSlot(dock);
    
    const slot: LoadInSlot = {
      id: uuidv4(),
      dock,
      timeSlot: availableTime,
      duration,
      assignedTo,
      type,
      status: 'Scheduled',
      congestionLevel: 0,
      priority
    };

    this.system.loadInSlots.push(slot);
    this.emit('loadInScheduled', { slot });
    
    return slot.id;
  }

  private findNextAvailableSlot(dock: string): Date {
    const dockSlots = this.system.loadInSlots
      .filter(slot => slot.dock === dock)
      .sort((a, b) => a.timeSlot.getTime() - b.timeSlot.getTime());

    if (dockSlots.length === 0) {
      return new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    }

    const lastSlot = dockSlots[dockSlots.length - 1];
    return new Date(lastSlot.timeSlot.getTime() + lastSlot.duration * 60 * 1000 + 30 * 60 * 1000); // 30 min buffer
  }

  public trackAsset(name: string, category: AssetTracker['category'], owner: string, value: number): string {
    const asset: AssetTracker = {
      id: uuidv4(),
      qrCode: `QR_${uuidv4()}`,
      name,
      category,
      owner,
      location: { x: 0, y: 0, zone: 'Receiving' },
      status: 'Located',
      lastScan: new Date(),
      lostRisk: 0,
      value,
      recoveryFlow: []
    };

    this.system.assetTracking.push(asset);
    return asset.id;
  }

  public getMetrics(): any {
    const scheduledLoadIns = this.system.loadInSlots.filter(s => s.status === 'Scheduled').length;
    const activeLoadIns = this.system.loadInSlots.filter(s => s.status === 'InProgress').length;
    const completedLoadIns = this.system.loadInSlots.filter(s => s.status === 'Completed').length;
    const delayedLoadIns = this.system.loadInSlots.filter(s => s.status === 'Delayed').length;

    const locatedAssets = this.system.assetTracking.filter(a => a.status === 'Located').length;
    const missingAssets = this.system.assetTracking.filter(a => a.status === 'Missing').length;
    const highRiskAssets = this.system.assetTracking.filter(a => a.lostRisk > 0.7).length;

    const activeChangeovers = this.system.changeovers.filter(c => c.actualStart && !c.actualEnd).length;
    const completedChangeovers = this.system.changeovers.filter(c => c.actualEnd).length;
    const overtimeChangeovers = this.system.changeovers.filter(c => c.penalties > 0).length;

    const totalRouteCapacity = this.system.vehicleRoutes.reduce((sum, route) => sum + route.capacity, 0);
    const totalRouteUsage = this.system.vehicleRoutes.reduce((sum, route) => sum + route.currentUsage, 0);

    return {
      loadIn: {
        scheduled: scheduledLoadIns,
        active: activeLoadIns,
        completed: completedLoadIns,
        delayed: delayedLoadIns
      },
      assets: {
        total: this.system.assetTracking.length,
        located: locatedAssets,
        missing: missingAssets,
        highRisk: highRiskAssets
      },
      changeovers: {
        active: activeChangeovers,
        completed: completedChangeovers,
        overtime: overtimeChangeovers
      },
      routes: {
        utilization: totalRouteUsage / totalRouteCapacity,
        totalCapacity: totalRouteCapacity,
        currentUsage: totalRouteUsage
      }
    };
  }

  public getLoadInSchedule(): LoadInSlot[] {
    return this.system.loadInSlots.sort((a, b) => a.timeSlot.getTime() - b.timeSlot.getTime());
  }

  public getAssetStatus(): AssetTracker[] {
    return this.system.assetTracking;
  }

  public getChangeoverStatus(): ChangeoverManager[] {
    return this.system.changeovers;
  }

  public getVehicleRoutes(): VehicleRoute[] {
    return this.system.vehicleRoutes;
  }
}