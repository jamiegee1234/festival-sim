import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { SimulationSettings, Festival } from '../../types';
import { 
  CrewRosteringSystem, Shift, ShiftSwap, OvertimeRule, FatigueTracker, 
  VolunteerProfile, FatiguePenalty, Incentive, TrainingRecord 
} from '../../types/enhanced';

export class CrewManagementEngine extends EventEmitter {
  private system: CrewRosteringSystem;
  private settings: SimulationSettings;
  private festival: Festival;

  constructor(festival: Festival, settings: SimulationSettings) {
    super();
    this.festival = festival;
    this.settings = settings;
    this.system = this.initializeSystem();
  }

  private initializeSystem(): CrewRosteringSystem {
    return {
      shifts: this.generateInitialShifts(),
      swapRequests: [],
      overtimeRules: this.createOvertimeRules(),
      fatigueTracker: [],
      volunteers: this.generateVolunteerProfiles()
    };
  }

  public process(currentTime: Date): void {
    this.processActiveShifts(currentTime);
    this.handleShiftSwaps(currentTime);
    this.monitorFatigue(currentTime);
    this.processVolunteers(currentTime);
    this.checkOvertimeRules(currentTime);
    this.handleNoShows(currentTime);
  }

  private processActiveShifts(currentTime: Date): void {
    for (const shift of this.system.shifts) {
      // Check for shift start
      if (shift.status === 'Scheduled' && currentTime >= shift.startTime) {
        // Check for no-show
        if (Math.random() < 0.05) { // 5% no-show rate
          shift.status = 'NoShow';
          this.handleShiftNoShow(shift, currentTime);
        } else {
          shift.status = 'Active';
          this.startShift(shift, currentTime);
        }
      }

      // Check for shift end
      if (shift.status === 'Active' && currentTime >= shift.endTime) {
        shift.status = 'Completed';
        this.completeShift(shift, currentTime);
      }

      // Monitor active shifts for issues
      if (shift.status === 'Active') {
        this.monitorActiveShift(shift, currentTime);
      }
    }
  }

  private handleShiftSwaps(currentTime: Date): void {
    for (const swap of this.system.swapRequests) {
      if (swap.status === 'Pending') {
        // Auto-approve swaps that meet criteria
        if (this.canAutoApproveSwap(swap)) {
          swap.status = 'Approved';
          swap.approver = 'System';
          this.executeShiftSwap(swap, currentTime);
          this.emit('shiftSwapApproved', { swap, time: currentTime });
        }

        // Reject swaps that violate rules
        if (this.violatesSwapRules(swap)) {
          swap.status = 'Rejected';
          this.emit('shiftSwapRejected', { swap, reason: 'Rule Violation', time: currentTime });
        }
      }
    }
  }

  private monitorFatigue(currentTime: Date): void {
    for (const tracker of this.system.fatigueTracker) {
      // Update fatigue levels
      this.updateFatigueLevel(tracker, currentTime);

      // Apply fatigue penalties
      if (tracker.fatigueLevel > 0.7) {
        this.applyFatiguePenalty(tracker, currentTime);
      }

      // Check for mandatory rest
      if (tracker.fatigueLevel > 0.9) {
        this.enforceMandatoryRest(tracker, currentTime);
      }
    }
  }

  private processVolunteers(currentTime: Date): void {
    for (const volunteer of this.system.volunteers) {
      // Update no-show probability based on performance
      this.updateNoShowProbability(volunteer, currentTime);

      // Award incentives for good performance
      if (volunteer.performanceScore > 8.5 && Math.random() < 0.1) {
        this.awardIncentive(volunteer, currentTime);
      }

      // Check training expiration
      this.checkTrainingStatus(volunteer, currentTime);

      // Random volunteer events
      if (Math.random() < 0.02) {
        this.handleVolunteerEvent(volunteer, currentTime);
      }
    }
  }

  private checkOvertimeRules(currentTime: Date): void {
    for (const rule of this.system.overtimeRules) {
      const departmentShifts = this.system.shifts.filter(
        shift => shift.department === rule.department && shift.status === 'Active'
      );

      for (const shift of departmentShifts) {
        const hoursWorked = (currentTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursWorked > rule.maxHoursDaily && !shift.overtime) {
          if (rule.autoApprove) {
            shift.overtime = true;
            shift.rate *= rule.multiplier;
            this.emit('overtimeAuthorized', { shift, rule, time: currentTime });
          } else {
            this.emit('overtimeApprovalRequired', { shift, rule, time: currentTime });
          }
        }
      }
    }
  }

  private handleNoShows(currentTime: Date): void {
    const noShowShifts = this.system.shifts.filter(shift => shift.status === 'NoShow');
    
    for (const shift of noShowShifts) {
      // Try to find replacement
      const replacement = this.findReplacementWorker(shift, currentTime);
      if (replacement) {
        this.assignReplacementShift(shift, replacement, currentTime);
      } else {
        // Critical understaffing
        this.emit('understaffingAlert', { shift, time: currentTime });
      }
    }
  }

  private handleShiftNoShow(shift: Shift, currentTime: Date): void {
    // Update fatigue tracker
    const tracker = this.system.fatigueTracker.find(t => t.staffId === shift.staffId);
    if (tracker) {
      tracker.penalties.push({
        type: 'PerformanceDegrade',
        severity: 0.2,
        description: 'No-show penalty',
        applied: currentTime
      });
    }

    // Update volunteer no-show probability if applicable
    const volunteer = this.system.volunteers.find(v => v.id === shift.staffId);
    if (volunteer) {
      volunteer.noShowProbability = Math.min(1, volunteer.noShowProbability + 0.1);
      volunteer.performanceScore = Math.max(0, volunteer.performanceScore - 0.5);
    }

    this.emit('shiftNoShow', { shift, time: currentTime });
  }

  private startShift(shift: Shift, currentTime: Date): void {
    // Initialize or update fatigue tracker
    let tracker = this.system.fatigueTracker.find(t => t.staffId === shift.staffId);
    if (!tracker) {
      tracker = {
        staffId: shift.staffId,
        hoursWorked: 0,
        consecutiveDays: 1,
        fatigueLevel: 0,
        penalties: [],
        lastRest: new Date(currentTime.getTime() - 8 * 60 * 60 * 1000) // 8 hours ago
      };
      this.system.fatigueTracker.push(tracker);
    }

    this.emit('shiftStarted', { shift, time: currentTime });
  }

  private completeShift(shift: Shift, currentTime: Date): void {
    const actualHours = (shift.endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60);
    
    // Update fatigue tracker
    const tracker = this.system.fatigueTracker.find(t => t.staffId === shift.staffId);
    if (tracker) {
      tracker.hoursWorked += actualHours;
      tracker.fatigueLevel = Math.min(1, tracker.fatigueLevel + (actualHours * 0.1));
    }

    // Update volunteer performance if applicable
    const volunteer = this.system.volunteers.find(v => v.id === shift.staffId);
    if (volunteer) {
      volunteer.totalHours += actualHours;
      volunteer.performanceScore = Math.min(10, volunteer.performanceScore + 0.1);
    }

    this.emit('shiftCompleted', { shift, actualHours, time: currentTime });
  }

  private monitorActiveShift(shift: Shift, currentTime: Date): void {
    const tracker = this.system.fatigueTracker.find(t => t.staffId === shift.staffId);
    if (!tracker) return;

    // Performance degradation due to fatigue
    if (tracker.fatigueLevel > 0.6) {
      const performanceLoss = tracker.fatigueLevel * 0.3;
      this.emit('fatigueImpact', { 
        shift, 
        performanceLoss, 
        fatigueLevel: tracker.fatigueLevel,
        time: currentTime 
      });
    }

    // Safety risk monitoring
    if (tracker.fatigueLevel > 0.8) {
      this.emit('safetyRisk', { 
        shift, 
        riskLevel: 'High', 
        reason: 'Extreme Fatigue',
        time: currentTime 
      });
    }
  }

  private canAutoApproveSwap(swap: ShiftSwap): boolean {
    const originalShift = this.system.shifts.find(s => s.id === swap.originalShift);
    const proposedShift = this.system.shifts.find(s => s.id === swap.proposedShift);
    
    if (!originalShift || !proposedShift) return false;

    // Check if both staff members have required skills
    // Check if swap doesn't create overtime violations
    // Check if timing allows for adequate rest
    
    return originalShift.role === proposedShift.role;
  }

  private violatesSwapRules(swap: ShiftSwap): boolean {
    // Check various swap rules
    const timeDiff = Date.now() - swap.timestamp.getTime();
    return timeDiff > 24 * 60 * 60 * 1000; // Must be requested within 24 hours
  }

  private executeShiftSwap(swap: ShiftSwap, currentTime: Date): void {
    const originalShift = this.system.shifts.find(s => s.id === swap.originalShift);
    const proposedShift = this.system.shifts.find(s => s.id === swap.proposedShift);
    
    if (originalShift && proposedShift) {
      // Swap staff assignments
      const temp = originalShift.staffId;
      originalShift.staffId = proposedShift.staffId;
      proposedShift.staffId = temp;
      
      swap.status = 'Completed';
    }
  }

  private updateFatigueLevel(tracker: FatigueTracker, currentTime: Date): void {
    const timeSinceRest = currentTime.getTime() - tracker.lastRest.getTime();
    const hoursSinceRest = timeSinceRest / (1000 * 60 * 60);

    // Fatigue increases over time without rest
    if (hoursSinceRest > 8) {
      tracker.fatigueLevel = Math.min(1, tracker.fatigueLevel + 0.05);
    }

    // Recovery during rest periods
    if (hoursSinceRest < 2 && tracker.fatigueLevel > 0) {
      tracker.fatigueLevel = Math.max(0, tracker.fatigueLevel - 0.1);
    }
  }

  private applyFatiguePenalty(tracker: FatigueTracker, currentTime: Date): void {
    const penalty: FatiguePenalty = {
      type: 'PerformanceDegrade',
      severity: tracker.fatigueLevel,
      description: `Fatigue level: ${Math.round(tracker.fatigueLevel * 100)}%`,
      applied: currentTime
    };

    tracker.penalties.push(penalty);
    this.emit('fatiguePenalty', { tracker, penalty, time: currentTime });
  }

  private enforceMandatoryRest(tracker: FatigueTracker, currentTime: Date): void {
    // Find active shift and end it
    const activeShift = this.system.shifts.find(
      s => s.staffId === tracker.staffId && s.status === 'Active'
    );

    if (activeShift) {
      activeShift.status = 'Completed';
      activeShift.endTime = currentTime;

      const penalty: FatiguePenalty = {
        type: 'MandatoryBreak',
        severity: 1,
        description: 'Extreme fatigue - mandatory rest enforced',
        applied: currentTime
      };

      tracker.penalties.push(penalty);
      tracker.lastRest = currentTime;
      
      this.emit('mandatoryRest', { tracker, shift: activeShift, time: currentTime });
    }
  }

  private updateNoShowProbability(volunteer: VolunteerProfile, currentTime: Date): void {
    // Decrease no-show probability for good performance
    if (volunteer.performanceScore > 7) {
      volunteer.noShowProbability = Math.max(0, volunteer.noShowProbability - 0.01);
    }

    // Increase for poor performance
    if (volunteer.performanceScore < 4) {
      volunteer.noShowProbability = Math.min(1, volunteer.noShowProbability + 0.02);
    }
  }

  private awardIncentive(volunteer: VolunteerProfile, currentTime: Date): void {
    const incentiveTypes: Incentive['type'][] = [
      'FreeTicket', 'Merchandise', 'Food', 'Meet&Greet', 'Certificate'
    ];
    
    const incentive: Incentive = {
      type: incentiveTypes[Math.floor(Math.random() * incentiveTypes.length)],
      value: Math.floor(Math.random() * 100) + 50,
      earned: currentTime,
      redeemed: false,
      description: `Performance reward for ${volunteer.name}`
    };

    volunteer.incentivesEarned.push(incentive);
    this.emit('incentiveAwarded', { volunteer, incentive, time: currentTime });
  }

  private checkTrainingStatus(volunteer: VolunteerProfile, currentTime: Date): void {
    for (const training of volunteer.trainingStatus) {
      if (training.expires < currentTime && training.valid) {
        training.valid = false;
        this.emit('trainingExpired', { 
          volunteer, 
          training, 
          time: currentTime 
        });

        // If required training expired, mark volunteer as unavailable
        if (training.required) {
          this.emit('volunteerUnavailable', { 
            volunteer, 
            reason: 'Training Expired',
            time: currentTime 
          });
        }
      }
    }
  }

  private handleVolunteerEvent(volunteer: VolunteerProfile, currentTime: Date): void {
    const events = [
      'Skill Improvement',
      'Motivation Boost',
      'Personal Issue',
      'Schedule Conflict',
      'Injury',
      'Recognition'
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    
    switch (event) {
      case 'Skill Improvement':
        volunteer.performanceScore = Math.min(10, volunteer.performanceScore + 0.3);
        break;
      case 'Motivation Boost':
        volunteer.noShowProbability = Math.max(0, volunteer.noShowProbability - 0.1);
        break;
      case 'Personal Issue':
        volunteer.performanceScore = Math.max(0, volunteer.performanceScore - 0.2);
        volunteer.noShowProbability = Math.min(1, volunteer.noShowProbability + 0.1);
        break;
      case 'Injury':
        volunteer.performanceScore = Math.max(0, volunteer.performanceScore - 0.5);
        volunteer.noShowProbability = 1; // Temporarily unavailable
        break;
    }

    this.emit('volunteerEvent', { volunteer, event, time: currentTime });
  }

  private findReplacementWorker(shift: Shift, currentTime: Date): string | null {
    // Look for volunteers with matching skills and availability
    const availableVolunteers = this.system.volunteers.filter(v => 
      v.skills.includes(shift.role) &&
      v.noShowProbability < 0.3 &&
      v.performanceScore > 6
    );

    if (availableVolunteers.length > 0) {
      return availableVolunteers[0].id;
    }

    return null;
  }

  private assignReplacementShift(originalShift: Shift, replacementId: string, currentTime: Date): void {
    originalShift.staffId = replacementId;
    originalShift.status = 'Scheduled';
    
    this.emit('replacementAssigned', { 
      originalShift, 
      replacementId, 
      time: currentTime 
    });
  }

  private generateInitialShifts(): Shift[] {
    const shifts: Shift[] = [];
    const departments = ['Security', 'Technical', 'Medical', 'Logistics', 'Vendor'];
    const roles = ['Supervisor', 'Operator', 'Assistant', 'Coordinator'];

    for (let i = 0; i < 50; i++) {
      const startTime = new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000);
      const duration = 6 + Math.random() * 6; // 6-12 hour shifts
      
      shifts.push({
        id: uuidv4(),
        staffId: uuidv4(),
        role: roles[Math.floor(Math.random() * roles.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        startTime,
        endTime: new Date(startTime.getTime() + duration * 60 * 60 * 1000),
        duration,
        breakTime: Math.floor(duration / 4), // 15 min break per 4 hours
        location: `Zone ${Math.floor(Math.random() * 5) + 1}`,
        status: 'Scheduled',
        overtime: false,
        rate: 15 + Math.random() * 20,
        supervisor: uuidv4()
      });
    }

    return shifts;
  }

  private createOvertimeRules(): OvertimeRule[] {
    return [
      {
        department: 'Security',
        maxHoursDaily: 8,
        maxHoursWeekly: 40,
        multiplier: 1.5,
        cooldownHours: 12,
        autoApprove: true
      },
      {
        department: 'Technical',
        maxHoursDaily: 10,
        maxHoursWeekly: 50,
        multiplier: 1.5,
        cooldownHours: 8,
        autoApprove: true
      },
      {
        department: 'Medical',
        maxHoursDaily: 12,
        maxHoursWeekly: 60,
        multiplier: 2.0,
        cooldownHours: 16,
        autoApprove: false
      }
    ];
  }

  private generateVolunteerProfiles(): VolunteerProfile[] {
    const volunteers: VolunteerProfile[] = [];
    const skills = ['Security', 'Technical', 'Customer Service', 'Setup', 'Cleanup', 'Media'];
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];

    for (let i = 0; i < 30; i++) {
      const volunteerSkills = skills.slice(0, 2 + Math.floor(Math.random() * 3));
      
      volunteers.push({
        id: uuidv4(),
        name: names[Math.floor(Math.random() * names.length)] + ` ${i + 1}`,
        skills: volunteerSkills,
        availability: this.generateAvailability(),
        noShowProbability: Math.random() * 0.3, // 0-30% no-show rate
        incentivesEarned: [],
        trainingStatus: this.generateTrainingStatus(volunteerSkills),
        performanceScore: 5 + Math.random() * 4, // 5-9 initial score
        totalHours: 0
      });
    }

    return volunteers;
  }

  private generateAvailability(): Date[] {
    const availability: Date[] = [];
    const festivalStart = this.festival.startDate;
    const festivalEnd = this.festival.endDate;
    
    let current = new Date(festivalStart);
    while (current <= festivalEnd) {
      if (Math.random() > 0.3) { // 70% availability
        availability.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    return availability;
  }

  private generateTrainingStatus(skills: string[]): TrainingRecord[] {
    return skills.map(skill => ({
      module: `${skill} Training`,
      completed: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      score: 70 + Math.random() * 30, // 70-100%
      valid: true,
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      required: Math.random() > 0.5
    }));
  }

  // Public methods for external access
  public requestShiftSwap(requesterId: string, targetId: string, originalShift: string, proposedShift: string, reason: string): string {
    const swapRequest: ShiftSwap = {
      id: uuidv4(),
      requesterId,
      targetId,
      originalShift,
      proposedShift,
      reason,
      status: 'Pending',
      approver: '',
      timestamp: new Date()
    };

    this.system.swapRequests.push(swapRequest);
    this.emit('shiftSwapRequested', { swap: swapRequest });
    
    return swapRequest.id;
  }

  public getMetrics(): any {
    const activeShifts = this.system.shifts.filter(s => s.status === 'Active').length;
    const completedShifts = this.system.shifts.filter(s => s.status === 'Completed').length;
    const noShowRate = this.system.shifts.filter(s => s.status === 'NoShow').length / this.system.shifts.length;
    const overtimeShifts = this.system.shifts.filter(s => s.overtime).length;
    const highFatigueWorkers = this.system.fatigueTracker.filter(t => t.fatigueLevel > 0.7).length;
    const availableVolunteers = this.system.volunteers.filter(v => v.noShowProbability < 0.5).length;

    return {
      activeShifts,
      completedShifts,
      noShowRate,
      overtimeShifts,
      highFatigueWorkers,
      availableVolunteers,
      totalVolunteers: this.system.volunteers.length,
      pendingSwaps: this.system.swapRequests.filter(s => s.status === 'Pending').length
    };
  }

  public getFatigueReport(): FatigueTracker[] {
    return this.system.fatigueTracker.filter(t => t.fatigueLevel > 0.5);
  }

  public getVolunteerStatus(): VolunteerProfile[] {
    return this.system.volunteers;
  }

  public getShiftSchedule(): Shift[] {
    return this.system.shifts;
  }
}