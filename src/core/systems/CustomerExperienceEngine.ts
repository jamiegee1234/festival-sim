import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { SimulationSettings, Festival, Location } from '../../types';
import { 
  CustomerExperienceSystem, WayfindingSystem, HeatResponse, SensoryFriendlyFeatures,
  InclusivityFeatures, ComplianceZone, ReentrySystem, StorageServices, Signage,
  DigitalMap, MistingFan, ShadeSail, SunscreenStall, CoolingCenter, QuietHour,
  StrobePreset, SensoryArea, ReentryPolicy, ReentryStamp, ReentryQR, AbuseDetection,
  LockerService, Locker, CloakroomService
} from '../../types/enhanced';

export class CustomerExperienceEngine extends EventEmitter {
  private system: CustomerExperienceSystem;
  private settings: SimulationSettings;
  private festival: Festival;

  constructor(festival: Festival, settings: SimulationSettings) {
    super();
    this.festival = festival;
    this.settings = settings;
    this.system = this.initializeSystem();
  }

  private initializeSystem(): CustomerExperienceSystem {
    return {
      wayfinding: this.createWayfindingSystem(),
      heatResponse: this.createHeatResponse(),
      sensoryFriendly: this.createSensoryFriendlyFeatures(),
      inclusivityFeatures: this.createInclusivityFeatures(),
      complianceZones: this.createComplianceZones(),
      reentrySystem: this.createReentrySystem(),
      storageServices: this.createStorageServices()
    };
  }

  public process(currentTime: Date): void {
    this.manageWayfinding(currentTime);
    this.handleHeatResponse(currentTime);
    this.manageSensoryFriendlyFeatures(currentTime);
    this.maintainInclusivityFeatures(currentTime);
    this.monitorComplianceZones(currentTime);
    this.processReentrySystem(currentTime);
    this.manageStorageServices(currentTime);
    this.assessCustomerSatisfaction(currentTime);
  }

  private manageWayfinding(currentTime: Date): void {
    const wayfinding = this.system.wayfinding;

    // Monitor signage effectiveness
    for (const sign of wayfinding.signage) {
      // Condition degradation over time
      if (Math.random() < 0.005) { // 0.5% chance per tick
        const conditions = ['Excellent', 'Good', 'Fair', 'Poor'];
        const currentIndex = conditions.indexOf(sign.condition);
        if (currentIndex < conditions.length - 1) {
          sign.condition = conditions[currentIndex + 1] as any;
          
          // Decrease effectiveness as condition degrades
          sign.effectiveness = Math.max(0.2, sign.effectiveness - 0.1);
          
          this.emit('signageConditionDegraded', { 
            sign,
            newCondition: sign.condition,
            effectiveness: sign.effectiveness,
            time: currentTime 
          });
        }
      }

      // Weather impact on visibility
      const weather = this.festival.weather.current;
      if (weather.precipitation > 10) { // Heavy rain
        sign.visibility = Math.max(0.3, sign.visibility * 0.8);
      } else if (weather.precipitation > 5) { // Light rain
        sign.visibility = Math.max(0.5, sign.visibility * 0.9);
      }
    }

    // Update digital maps
    for (const map of wayfinding.digitalMaps) {
      // Usage tracking
      if (Math.random() < 0.1) { // 10% chance per tick
        map.usage++;
        
        // Random satisfaction rating
        const satisfaction = Math.random() * 3 + 7; // 7-10 rating
        map.satisfaction = (map.satisfaction + satisfaction) / 2; // Running average
      }

      // Technical issues
      if (Math.random() < 0.002) { // 0.2% chance
        this.emit('digitalMapMalfunction', { 
          map,
          location: map.location,
          time: currentTime 
        });
        map.usage = 0; // Reset usage due to downtime
      }
    }

    // Calculate lost guest rate
    this.updateLostGuestRate(wayfinding, currentTime);

    // Budget optimization recommendations
    this.optimizeWayfindingBudget(wayfinding, currentTime);
  }

  private handleHeatResponse(currentTime: Date): void {
    const heatResponse = this.system.heatResponse;
    
    // Calculate heat index from weather
    const temperature = this.festival.weather.current.temperature || 25;
    const humidity = this.festival.weather.current.humidity || 50;
    
    // Simplified heat index calculation
    heatResponse.heatIndex = this.calculateHeatIndex(temperature, humidity);
    
    // Determine response level
    if (heatResponse.heatIndex > 40) {
      heatResponse.responseLevel = 'Red';
    } else if (heatResponse.heatIndex > 35) {
      heatResponse.responseLevel = 'Orange';
    } else if (heatResponse.heatIndex > 30) {
      heatResponse.responseLevel = 'Yellow';
    } else {
      heatResponse.responseLevel = 'Green';
    }

    // Activate/deactivate heat mitigation measures
    this.manageMistingFans(heatResponse.mistingFans, heatResponse.responseLevel, currentTime);
    this.deployShadeSails(heatResponse.shadeSails, heatResponse.responseLevel, currentTime);
    this.manageSunscreenStalls(heatResponse.sunscreenStalls, heatResponse.responseLevel, currentTime);
    this.operateCoolingCenters(heatResponse.coolingCenters, heatResponse.responseLevel, currentTime);

    // Heat emergency protocols
    if (heatResponse.responseLevel === 'Red') {
      this.activateHeatEmergencyProtocol(currentTime);
    }
  }

  private manageSensoryFriendlyFeatures(currentTime: Date): void {
    const sensory = this.system.sensoryFriendly;

    // Process quiet hours
    for (const quietHour of sensory.quietHours) {
      const isQuietTime = currentTime >= quietHour.startTime && currentTime <= quietHour.endTime;
      
      if (isQuietTime && !quietHour.active) {
        quietHour.active = true;
        this.activateQuietHour(quietHour, currentTime);
      } else if (!isQuietTime && quietHour.active) {
        quietHour.active = false;
        this.deactivateQuietHour(quietHour, currentTime);
      }
    }

    // Manage strobe presets
    for (const preset of sensory.lowStrobePresets) {
      // Randomly check if strobe levels are compliant
      if (Math.random() < 0.1) { // 10% chance per tick
        if (preset.intensity > 50 && preset.epilepsySafe) {
          preset.intensity = Math.min(50, preset.intensity); // Enforce safety limit
          
          this.emit('strobeIntensityAdjusted', { 
            preset,
            newIntensity: preset.intensity,
            reason: 'Epilepsy safety compliance',
            time: currentTime 
          });
        }
      }

      // Frequency monitoring
      if (preset.frequency > 3 && preset.epilepsySafe) { // >3Hz is risky
        preset.frequency = 3;
        this.emit('strobeFrequencyReduced', { 
          preset,
          newFrequency: preset.frequency,
          time: currentTime 
        });
      }
    }

    // Monitor sensory areas
    for (const area of sensory.sensoryBreakAreas) {
      // Track usage
      if (Math.random() < 0.05) { // 5% chance someone uses area
        if (area.currentOccupancy < area.capacity) {
          area.currentOccupancy++;
          area.usage++;
        } else {
          this.emit('sensoryAreaAtCapacity', { 
            area,
            time: currentTime 
          });
        }
      }

      // People leaving
      if (area.currentOccupancy > 0 && Math.random() < 0.1) {
        area.currentOccupancy--;
      }

      // Staffing requirements
      if (area.usage > 20 && !area.staffed) {
        this.emit('sensoryAreaNeedsStaff', { 
          area,
          usage: area.usage,
          time: currentTime 
        });
      }
    }

    // Overall noise level monitoring
    if (sensory.noiseLevelMonitoring) {
      this.monitorFestivalNoiseLevel(currentTime);
    }
  }

  private maintainInclusivityFeatures(currentTime: Date): void {
    for (const feature of this.system.inclusivityFeatures) {
      // Usage tracking
      if (Math.random() < 0.03) { // 3% chance per tick
        if (feature.currentOccupancy < feature.capacity) {
          feature.currentOccupancy++;
        }
      }

      // People leaving
      if (feature.currentOccupancy > 0 && Math.random() < 0.08) {
        feature.currentOccupancy--;
      }

      // Collect feedback
      if (Math.random() < 0.02) { // 2% chance
        const feedbackRating = Math.random() * 3 + 7; // 7-10 rating
        feature.rating = (feature.rating + feedbackRating) / 2; // Running average
        
        const feedbackComments = [
          'Very peaceful space',
          'Appreciated the quiet area',
          'Clean and well-maintained',
          'Could use more seating',
          'Perfect for meditation'
        ];
        
        const comment = feedbackComments[Math.floor(Math.random() * feedbackComments.length)];
        feature.feedback.push(comment);
        
        // Keep only recent feedback
        if (feature.feedback.length > 50) {
          feature.feedback = feature.feedback.slice(-50);
        }
      }

      // Maintenance needs
      if (Math.random() < 0.005) { // 0.5% chance
        this.emit('inclusivityFeatureMaintenance', { 
          feature,
          issue: 'Routine cleaning required',
          time: currentTime 
        });
      }

      // High usage recognition
      if (feature.currentOccupancy / feature.capacity > 0.8) {
        this.emit('highInclusivityUsage', { 
          feature,
          utilizationRate: feature.currentOccupancy / feature.capacity,
          time: currentTime 
        });
      }
    }
  }

  private monitorComplianceZones(currentTime: Date): void {
    for (const zone of this.system.complianceZones) {
      // Simulate zone usage
      if (Math.random() < 0.2) { // 20% chance per tick
        if (zone.currentOccupancy < zone.capacity) {
          zone.currentOccupancy++;
        } else {
          this.emit('complianceZoneAtCapacity', { 
            zone,
            time: currentTime 
          });
        }
      }

      // People leaving zones
      if (zone.currentOccupancy > 0 && Math.random() < 0.15) {
        zone.currentOccupancy--;
      }

      // Patrol monitoring
      if (Math.random() < 0.1) { // 10% chance per tick
        zone.patrols++;
        
        // Violation detection during patrol
        if (Math.random() < 0.1) { // 10% violation rate
          zone.violations++;
          const fine = this.calculateComplianceZoneFine(zone);
          zone.fines += fine;
          
          this.emit('complianceViolationDetected', { 
            zone,
            violationType: zone.type,
            fine,
            time: currentTime 
          });
        }
      }

      // Calculate compliance rate
      const totalChecks = zone.patrols;
      zone.compliance = totalChecks > 0 ? 
        1 - (zone.violations / totalChecks) : 1;

      // Poor compliance alerts
      if (zone.compliance < 0.7) {
        this.emit('poorComplianceZonePerformance', { 
          zone,
          complianceRate: zone.compliance,
          recommendedAction: 'Increase patrol frequency',
          time: currentTime 
        });
      }
    }
  }

  private processReentrySystem(currentTime: Date): void {
    const reentry = this.system.reentrySystem;

    // Process stamp-based reentries
    for (const stamp of reentry.stamps) {
      if (!stamp.used && !stamp.expired) {
        // Check for expiration (assume 8-hour validity)
        const stampAge = (currentTime.getTime() - stamp.issued.getTime()) / (1000 * 60 * 60);
        if (stampAge > 8) {
          stamp.expired = true;
        }

        // Simulate stamp usage
        if (Math.random() < 0.02) { // 2% chance per tick
          stamp.used = true;
          
          this.emit('reentryStampUsed', { 
            stamp,
            time: currentTime 
          });
          
          // Check for potential abuse
          this.checkReentryAbuse(stamp.personId, currentTime);
        }
      }
    }

    // Process QR-based reentries
    for (const qr of reentry.qrCodes) {
      if (!qr.expired && qr.uses < qr.maxUses) {
        // Check for expiration
        const qrAge = (currentTime.getTime() - qr.issued.getTime()) / (1000 * 60 * 60);
        if (qrAge > 12) { // 12-hour validity
          qr.expired = true;
        }

        // Simulate QR usage
        if (Math.random() < 0.015) { // 1.5% chance per tick
          qr.uses++;
          
          this.emit('reentryQRUsed', { 
            qr,
            remainingUses: qr.maxUses - qr.uses,
            time: currentTime 
          });
          
          // Check for maximum uses reached
          if (qr.uses >= qr.maxUses) {
            this.emit('reentryQRMaxUsesReached', { 
              qr,
              time: currentTime 
            });
          }
          
          // Check for abuse
          this.checkReentryAbuse(qr.personId, currentTime);
        }
      }
    }

    // Update abuse detection
    this.updateAbuseDetection(reentry.abuseDetection, currentTime);

    // Calculate staffing impact
    this.calculateReentryStaffingImpact(reentry, currentTime);
  }

  private manageStorageServices(currentTime: Date): void {
    const storage = this.system.storageServices;

    // Process locker operations
    this.processLockerOperations(storage.lockers, currentTime);
    
    // Process cloakroom operations
    this.processCloakroomOperations(storage.cloakroom, currentTime);
    
    // Calculate egress impact
    this.calculateEgressImpact(storage, currentTime);
  }

  private assessCustomerSatisfaction(currentTime: Date): void {
    // Collect satisfaction metrics from all systems
    const wayfindingScore = this.calculateWayfindingSatisfaction();
    const heatResponseScore = this.calculateHeatResponseSatisfaction();
    const sensoryScore = this.calculateSensorySatisfaction();
    const inclusivityScore = this.calculateInclusivitySatisfaction();
    const complianceScore = this.calculateComplianceSatisfaction();
    const reentryScore = this.calculateReentrySatisfaction();
    const storageScore = this.calculateStorageSatisfaction();

    const overallScore = (
      wayfindingScore + heatResponseScore + sensoryScore + 
      inclusivityScore + complianceScore + reentryScore + storageScore
    ) / 7;

    this.emit('customerExperienceMetrics', { 
      overall: overallScore,
      breakdown: {
        wayfinding: wayfindingScore,
        heatResponse: heatResponseScore,
        sensoryFriendly: sensoryScore,
        inclusivity: inclusivityScore,
        compliance: complianceScore,
        reentry: reentryScore,
        storage: storageScore
      },
      time: currentTime 
    });

    // Alerts for poor performance
    if (overallScore < 6) {
      this.emit('poorCustomerExperience', { 
        score: overallScore,
        criticalAreas: this.identifyCriticalAreas(),
        time: currentTime 
      });
    }
  }

  // Helper methods
  private updateLostGuestRate(wayfinding: WayfindingSystem, currentTime: Date): void {
    // Calculate effectiveness of signage
    const totalEffectiveness = wayfinding.signage.reduce(
      (sum, sign) => sum + (sign.effectiveness * sign.visibility), 0
    );
    const averageEffectiveness = totalEffectiveness / wayfinding.signage.length;

    // Digital map contribution
    const digitalMapContribution = wayfinding.digitalMaps.length * 0.1; // 10% per map

    // Calculate lost guest rate (inverse relationship with effectiveness)
    wayfinding.lostGuestRate = Math.max(0.01, 0.15 - (averageEffectiveness + digitalMapContribution));

    if (wayfinding.lostGuestRate > 0.1) { // >10% lost guest rate
      this.emit('highLostGuestRate', { 
        rate: wayfinding.lostGuestRate,
        averageSignageEffectiveness: averageEffectiveness,
        recommendations: [
          'Add more directional signage',
          'Improve existing signage visibility',
          'Deploy additional digital maps',
          'Increase staff directional assistance'
        ],
        time: currentTime 
      });
    }
  }

  private optimizeWayfindingBudget(wayfinding: WayfindingSystem, currentTime: Date): void {
    const costPerSign = wayfinding.budget / wayfinding.signage.length;
    const efficiencyScore = wayfinding.lostGuestRate * costPerSign; // Lower is better

    if (efficiencyScore > 500) { // Poor efficiency threshold
      this.emit('wayfindingBudgetOptimization', { 
        currentBudget: wayfinding.budget,
        costPerSign,
        lostGuestRate: wayfinding.lostGuestRate,
        recommendations: [
          'Replace low-effectiveness signage',
          'Focus budget on high-traffic areas',
          'Consider digital signage ROI',
          'Implement wayfinding mobile app'
        ],
        time: currentTime 
      });
    }
  }

  private calculateHeatIndex(temperature: number, humidity: number): number {
    // Simplified heat index calculation
    if (temperature < 27) return temperature;
    
    const T = temperature;
    const R = humidity;
    
    // Heat index formula (simplified)
    const HI = -42.379 + 2.04901523 * T + 10.14333127 * R - 0.22475541 * T * R - 
               0.00683783 * T * T - 0.05481717 * R * R + 0.00122874 * T * T * R + 
               0.00085282 * T * R * R - 0.00000199 * T * T * R * R;
    
    return Math.max(T, HI);
  }

  private manageMistingFans(fans: MistingFan[], responseLevel: string, currentTime: Date): void {
    const shouldActivate = responseLevel === 'Orange' || responseLevel === 'Red';

    for (const fan of fans) {
      if (shouldActivate && !fan.active) {
        fan.active = true;
        fan.waterUsage = Math.random() * 20 + 10; // 10-30 L/hour
        fan.powerDraw = Math.random() * 3 + 2; // 2-5 kW
        fan.effectiveness = Math.random() * 0.3 + 0.7; // 70-100% effectiveness
        
        this.emit('mistingFanActivated', { 
          fan,
          heatLevel: responseLevel,
          time: currentTime 
        });
      } else if (!shouldActivate && fan.active) {
        fan.active = false;
        fan.waterUsage = 0;
        fan.powerDraw = 0;
        
        this.emit('mistingFanDeactivated', { 
          fan,
          time: currentTime 
        });
      }

      // Monitor resource usage
      if (fan.active && fan.waterUsage > 25) {
        this.emit('highMistingWaterUsage', { 
          fan,
          usage: fan.waterUsage,
          time: currentTime 
        });
      }
    }
  }

  private deployShadeSails(sails: ShadeSail[], responseLevel: string, currentTime: Date): void {
    const shouldDeploy = responseLevel !== 'Green';

    for (const sail of sails) {
      if (shouldDeploy && !sail.deployed) {
        // Check wind conditions
        const windSpeed = this.festival.weather.current.windSpeed || 5;
        
        if (windSpeed <= sail.windRating) {
          sail.deployed = true;
          
          this.emit('shadeSailDeployed', { 
            sail,
            windSpeed,
            coverage: sail.coverage,
            time: currentTime 
          });
        } else {
          this.emit('shadeSailWindRestriction', { 
            sail,
            windSpeed,
            maxWindRating: sail.windRating,
            time: currentTime 
          });
        }
      } else if (responseLevel === 'Green' && sail.deployed) {
        sail.deployed = false;
        
        this.emit('shadeSailRetracted', { 
          sail,
          time: currentTime 
        });
      }
    }
  }

  private manageSunscreenStalls(stalls: SunscreenStall[], responseLevel: string, currentTime: Date): void {
    for (const stall of stalls) {
      // Increase usage during high heat
      if (responseLevel === 'Orange' || responseLevel === 'Red') {
        if (Math.random() < 0.3) { // 30% chance per tick
          const usage = Math.floor(Math.random() * 5) + 1; // 1-5 uses
          if (stall.stock >= usage) {
            stall.stock -= usage;
            stall.dispensed += usage;
            stall.popularity = Math.min(1, stall.popularity + 0.05);
          } else {
            this.emit('sunscreenStallEmpty', { 
              stall,
              time: currentTime 
            });
            stall.popularity = Math.max(0, stall.popularity - 0.1); // Reduce popularity when empty
          }
        }
      }

      // Restocking
      if (stall.stock < 10 && Math.random() < 0.1) { // 10% chance to restock
        const restockAmount = 50;
        stall.stock += restockAmount;
        stall.cost += restockAmount * 2; // $2 per unit
        
        this.emit('sunscreenStallRestocked', { 
          stall,
          amount: restockAmount,
          time: currentTime 
        });
      }
    }
  }

  private operateCoolingCenters(centers: CoolingCenter[], responseLevel: string, currentTime: Date): void {
    for (const center of centers) {
      if (responseLevel === 'Red' || responseLevel === 'Orange') {
        // Increase usage during high heat
        if (Math.random() < 0.2) { // 20% chance per tick
          if (center.currentOccupancy < center.capacity) {
            center.currentOccupancy++;
          } else {
            this.emit('coolingCenterAtCapacity', { 
              center,
              time: currentTime 
            });
          }
        }
      }

      // People leaving
      if (center.currentOccupancy > 0 && Math.random() < 0.1) {
        center.currentOccupancy--;
      }

      // Medical support activation
      if (center.medicalSupport && center.currentOccupancy > center.capacity * 0.8) {
        this.emit('coolingCenterMedicalAlert', { 
          center,
          occupancyRate: center.currentOccupancy / center.capacity,
          time: currentTime 
        });
      }
    }
  }

  private activateHeatEmergencyProtocol(currentTime: Date): void {
    this.emit('heatEmergencyActivated', { 
      level: 'Critical',
      actions: [
        'Activate all misting systems',
        'Deploy emergency shade structures',
        'Open all cooling centers',
        'Increase medical staff alerts',
        'Consider event modifications'
      ],
      time: currentTime 
    });
  }

  private activateQuietHour(quietHour: QuietHour, currentTime: Date): void {
    // Apply volume and strobe restrictions
    for (const stageId of quietHour.stages) {
      this.emit('stageVolumeRestricted', { 
        stageId,
        maxVolume: quietHour.volumeLimit,
        strobeRestricted: quietHour.strobeRestriction,
        time: currentTime 
      });
    }

    this.emit('quietHourActivated', { 
      quietHour,
      affectedStages: quietHour.stages.length,
      time: currentTime 
    });
  }

  private deactivateQuietHour(quietHour: QuietHour, currentTime: Date): void {
    // Remove restrictions
    for (const stageId of quietHour.stages) {
      this.emit('stageVolumeRestored', { 
        stageId,
        time: currentTime 
      });
    }

    this.emit('quietHourDeactivated', { 
      quietHour,
      time: currentTime 
    });
  }

  private monitorFestivalNoiseLevel(currentTime: Date): void {
    // Simulate overall festival noise monitoring
    const baseNoiseLevel = 75; // 75dB base
    const crowdFactor = this.festival.currentAttendees / this.festival.capacity;
    const currentLevel = baseNoiseLevel + (crowdFactor * 15); // Up to +15dB

    if (currentLevel > 85) { // High noise threshold
      this.emit('highFestivalNoiseLevel', { 
        currentLevel,
        threshold: 85,
        crowdFactor,
        recommendation: 'Consider noise reduction measures',
        time: currentTime 
      });
    }
  }

  private calculateComplianceZoneFine(zone: ComplianceZone): number {
    const fineAmounts: Record<string, number> = {
      'Smoking': 100,
      'Vaping': 75,
      'Alcohol': 200,
      'Food': 50
    };

    return fineAmounts[zone.type] || 100;
  }

  private checkReentryAbuse(personId: string, currentTime: Date): void {
    const recentEntries = [
      ...this.system.reentrySystem.stamps.filter(s => s.personId === personId && s.used),
      ...this.system.reentrySystem.qrCodes.filter(q => q.personId === personId && q.uses > 0)
    ].filter(entry => {
      const entryTime = 'issued' in entry ? entry.issued : entry.issued;
      return (currentTime.getTime() - entryTime.getTime()) < 4 * 60 * 60 * 1000; // Last 4 hours
    });

    if (recentEntries.length > 5) { // More than 5 entries in 4 hours
      this.system.reentrySystem.abuseDetection.flaggedIndividuals.push(personId);
      this.system.reentrySystem.abuseDetection.preventedAbuse++;
      
      this.emit('reentryAbuseDetected', { 
        personId,
        entriesCount: recentEntries.length,
        timeWindow: '4 hours',
        action: 'Flagged for review',
        time: currentTime 
      });
    }
  }

  private updateAbuseDetection(detection: AbuseDetection, currentTime: Date): void {
    // Update multiple entries tracking
    const recentStamps = this.system.reentrySystem.stamps.filter(
      s => s.used && (currentTime.getTime() - s.issued.getTime()) < 60 * 60 * 1000 // Last hour
    );
    detection.multipleEntries = recentStamps.length;

    // Suspicious activity patterns
    if (detection.multipleEntries > 20) { // >20 entries per hour
      detection.suspiciousActivity.push(`High entry volume: ${detection.multipleEntries}/hour`);
      
      // Keep only recent suspicious activities
      if (detection.suspiciousActivity.length > 10) {
        detection.suspiciousActivity = detection.suspiciousActivity.slice(-10);
      }
    }
  }

  private calculateReentryStaffingImpact(reentry: ReentrySystem, currentTime: Date): void {
    const activeStamps = reentry.stamps.filter(s => !s.used && !s.expired).length;
    const activeQRs = reentry.qrCodes.filter(q => !q.expired && q.uses < q.maxUses).length;
    
    const totalActiveReentries = activeStamps + activeQRs;
    const staffingMultiplier = Math.ceil(totalActiveReentries / 100); // 1 staff per 100 active reentries

    if (staffingMultiplier > 3) { // More than 3 staff needed
      this.emit('highReentryStaffingDemand', { 
        activeReentries: totalActiveReentries,
        recommendedStaff: staffingMultiplier,
        currentLoad: 'High',
        time: currentTime 
      });
    }
  }

  private processLockerOperations(lockers: LockerService, currentTime: Date): void {
    // Simulate locker usage
    if (Math.random() < 0.1) { // 10% chance per tick
      const availableLockers = lockers.lockers.filter(l => !l.occupied);
      if (availableLockers.length > 0) {
        const locker = availableLockers[Math.floor(Math.random() * availableLockers.length)];
        locker.occupied = true;
        lockers.occupancy++;
        lockers.revenue += locker.rental;
        
        this.emit('lockerRented', { 
          locker,
          revenue: locker.rental,
          occupancyRate: lockers.occupancy / lockers.totalCapacity,
          time: currentTime 
        });
      } else {
        lockers.overloaded = true;
        this.emit('lockersAtCapacity', { 
          totalCapacity: lockers.totalCapacity,
          time: currentTime 
        });
      }
    }

    // Simulate locker returns
    if (lockers.occupancy > 0 && Math.random() < 0.05) { // 5% chance per tick
      const occupiedLockers = lockers.lockers.filter(l => l.occupied);
      if (occupiedLockers.length > 0) {
        const locker = occupiedLockers[Math.floor(Math.random() * occupiedLockers.length)];
        locker.occupied = false;
        lockers.occupancy--;
        lockers.overloaded = false;
      }
    }

    // Revenue tracking and pricing optimization
    if (lockers.occupancy / lockers.totalCapacity > 0.9) { // >90% utilization
      this.emit('highLockerDemand', { 
        occupancyRate: lockers.occupancy / lockers.totalCapacity,
        recommendation: 'Consider dynamic pricing',
        time: currentTime 
      });
    }
  }

  private processCloakroomOperations(cloakroom: CloakroomService, currentTime: Date): void {
    // Simulate item deposits
    if (Math.random() < 0.15) { // 15% chance per tick
      if (cloakroom.currentItems < cloakroom.capacity) {
        cloakroom.currentItems++;
        cloakroom.revenue += 5; // $5 per item
        cloakroom.queueLength = Math.max(0, cloakroom.queueLength + Math.floor(Math.random() * 3));
        
        this.emit('cloakroomDeposit', { 
          currentItems: cloakroom.currentItems,
          revenue: cloakroom.revenue,
          queueLength: cloakroom.queueLength,
          time: currentTime 
        });
      } else {
        cloakroom.overloaded = true;
        this.emit('cloakroomAtCapacity', { 
          capacity: cloakroom.capacity,
          time: currentTime 
        });
      }
    }

    // Simulate item retrievals
    if (cloakroom.currentItems > 0 && Math.random() < 0.08) { // 8% chance per tick
      cloakroom.currentItems--;
      const retrievalTime = Math.random() * 3 + 1; // 1-4 minutes
      cloakroom.averageRetrievalTime = (cloakroom.averageRetrievalTime + retrievalTime) / 2;
      
      if (cloakroom.queueLength > 0) {
        cloakroom.queueLength--;
      }
      cloakroom.overloaded = false;
      
      this.emit('cloakroomRetrieval', { 
        retrievalTime,
        averageTime: cloakroom.averageRetrievalTime,
        time: currentTime 
      });
    }

    // Staffing adequacy
    const requiredStaff = Math.ceil(cloakroom.currentItems / 100); // 1 staff per 100 items
    if (cloakroom.currentStaff < requiredStaff) {
      this.emit('cloakroomUnderStaffed', { 
        currentStaff: cloakroom.currentStaff,
        requiredStaff,
        currentItems: cloakroom.currentItems,
        time: currentTime 
      });
    }

    // Long queue alerts
    if (cloakroom.queueLength > 20) {
      this.emit('longCloakroomQueue', { 
        queueLength: cloakroom.queueLength,
        averageRetrievalTime: cloakroom.averageRetrievalTime,
        recommendation: 'Add temporary staff',
        time: currentTime 
      });
    }
  }

  private calculateEgressImpact(storage: StorageServices, currentTime: Date): void {
    // Calculate impact of storage services on egress
    const lockerImpact = storage.lockers.overloaded ? 0.2 : 0;
    const cloakroomImpact = storage.cloakroom.overloaded ? 0.3 : 0;
    const queueImpact = storage.cloakroom.queueLength > 15 ? 0.1 : 0;

    storage.egressImpact = lockerImpact + cloakroomImpact + queueImpact;

    if (storage.egressImpact > 0.3) { // >30% impact
      this.emit('storageEgressImpact', { 
        impact: storage.egressImpact,
        causes: {
          lockersOverloaded: storage.lockers.overloaded,
          cloakroomOverloaded: storage.cloakroom.overloaded,
          longQueues: storage.cloakroom.queueLength > 15
        },
        recommendations: [
          'Implement express retrieval for small items',
          'Add temporary storage capacity',
          'Increase staffing during peak times'
        ],
        time: currentTime 
      });
    }
  }

  // Satisfaction calculation methods
  private calculateWayfindingSatisfaction(): number {
    const avgEffectiveness = this.system.wayfinding.signage.reduce(
      (sum, sign) => sum + sign.effectiveness, 0
    ) / this.system.wayfinding.signage.length;
    
    const digitalMapSatisfaction = this.system.wayfinding.digitalMaps.reduce(
      (sum, map) => sum + map.satisfaction, 0
    ) / Math.max(1, this.system.wayfinding.digitalMaps.length);
    
    return Math.min(10, (avgEffectiveness * 5) + (digitalMapSatisfaction * 0.5) + (1 - this.system.wayfinding.lostGuestRate) * 5);
  }

  private calculateHeatResponseSatisfaction(): number {
    const response = this.system.heatResponse;
    let score = 8; // Base score
    
    if (response.responseLevel === 'Red' || response.responseLevel === 'Orange') {
      const activeMisting = response.mistingFans.filter(f => f.active).length;
      const deployedSails = response.shadeSails.filter(s => s.deployed).length;
      const activeCooling = response.coolingCenters.filter(c => c.currentOccupancy > 0).length;
      
      score += (activeMisting + deployedSails + activeCooling) * 0.5;
    }
    
    return Math.min(10, score);
  }

  private calculateSensorySatisfaction(): number {
    const activeQuietHours = this.system.sensoryFriendly.quietHours.filter(q => q.active).length;
    const avgAreaUsage = this.system.sensoryFriendly.sensoryBreakAreas.reduce(
      (sum, area) => sum + area.usage, 0
    ) / Math.max(1, this.system.sensoryFriendly.sensoryBreakAreas.length);
    
    return Math.min(10, 7 + (activeQuietHours * 0.5) + Math.min(3, avgAreaUsage / 10));
  }

  private calculateInclusivitySatisfaction(): number {
    const avgRating = this.system.inclusivityFeatures.reduce(
      (sum, feature) => sum + feature.rating, 0
    ) / Math.max(1, this.system.inclusivityFeatures.length);
    
    return avgRating;
  }

  private calculateComplianceSatisfaction(): number {
    const avgCompliance = this.system.complianceZones.reduce(
      (sum, zone) => sum + zone.compliance, 0
    ) / Math.max(1, this.system.complianceZones.length);
    
    return avgCompliance * 10;
  }

  private calculateReentrySatisfaction(): number {
    const detection = this.system.reentrySystem.abuseDetection;
    const abuseRate = detection.flaggedIndividuals.length / Math.max(1, 
      this.system.reentrySystem.stamps.length + this.system.reentrySystem.qrCodes.length
    );
    
    return Math.min(10, 10 - (abuseRate * 20)); // Penalty for high abuse
  }

  private calculateStorageSatisfaction(): number {
    const storage = this.system.storageServices;
    let score = 8; // Base score
    
    if (storage.lockers.overloaded) score -= 1;
    if (storage.cloakroom.overloaded) score -= 2;
    if (storage.cloakroom.queueLength > 15) score -= 1;
    if (storage.egressImpact > 0.3) score -= 2;
    
    return Math.max(0, score);
  }

  private identifyCriticalAreas(): string[] {
    const critical: string[] = [];
    
    if (this.calculateWayfindingSatisfaction() < 5) critical.push('Wayfinding');
    if (this.calculateHeatResponseSatisfaction() < 5) critical.push('Heat Response');
    if (this.calculateSensorySatisfaction() < 5) critical.push('Sensory Friendly');
    if (this.calculateInclusivitySatisfaction() < 5) critical.push('Inclusivity');
    if (this.calculateComplianceSatisfaction() < 5) critical.push('Compliance');
    if (this.calculateReentrySatisfaction() < 5) critical.push('Re-entry');
    if (this.calculateStorageSatisfaction() < 5) critical.push('Storage');
    
    return critical;
  }

  // Initialize helper methods
  private createWayfindingSystem(): WayfindingSystem {
    const signage: Signage[] = [];
    const digitalMaps: DigitalMap[] = [];
    
    // Create various signage types
    const signageTypes: Signage['type'][] = ['Directional', 'Informational', 'Safety', 'Digital'];
    
    for (let i = 0; i < 25; i++) {
      signage.push({
        id: `sign_${i}`,
        location: { x: Math.random() * 500, y: Math.random() * 500, zone: `Area ${i + 1}` },
        type: signageTypes[Math.floor(Math.random() * signageTypes.length)],
        visibility: Math.random() * 0.3 + 0.7, // 70-100%
        effectiveness: Math.random() * 0.4 + 0.6, // 60-100%
        condition: 'Good',
        cost: Math.random() * 200 + 100 // $100-300
      });
    }

    // Create digital maps
    for (let i = 0; i < 6; i++) {
      digitalMaps.push({
        id: `map_${i}`,
        location: { x: Math.random() * 500, y: Math.random() * 500, zone: `Hub ${i + 1}` },
        interactive: Math.random() > 0.3, // 70% interactive
        accessibility: Math.random() > 0.2, // 80% accessible
        usage: Math.floor(Math.random() * 100),
        satisfaction: Math.random() * 2 + 8 // 8-10 rating
      });
    }

    return {
      signage,
      budget: 15000, // $15k signage budget
      lostGuestRate: 0.05, // 5% initial rate
      digitalMaps,
      staffDirections: 0
    };
  }

  private createHeatResponse(): HeatResponse {
    const mistingFans: MistingFan[] = [];
    const shadeSails: ShadeSail[] = [];
    const sunscreenStalls: SunscreenStall[] = [];
    const coolingCenters: CoolingCenter[] = [];

    // Create misting fans
    for (let i = 0; i < 8; i++) {
      mistingFans.push({
        id: `misting_${i}`,
        location: { x: Math.random() * 500, y: Math.random() * 500, zone: `Fan Zone ${i + 1}` },
        active: false,
        waterUsage: 0,
        powerDraw: 0,
        coverage: Math.random() * 20 + 30, // 30-50m coverage
        effectiveness: 0.8
      });
    }

    // Create shade sails
    for (let i = 0; i < 12; i++) {
      shadeSails.push({
        id: `sail_${i}`,
        location: { x: Math.random() * 500, y: Math.random() * 500, zone: `Shade ${i + 1}` },
        size: Math.random() * 50 + 100, // 100-150 sqm
        coverage: Math.random() * 80 + 120, // 120-200 people
        deployed: false,
        windRating: Math.random() * 10 + 15, // 15-25 m/s wind rating
        cost: Math.random() * 2000 + 1000 // $1k-3k
      });
    }

    // Create sunscreen stations
    for (let i = 0; i < 6; i++) {
      sunscreenStalls.push({
        id: `sunscreen_${i}`,
        location: { x: Math.random() * 500, y: Math.random() * 500, zone: `Station ${i + 1}` },
        stock: Math.floor(Math.random() * 50) + 50, // 50-100 units
        dispensed: 0,
        cost: 0,
        popularity: Math.random() * 0.5 + 0.5 // 50-100%
      });
    }

    // Create cooling centers
    for (let i = 0; i < 4; i++) {
      coolingCenters.push({
        id: `cooling_${i}`,
        location: { x: Math.random() * 500, y: Math.random() * 500, zone: `Cool ${i + 1}` },
        capacity: Math.floor(Math.random() * 30) + 20, // 20-50 people
        currentOccupancy: 0,
        airConditioning: Math.random() > 0.3, // 70% have AC
        waterStation: true,
        medicalSupport: Math.random() > 0.5 // 50% have medical
      });
    }

    return {
      heatIndex: 25,
      responseLevel: 'Green',
      mistingFans,
      shadeSails,
      sunscreenStalls,
      coolingCenters
    };
  }

  private createSensoryFriendlyFeatures(): SensoryFriendlyFeatures {
    const quietHours: QuietHour[] = [];
    const lowStrobePresets: StrobePreset[] = [];
    const sensoryBreakAreas: SensoryArea[] = [];

    // Create quiet hours schedule
    for (let i = 0; i < 3; i++) {
      const startHour = 14 + (i * 2); // 2PM, 4PM, 6PM
      quietHours.push({
        startTime: new Date(Date.now() + startHour * 60 * 60 * 1000),
        endTime: new Date(Date.now() + (startHour + 1) * 60 * 60 * 1000),
        stages: [`Stage ${i + 1}`],
        volumeLimit: 80, // 80dB limit
        strobeRestriction: true,
        active: false
      });
    }

    // Create strobe presets
    const stages = ['Main Stage', 'Second Stage', 'Third Stage'];
    for (const stage of stages) {
      lowStrobePresets.push({
        stageId: stage,
        preset: 'Low Strobe Safe',
        intensity: Math.random() * 30 + 20, // 20-50%
        frequency: Math.random() * 2 + 1, // 1-3 Hz
        duration: Math.random() * 5 + 2, // 2-7 seconds
        epilepsySafe: true
      });
    }

    // Create sensory break areas
    for (let i = 0; i < 4; i++) {
      sensoryBreakAreas.push({
        id: `sensory_${i}`,
        location: { x: Math.random() * 500, y: Math.random() * 500, zone: `Quiet ${i + 1}` },
        capacity: Math.floor(Math.random() * 15) + 10, // 10-25 people
        currentOccupancy: 0,
        features: ['Quiet', 'Dim lighting', 'Comfortable seating', 'Noise barriers'],
        staffed: Math.random() > 0.5, // 50% staffed
        usage: 0
      });
    }

    return {
      quietHours,
      lowStrobePresets,
      sensoryBreakAreas,
      noiseLevelMonitoring: true
    };
  }

  private createInclusivityFeatures(): InclusivityFeatures[] {
    const features: InclusivityFeatures[] = [];
    const types: InclusivityFeatures['type'][] = ['Prayer', 'Reflection', 'Meditation', 'Nursing', 'Quiet'];

    for (let i = 0; i < types.length; i++) {
      features.push({
        type: types[i],
        location: { x: Math.random() * 500, y: Math.random() * 500, zone: `${types[i]} Area` },
        capacity: Math.floor(Math.random() * 20) + 10, // 10-30 people
        currentOccupancy: 0,
        amenities: this.getAmenitiesForType(types[i]),
        rating: Math.random() * 2 + 8, // 8-10 rating
        feedback: []
      });
    }

    return features;
  }

  private getAmenitiesForType(type: string): string[] {
    const amenities: Record<string, string[]> = {
      'Prayer': ['Quiet space', 'Prayer mats', 'Qibla direction', 'Wash facilities'],
      'Reflection': ['Comfortable seating', 'Dim lighting', 'Natural elements'],
      'Meditation': ['Cushions', 'Calming sounds', 'Aromatherapy', 'Guidance materials'],
      'Nursing': ['Private booths', 'Comfortable chairs', 'Changing facilities', 'Hand sanitizer'],
      'Quiet': ['Sound barriers', 'Comfortable seating', 'Reading materials', 'Soft lighting']
    };

    return amenities[type] || ['Basic amenities'];
  }

  private createComplianceZones(): ComplianceZone[] {
    const zones: ComplianceZone[] = [];
    const types: ComplianceZone['type'][] = ['Smoking', 'Vaping', 'Alcohol', 'Food'];

    for (const type of types) {
      for (let i = 0; i < 3; i++) { // 3 zones per type
        zones.push({
          id: `${type.toLowerCase()}_${i}`,
          type,
          location: { x: Math.random() * 500, y: Math.random() * 500, zone: `${type} Zone ${i + 1}` },
          capacity: Math.floor(Math.random() * 30) + 20, // 20-50 people
          currentOccupancy: 0,
          patrols: 0,
          violations: 0,
          fines: 0,
          compliance: 1
        });
      }
    }

    return zones;
  }

  private createReentrySystem(): ReentrySystem {
    return {
      policy: {
        allowed: true,
        timeRestrictions: ['No re-entry after 10 PM'],
        limitations: 3, // Max 3 re-entries
        verification: 'QR'
      },
      stamps: [],
      qrCodes: [],
      abuseDetection: {
        multipleEntries: 0,
        suspiciousActivity: [],
        flaggedIndividuals: [],
        preventedAbuse: 0
      },
      staffingImpact: 0
    };
  }

  private createStorageServices(): StorageServices {
    const lockers: Locker[] = [];
    
    // Create lockers of different sizes
    const sizes: Locker['size'][] = ['Small', 'Medium', 'Large'];
    for (let i = 0; i < 150; i++) {
      const size = sizes[i % sizes.length];
      const rentalRates = { 'Small': 10, 'Medium': 15, 'Large': 20 };
      
      lockers.push({
        id: `locker_${i}`,
        size,
        occupied: false,
        rental: rentalRates[size],
        keyType: ['Physical', 'Digital', 'RFID'][Math.floor(Math.random() * 3)] as any,
        location: { x: Math.random() * 100, y: Math.random() * 100, zone: 'Locker Area' }
      });
    }

    return {
      lockers: {
        lockers,
        totalCapacity: lockers.length,
        occupancy: 0,
        revenue: 0,
        overloaded: false
      },
      cloakroom: {
        capacity: 500,
        currentItems: 0,
        staffRequired: 3,
        currentStaff: 2,
        averageRetrievalTime: 2.5,
        queueLength: 0,
        overloaded: false,
        revenue: 0
      },
      egressImpact: 0
    };
  }

  // Public methods for external access
  public getMetrics(): any {
    return {
      customerSatisfaction: {
        overall: (
          this.calculateWayfindingSatisfaction() +
          this.calculateHeatResponseSatisfaction() +
          this.calculateSensorySatisfaction() +
          this.calculateInclusivitySatisfaction() +
          this.calculateComplianceSatisfaction() +
          this.calculateReentrySatisfaction() +
          this.calculateStorageSatisfaction()
        ) / 7,
        breakdown: {
          wayfinding: this.calculateWayfindingSatisfaction(),
          heatResponse: this.calculateHeatResponseSatisfaction(),
          sensoryFriendly: this.calculateSensorySatisfaction(),
          inclusivity: this.calculateInclusivitySatisfaction(),
          compliance: this.calculateComplianceSatisfaction(),
          reentry: this.calculateReentrySatisfaction(),
          storage: this.calculateStorageSatisfaction()
        }
      },
      operational: {
        lostGuestRate: this.system.wayfinding.lostGuestRate,
        heatResponseLevel: this.system.heatResponse.responseLevel,
        activeQuietHours: this.system.sensoryFriendly.quietHours.filter(q => q.active).length,
        complianceViolations: this.system.complianceZones.reduce((sum, zone) => sum + zone.violations, 0),
        reentryAbuse: this.system.reentrySystem.abuseDetection.flaggedIndividuals.length,
        storageUtilization: this.system.storageServices.lockers.occupancy / this.system.storageServices.lockers.totalCapacity
      },
      financial: {
        wayfindingBudget: this.system.wayfinding.budget,
        complianceFines: this.system.complianceZones.reduce((sum, zone) => sum + zone.fines, 0),
        storageRevenue: this.system.storageServices.lockers.revenue + this.system.storageServices.cloakroom.revenue,
        heatResponseCosts: this.system.heatResponse.mistingFans.reduce((sum, fan) => sum + (fan.waterUsage * 0.003), 0)
      }
    };
  }

  public getWayfindingStatus(): WayfindingSystem {
    return this.system.wayfinding;
  }

  public getHeatResponseStatus(): HeatResponse {
    return this.system.heatResponse;
  }

  public getAccessibilityStatus(): any {
    return {
      sensoryFriendly: this.system.sensoryFriendly,
      inclusivity: this.system.inclusivityFeatures,
      compliance: this.system.complianceZones
    };
  }

  public getStorageStatus(): StorageServices {
    return this.system.storageServices;
  }

  public getReentryStatus(): ReentrySystem {
    return this.system.reentrySystem;
  }

  public issueReentryStamp(personId: string): string {
    const stamp: ReentryStamp = {
      id: uuidv4(),
      issued: new Date(),
      personId,
      location: 'Main Gate',
      used: false,
      expired: false
    };

    this.system.reentrySystem.stamps.push(stamp);
    return stamp.id;
  }

  public issueReentryQR(personId: string, maxUses: number = 3): string {
    const qrCode: ReentryQR = {
      id: uuidv4(),
      qrCode: `QR_${uuidv4()}`,
      issued: new Date(),
      personId,
      uses: 0,
      maxUses,
      expired: false
    };

    this.system.reentrySystem.qrCodes.push(qrCode);
    return qrCode.qrCode;
  }
}