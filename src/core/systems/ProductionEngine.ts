import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { SimulationSettings, Festival, Artist } from '../../types';
import { 
  ProductionSystem, VisaCheck, BacklineMatrix, ShowfileConverter, IEMSystem,
  SetlistVariance, DelayModel, GuestAppearanceFlow, DJCrossfadeWindow,
  BacklineSubstitution, BacklineAvailability, QualityImpact, ShowfileConversion,
  ConversionSuccess, IEMFrequency, IEMSparePool, MonitorMix, CascadeEffect
} from '../../types/enhanced';

export class ProductionEngine extends EventEmitter {
  private system: ProductionSystem;
  private settings: SimulationSettings;
  private festival: Festival;

  constructor(festival: Festival, settings: SimulationSettings) {
    super();
    this.festival = festival;
    this.settings = settings;
    this.system = this.initializeSystem();
  }

  private initializeSystem(): ProductionSystem {
    return {
      visaChecks: this.generateVisaChecks(),
      backlineSubstitution: this.createBacklineMatrix(),
      showfileConverter: this.createShowfileConverter(),
      iemSystem: this.createIEMSystem(),
      setlistVariance: this.generateSetlistVariance(),
      cascadingDelays: this.createDelayModel(),
      guestAppearances: [],
      djCrossfade: this.generateDJCrossfades()
    };
  }

  public process(currentTime: Date): void {
    this.processVisaChecks(currentTime);
    this.manageBacklineSubstitutions(currentTime);
    this.handleShowfileConversions(currentTime);
    this.manageIEMSystem(currentTime);
    this.trackSetlistVariances(currentTime);
    this.processCascadingDelays(currentTime);
    this.handleGuestAppearances(currentTime);
    this.manageDJCrossfades(currentTime);
    this.assessProductionReadiness(currentTime);
  }

  private processVisaChecks(currentTime: Date): void {
    for (const visaCheck of this.system.visaChecks) {
      if (!visaCheck.required) continue;

      // Check visa status progression
      if (visaCheck.status === 'Applied') {
        const processingTime = currentTime.getTime() - visaCheck.applicationDate.getTime();
        const processingDays = processingTime / (1000 * 60 * 60 * 24);

        // Visa processing typically takes time
        if (processingDays >= visaCheck.leadTime) {
          const approvalChance = this.calculateApprovalChance(visaCheck);
          
          if (Math.random() < approvalChance) {
            visaCheck.status = 'Approved';
            visaCheck.approvalDate = currentTime;
            visaCheck.expiryDate = new Date(currentTime.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
            visaCheck.riskLevel = 'Low';
            
            this.emit('visaApproved', { visaCheck, time: currentTime });
          } else if (Math.random() < 0.1) { // 10% denial rate
            visaCheck.status = 'Denied';
            visaCheck.riskLevel = 'Critical';
            
            this.handleVisaDenial(visaCheck, currentTime);
          }
        }

        // Check for processing delays
        if (processingDays > visaCheck.leadTime * 1.2) {
          visaCheck.riskLevel = 'High';
          this.emit('visaDelayed', { visaCheck, delayDays: processingDays - visaCheck.leadTime, time: currentTime });
        }
      }

      // Check for visa expiry
      if (visaCheck.status === 'Approved' && visaCheck.expiryDate < currentTime) {
        visaCheck.status = 'Expired';
        visaCheck.riskLevel = 'Critical';
        
        this.emit('visaExpired', { visaCheck, time: currentTime });
      }

      // Update risk levels based on timing
      this.updateVisaRiskLevel(visaCheck, currentTime);
    }
  }

  private manageBacklineSubstitutions(currentTime: Date): void {
    const matrix = this.system.backlineSubstitution;

    // Update availability based on bookings and maintenance
    for (const availability of matrix.availability) {
      // Random equipment unavailability
      if (Math.random() < 0.02) { // 2% chance per tick
        availability.available = Math.max(0, availability.available - 1);
        availability.reserved = Math.min(availability.quantity, availability.reserved + 1);
        
        if (availability.available === 0) {
          this.emit('equipmentUnavailable', { 
            equipment: availability.equipment,
            time: currentTime 
          });
          
          // Find substitutions
          this.findEquipmentSubstitutions(availability.equipment, currentTime);
        }
      }

      // Equipment returns
      if (availability.reserved > 0 && Math.random() < 0.05) {
        availability.reserved--;
        availability.available++;
      }

      // Condition degradation
      if (Math.random() < 0.01) {
        const conditions = ['Excellent', 'Good', 'Fair', 'Poor'];
        const currentIndex = conditions.indexOf(availability.condition);
        if (currentIndex < conditions.length - 1) {
          availability.condition = conditions[currentIndex + 1] as any;
          
          if (availability.condition === 'Poor') {
            this.emit('equipmentConditionPoor', { 
              equipment: availability.equipment,
              condition: availability.condition,
              time: currentTime 
            });
          }
        }
      }
    }

    // Process substitution requests
    this.processSubstitutionRequests(currentTime);
  }

  private handleShowfileConversions(currentTime: Date): void {
    const converter = this.system.showfileConverter;

    for (const conversion of converter.conversions) {
      if (conversion.status === 'Converting') {
        conversion.actualTime += 1; // Increment processing time

        // Check if conversion completed
        if (conversion.actualTime >= conversion.estimatedTime) {
          if (Math.random() < conversion.successProbability) {
            conversion.status = 'Success';
            this.emit('showfileConverted', { conversion, time: currentTime });
          } else {
            conversion.status = 'Failed';
            conversion.issues = this.generateConversionIssues(conversion);
            
            this.emit('showfileConversionFailed', { 
              conversion, 
              issues: conversion.issues,
              time: currentTime 
            });
            
            // Attempt alternative conversion
            this.attemptAlternativeConversion(conversion, currentTime);
          }
        }

        // Update progress
        const progress = Math.min(100, (conversion.actualTime / conversion.estimatedTime) * 100);
        if (progress % 25 === 0) { // Report at 25%, 50%, 75%, 100%
          this.emit('conversionProgress', { 
            conversion, 
            progress,
            time: currentTime 
          });
        }
      }

      // Start pending conversions
      if (conversion.status === 'Pending') {
        conversion.status = 'Converting';
        conversion.actualTime = 0;
        
        this.emit('conversionStarted', { conversion, time: currentTime });
      }
    }

    // Update success rates based on historical data
    this.updateConversionSuccessRates();
  }

  private manageIEMSystem(currentTime: Date): void {
    const iem = this.system.iemSystem;

    // Monitor frequency usage
    for (const frequency of iem.frequencies) {
      if (frequency.assigned) {
        // Simulate interference
        if (Math.random() < 0.01) { // 1% chance
          frequency.interference = true;
          frequency.signalStrength = Math.max(0, frequency.signalStrength - 20);
          
          this.emit('iemInterference', { 
            frequency: frequency.frequency,
            artistId: frequency.artistId,
            time: currentTime 
          });

          // Auto re-coordination if enabled
          if (iem.autoRecoordination) {
            this.performFrequencyRecoordination(frequency, currentTime);
          }
        } else if (frequency.interference) {
          // Clear interference randomly
          if (Math.random() < 0.3) {
            frequency.interference = false;
            frequency.signalStrength = 90 + Math.random() * 10; // 90-100%
            
            this.emit('iemInterferenceCleared', { 
              frequency: frequency.frequency,
              time: currentTime 
            });
          }
        }

        // Battery drain simulation
        if (frequency.batteryLevel > 0) {
          frequency.batteryLevel = Math.max(0, frequency.batteryLevel - 0.5); // 0.5% per tick
          
          if (frequency.batteryLevel < 20) {
            this.emit('iemLowBattery', { 
              frequency: frequency.frequency,
              artistId: frequency.artistId,
              batteryLevel: frequency.batteryLevel,
              time: currentTime 
            });
          }

          if (frequency.batteryLevel === 0) {
            this.emit('iemBatteryDead', { 
              frequency: frequency.frequency,
              artistId: frequency.artistId,
              time: currentTime 
            });
          }
        }
      }
    }

    // Manage spare pool
    this.manageIEMSparePool(iem.sparePool, currentTime);

    // Update monitor mixes based on preferences
    this.updateMonitorMixes(iem.monitorMixes, currentTime);
  }

  private trackSetlistVariances(currentTime: Date): void {
    for (const variance of this.system.setlistVariance) {
      // Simulate setlist changes during performance
      if (Math.random() < 0.05) { // 5% chance of setlist modification
        this.modifySetlist(variance, currentTime);
      }

      // Calculate impact metrics
      this.calculateSetlistImpact(variance, currentTime);
    }
  }

  private processCascadingDelays(currentTime: Date): void {
    for (const delay of this.system.cascadingDelays) {
      // Update delay progression
      if (delay.currentDelay > 0) {
        delay.rippleImpact = this.calculateRippleImpact(delay);
        
        // Apply cascading effects
        for (const effect of delay.cascadeEffects) {
          if (effect.conflictProbability > 0.7) {
            const affectedDelay = this.system.cascadingDelays.find(d => d.stageId === effect.affectedStage);
            if (affectedDelay) {
              affectedDelay.currentDelay += effect.delayAddition;
              
              this.emit('cascadingDelayTriggered', { 
                originStage: delay.stageId,
                affectedStage: effect.affectedStage,
                additionalDelay: effect.delayAddition,
                time: currentTime 
              });
            }
          }
        }

        // Implement mitigation strategies
        if (delay.currentDelay > 30) { // 30+ minutes delay
          this.implementDelayMitigation(delay, currentTime);
        }
      }

      // Random delay events
      if (Math.random() < 0.02) { // 2% chance
        const additionalDelay = Math.random() * 15 + 5; // 5-20 minutes
        delay.currentDelay += additionalDelay;
        
        this.emit('stageDelayIncurred', { 
          stageId: delay.stageId,
          additionalDelay,
          totalDelay: delay.currentDelay,
          time: currentTime 
        });
      }
    }
  }

  private handleGuestAppearances(currentTime: Date): void {
    for (const appearance of this.system.guestAppearances) {
      if (!appearance.approved) {
        // Random approval process
        if (Math.random() < 0.1) { // 10% chance per tick
          appearance.approved = this.evaluateGuestAppearance(appearance);
          
          if (appearance.approved) {
            // Security clearance
            appearance.securityCleared = Math.random() > 0.1; // 90% clearance rate
            
            // Technical requirements
            appearance.extraMicsRequired = Math.floor(Math.random() * 3) + 1;
            appearance.inputsRequired = Math.floor(Math.random() * 4) + 2;
            appearance.soundcheckTime = Math.random() * 10 + 5; // 5-15 minutes
            
            // Calculate crowd impact
            appearance.crowdImpact = this.calculateGuestImpact(appearance);
            
            this.emit('guestAppearanceApproved', { appearance, time: currentTime });
          } else {
            this.emit('guestAppearanceRejected', { 
              appearance, 
              reason: 'Technical/scheduling conflict',
              time: currentTime 
            });
          }
        }
      }
    }
  }

  private manageDJCrossfades(currentTime: Date): void {
    for (const crossfade of this.system.djCrossfade) {
      // Monitor technical setup
      const technical = crossfade.technical;
      
      // Sync status updates
      if (!technical.synchronized && Math.random() < 0.2) {
        technical.synchronized = true;
        technical.bpmMatched = Math.random() > 0.3; // 70% BPM match success
        technical.keyMatched = Math.random() > 0.5; // 50% key match success
        
        this.emit('djSyncUpdated', { 
          crossfade,
          synchronized: technical.synchronized,
          bpmMatched: technical.bpmMatched,
          keyMatched: technical.keyMatched,
          time: currentTime 
        });
      }

      // Calculate crossfade quality
      let qualityScore = 0.5; // Base score
      if (technical.synchronized) qualityScore += 0.2;
      if (technical.bpmMatched) qualityScore += 0.2;
      if (technical.keyMatched) qualityScore += 0.1;
      
      // Update dead air time based on sync quality
      crossfade.deadAirTime = Math.max(0, 10 - (qualityScore * 15)); // 0-10 seconds
      crossfade.crowdRetention = Math.min(1, qualityScore + 0.3);

      // Emit quality updates
      if (crossfade.deadAirTime > 5) {
        this.emit('djCrossfadeIssue', { 
          crossfade,
          issue: 'Excessive dead air',
          deadAirTime: crossfade.deadAirTime,
          time: currentTime 
        });
      } else if (crossfade.crowdRetention > 0.9) {
        this.emit('excellentCrossfade', { 
          crossfade,
          crowdRetention: crossfade.crowdRetention,
          time: currentTime 
        });
      }
    }
  }

  private assessProductionReadiness(currentTime: Date): void {
    const readiness = {
      visaCompliance: this.calculateVisaCompliance(),
      backlineAvailability: this.calculateBacklineReadiness(),
      showfileStatus: this.calculateShowfileReadiness(),
      iemReadiness: this.calculateIEMReadiness(),
      overallReadiness: 0
    };

    readiness.overallReadiness = (
      readiness.visaCompliance +
      readiness.backlineAvailability +
      readiness.showfileStatus +
      readiness.iemReadiness
    ) / 4;

    // Emit readiness alerts
    if (readiness.overallReadiness < 0.7) {
      this.emit('productionReadinessAlert', { 
        readiness,
        criticalIssues: this.identifyCriticalIssues(),
        time: currentTime 
      });
    }

    // Update production metrics
    this.updateProductionMetrics(readiness, currentTime);
  }

  // Helper methods
  private calculateApprovalChance(visaCheck: VisaCheck): number {
    let chance = 0.8; // Base 80% approval rate
    
    // Adjust based on visa type
    switch (visaCheck.visaType) {
      case 'Tourist': chance = 0.95; break;
      case 'Business': chance = 0.90; break;
      case 'Artist': chance = 0.85; break;
      case 'Work': chance = 0.80; break;
      default: chance = 0.75;
    }

    // Adjust based on nationality (simplified model)
    const riskCountries = ['Country1', 'Country2']; // Placeholder
    if (riskCountries.includes(visaCheck.nationality)) {
      chance *= 0.8;
    }

    return Math.min(0.98, chance);
  }

  private handleVisaDenial(visaCheck: VisaCheck, currentTime: Date): void {
    this.emit('visaDenied', { 
      visaCheck,
      impact: 'Artist cannot perform',
      mitigation: ['Find replacement artist', 'Apply for appeal', 'Reschedule performance'],
      time: currentTime 
    });

    // Trigger cascading effects
    this.triggerArtistCancellation(visaCheck.artistId, currentTime);
  }

  private updateVisaRiskLevel(visaCheck: VisaCheck, currentTime: Date): void {
    if (!visaCheck.required) return;

    const festivalStart = this.festival.startDate;
    const daysUntilFestival = (festivalStart.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24);

    if (visaCheck.status === 'Applied' && daysUntilFestival < 14) {
      visaCheck.riskLevel = 'High';
    } else if (visaCheck.status === 'Applied' && daysUntilFestival < 7) {
      visaCheck.riskLevel = 'Critical';
    }
  }

  private findEquipmentSubstitutions(equipment: string, currentTime: Date): void {
    const substitutions = this.system.backlineSubstitution.substitutions.filter(
      sub => sub.original === equipment && sub.available
    );

    for (const sub of substitutions) {
      this.emit('substitutionRecommended', { 
        original: equipment,
        substitute: sub.substitute,
        qualityLoss: sub.qualityLoss,
        cost: sub.cost,
        time: currentTime 
      });
    }
  }

  private processSubstitutionRequests(currentTime: Date): void {
    // Simulate substitution requests and approvals
    if (Math.random() < 0.05) { // 5% chance per tick
      const substitutions = this.system.backlineSubstitution.substitutions;
      const randomSub = substitutions[Math.floor(Math.random() * substitutions.length)];
      
      if (randomSub.available) {
        const qualityImpact = this.system.backlineSubstitution.qualityImpact.find(
          qi => qi.equipment === randomSub.original
        );
        
        if (qualityImpact) {
          const acceptanceRisk = qualityImpact.acceptanceRisk;
          
          if (Math.random() > acceptanceRisk) {
            this.emit('substitutionAccepted', { 
              substitution: randomSub,
              qualityImpact,
              time: currentTime 
            });
          } else {
            this.emit('substitutionRejected', { 
              substitution: randomSub,
              reason: 'Artist quality concerns',
              time: currentTime 
            });
          }
        }
      }
    }
  }

  private generateConversionIssues(conversion: ShowfileConversion): string[] {
    const possibleIssues = [
      'Incompatible plugin versions',
      'Missing channel mappings',
      'Unsupported effects',
      'Automation data loss',
      'Sample rate mismatch',
      'Missing audio files',
      'Corrupted project data'
    ];

    const numIssues = Math.floor(Math.random() * 3) + 1;
    return possibleIssues.slice(0, numIssues);
  }

  private attemptAlternativeConversion(failedConversion: ShowfileConversion, currentTime: Date): void {
    // Try alternative conversion path
    const alternativeFormats = this.system.showfileConverter.supportedFormats.filter(
      format => format !== failedConversion.to
    );

    if (alternativeFormats.length > 0) {
      const altFormat = alternativeFormats[0];
      const newConversion: ShowfileConversion = {
        id: uuidv4(),
        from: failedConversion.from,
        to: altFormat,
        artistId: failedConversion.artistId,
        status: 'Pending',
        successProbability: 0.7, // Lower probability for alternative
        estimatedTime: failedConversion.estimatedTime * 1.5,
        actualTime: 0,
        issues: []
      };

      this.system.showfileConverter.conversions.push(newConversion);
      
      this.emit('alternativeConversionAttempt', { 
        original: failedConversion,
        alternative: newConversion,
        time: currentTime 
      });
    }
  }

  private updateConversionSuccessRates(): void {
    // Analyze conversion history and update success rates
    for (const successRate of this.system.showfileConverter.successRates) {
      const relevantConversions = this.system.showfileConverter.conversions.filter(
        conv => conv.from === successRate.fromFormat && conv.to === successRate.toFormat
      );

      if (relevantConversions.length > 0) {
        const successCount = relevantConversions.filter(conv => conv.status === 'Success').length;
        successRate.successRate = successCount / relevantConversions.length;
        
        const totalTime = relevantConversions.reduce((sum, conv) => sum + conv.actualTime, 0);
        successRate.averageTime = totalTime / relevantConversions.length;
      }
    }
  }

  private performFrequencyRecoordination(interferingFreq: IEMFrequency, currentTime: Date): void {
    const sparePool = this.system.iemSystem.sparePool;
    
    if (sparePool.available > 0) {
      // Find available frequency
      const availableFreq = sparePool.frequencies.find(freq => 
        !this.system.iemSystem.frequencies.some(f => f.frequency === freq && f.assigned)
      );

      if (availableFreq) {
        // Reassign to new frequency
        interferingFreq.frequency = availableFreq;
        interferingFreq.interference = false;
        interferingFreq.signalStrength = 95;
        
        sparePool.available--;
        
        this.emit('frequencyRecoordinated', { 
          artistId: interferingFreq.artistId,
          oldFrequency: interferingFreq.frequency,
          newFrequency: availableFreq,
          time: currentTime 
        });
      }
    }
  }

  private manageIEMSparePool(sparePool: IEMSparePool, currentTime: Date): void {
    // Auto-assignment of spare frequencies when needed
    if (sparePool.autoAssignment) {
      const needingFrequencies = this.system.iemSystem.frequencies.filter(
        freq => freq.assigned && (freq.interference || freq.batteryLevel === 0)
      );

      for (const needingFreq of needingFrequencies) {
        if (sparePool.available > 0) {
          this.performFrequencyRecoordination(needingFreq, currentTime);
        }
      }
    }

    // Replenish spare pool
    if (sparePool.available < 2 && Math.random() < 0.1) {
      sparePool.available++;
      this.emit('spareFrequencyReplenished', { sparePool, time: currentTime });
    }
  }

  private updateMonitorMixes(monitorMixes: MonitorMix[], currentTime: Date): void {
    for (const mix of monitorMixes) {
      // Simulate mix customization
      if (!mix.customized && Math.random() < 0.05) {
        mix.customized = true;
        mix.channels = mix.channels.map(ch => ch + (Math.random() - 0.5) * 10); // ±5dB variation
        
        this.emit('monitorMixCustomized', { 
          artistId: mix.artistId,
          mix,
          time: currentTime 
        });
      }

      // Soundcheck completion
      if (!mix.soundcheck && Math.random() < 0.1) {
        mix.soundcheck = true;
        this.emit('soundcheckCompleted', { 
          artistId: mix.artistId,
          time: currentTime 
        });
      }
    }
  }

  private modifySetlist(variance: SetlistVariance, currentTime: Date): void {
    const changeType = Math.random();
    
    if (changeType < 0.3) {
      // Add a banger
      variance.bangerRatio = Math.min(1, variance.bangerRatio + 0.1);
      variance.deepCutRatio = Math.max(0, variance.deepCutRatio - 0.05);
    } else if (changeType < 0.6) {
      // Add a deep cut
      variance.deepCutRatio = Math.min(1, variance.deepCutRatio + 0.1);
      variance.bangerRatio = Math.max(0, variance.bangerRatio - 0.05);
    } else {
      // Song substitution
      const randomIndex = Math.floor(Math.random() * variance.originalSetlist.length);
      variance.actualSetlist[randomIndex] = `Substituted Song ${Math.floor(Math.random() * 100)}`;
    }

    this.emit('setlistModified', { 
      artistId: variance.artistId,
      variance,
      time: currentTime 
    });
  }

  private calculateSetlistImpact(variance: SetlistVariance, currentTime: Date): void {
    // Calculate crowd energy impact
    const energyBoost = variance.bangerRatio * 0.4 - variance.deepCutRatio * 0.2;
    variance.crowdEnergyImpact = Math.max(-0.5, Math.min(0.5, energyBoost));

    // Calculate spending impact
    const spendingMultiplier = 1 + variance.crowdEnergyImpact * 0.3;
    variance.spendingImpact = spendingMultiplier;

    // Calculate satisfaction impact
    const balanceScore = Math.abs(variance.bangerRatio - variance.deepCutRatio);
    variance.satisfactionImpact = Math.max(0.5, 1 - balanceScore);

    // Emit significant impacts
    if (Math.abs(variance.crowdEnergyImpact) > 0.3) {
      this.emit('significantSetlistImpact', { 
        artistId: variance.artistId,
        impact: variance.crowdEnergyImpact > 0 ? 'High Energy' : 'Low Energy',
        variance,
        time: currentTime 
      });
    }
  }

  private calculateRippleImpact(delay: DelayModel): number {
    let totalImpact = 0;
    
    for (const effect of delay.cascadeEffects) {
      const impactWeight = effect.conflictProbability * effect.attendeeDisruption;
      totalImpact += impactWeight;
    }

    return Math.min(1, totalImpact / delay.cascadeEffects.length);
  }

  private implementDelayMitigation(delay: DelayModel, currentTime: Date): void {
    const strategies = delay.mitigationStrategies;
    const selectedStrategy = strategies[Math.floor(Math.random() * strategies.length)];
    
    let mitigationEffect = 0;
    
    switch (selectedStrategy) {
      case 'Reduce changeover time':
        mitigationEffect = Math.random() * 10 + 5; // 5-15 minutes saved
        break;
      case 'Skip soundcheck':
        mitigationEffect = Math.random() * 15 + 10; // 10-25 minutes saved
        break;
      case 'Shorten set time':
        mitigationEffect = Math.random() * 20 + 10; // 10-30 minutes saved
        break;
      case 'Parallel setup':
        mitigationEffect = Math.random() * 12 + 8; // 8-20 minutes saved
        break;
    }

    delay.currentDelay = Math.max(0, delay.currentDelay - mitigationEffect);
    
    this.emit('delayMitigationApplied', { 
      stageId: delay.stageId,
      strategy: selectedStrategy,
      timeSaved: mitigationEffect,
      remainingDelay: delay.currentDelay,
      time: currentTime 
    });
  }

  private evaluateGuestAppearance(appearance: GuestAppearanceFlow): boolean {
    // Evaluate based on various factors
    let approvalScore = 0.5; // Base score

    // Main artist tier influence
    const mainArtist = this.festival.artists.find(a => a.name === appearance.mainArtist);
    if (mainArtist?.tier === 'Headliner') approvalScore += 0.3;
    else if (mainArtist?.tier === 'Main') approvalScore += 0.2;

    // Technical complexity penalty
    if (appearance.extraMicsRequired > 2) approvalScore -= 0.1;
    if (appearance.inputsRequired > 4) approvalScore -= 0.1;

    // Schedule impact
    if (appearance.soundcheckTime > 10) approvalScore -= 0.1;

    return Math.random() < approvalScore;
  }

  private calculateGuestImpact(appearance: GuestAppearanceFlow): number {
    // Calculate positive crowd impact
    let impact = 0.7; // Base impact
    
    // Popular guest artist boost
    if (Math.random() > 0.5) impact += 0.2;
    
    // Surprise factor
    impact += Math.random() * 0.1;
    
    return Math.min(1, impact);
  }

  private triggerArtistCancellation(artistId: string, currentTime: Date): void {
    const artist = this.festival.artists.find(a => a.id === artistId);
    if (artist) {
      artist.status = 'Cancelled';
      
      this.emit('artistCancelled', { 
        artist,
        reason: 'Visa issues',
        financialImpact: this.calculateCancellationCost(artist),
        time: currentTime 
      });
    }
  }

  private calculateCancellationCost(artist: Artist): number {
    // Calculate cancellation costs based on artist tier
    const baseCosts: Record<string, number> = {
      'Headliner': 100000,
      'Main': 50000,
      'Support': 20000,
      'Local': 5000,
      'Opening': 2000
    };

    return baseCosts[artist.tier] || 10000;
  }

  private calculateVisaCompliance(): number {
    const totalChecks = this.system.visaChecks.length;
    if (totalChecks === 0) return 1;

    const compliantChecks = this.system.visaChecks.filter(
      check => !check.required || check.status === 'Approved'
    ).length;

    return compliantChecks / totalChecks;
  }

  private calculateBacklineReadiness(): number {
    const availability = this.system.backlineSubstitution.availability;
    const totalEquipment = availability.reduce((sum, a) => sum + a.quantity, 0);
    const availableEquipment = availability.reduce((sum, a) => sum + a.available, 0);

    return totalEquipment > 0 ? availableEquipment / totalEquipment : 1;
  }

  private calculateShowfileReadiness(): number {
    const conversions = this.system.showfileConverter.conversions;
    if (conversions.length === 0) return 1;

    const readyConversions = conversions.filter(c => c.status === 'Success').length;
    return readyConversions / conversions.length;
  }

  private calculateIEMReadiness(): number {
    const frequencies = this.system.iemSystem.frequencies;
    const assignedFreqs = frequencies.filter(f => f.assigned);
    
    if (assignedFreqs.length === 0) return 1;

    const readyFreqs = assignedFreqs.filter(f => 
      !f.interference && f.batteryLevel > 20 && f.signalStrength > 70
    ).length;

    return readyFreqs / assignedFreqs.length;
  }

  private identifyCriticalIssues(): string[] {
    const issues: string[] = [];

    // Visa issues
    const criticalVisas = this.system.visaChecks.filter(v => v.riskLevel === 'Critical').length;
    if (criticalVisas > 0) {
      issues.push(`${criticalVisas} critical visa issues`);
    }

    // Equipment unavailability
    const unavailableEquipment = this.system.backlineSubstitution.availability.filter(
      a => a.available === 0
    ).length;
    if (unavailableEquipment > 0) {
      issues.push(`${unavailableEquipment} equipment types unavailable`);
    }

    // Failed conversions
    const failedConversions = this.system.showfileConverter.conversions.filter(
      c => c.status === 'Failed'
    ).length;
    if (failedConversions > 0) {
      issues.push(`${failedConversions} showfile conversion failures`);
    }

    // IEM problems
    const problematicFreqs = this.system.iemSystem.frequencies.filter(
      f => f.assigned && (f.interference || f.batteryLevel < 20)
    ).length;
    if (problematicFreqs > 0) {
      issues.push(`${problematicFreqs} IEM frequency problems`);
    }

    return issues;
  }

  private updateProductionMetrics(readiness: any, currentTime: Date): void {
    // Update internal metrics for reporting
    this.emit('productionMetricsUpdate', { 
      readiness,
      timestamp: currentTime,
      trends: {
        visaApprovalRate: this.calculateVisaApprovalRate(),
        equipmentUtilization: this.calculateEquipmentUtilization(),
        conversionSuccessRate: this.calculateOverallConversionSuccess(),
        iemReliability: this.calculateIEMReliability()
      }
    });
  }

  private calculateVisaApprovalRate(): number {
    const processedVisas = this.system.visaChecks.filter(v => 
      v.status === 'Approved' || v.status === 'Denied'
    );
    if (processedVisas.length === 0) return 1;

    const approvedVisas = processedVisas.filter(v => v.status === 'Approved').length;
    return approvedVisas / processedVisas.length;
  }

  private calculateEquipmentUtilization(): number {
    const availability = this.system.backlineSubstitution.availability;
    const totalCapacity = availability.reduce((sum, a) => sum + a.quantity, 0);
    const inUse = availability.reduce((sum, a) => sum + a.reserved, 0);

    return totalCapacity > 0 ? inUse / totalCapacity : 0;
  }

  private calculateOverallConversionSuccess(): number {
    const conversions = this.system.showfileConverter.conversions;
    if (conversions.length === 0) return 1;

    const successfulConversions = conversions.filter(c => c.status === 'Success').length;
    return successfulConversions / conversions.length;
  }

  private calculateIEMReliability(): number {
    const frequencies = this.system.iemSystem.frequencies.filter(f => f.assigned);
    if (frequencies.length === 0) return 1;

    const reliableFreqs = frequencies.filter(f => 
      !f.interference && f.batteryLevel > 50 && f.signalStrength > 80
    ).length;

    return reliableFreqs / frequencies.length;
  }

  // Initialize helper methods
  private generateVisaChecks(): VisaCheck[] {
    const visaChecks: VisaCheck[] = [];
    const nationalities = ['UK', 'Germany', 'France', 'Japan', 'Australia', 'Brazil', 'Mexico'];
    const visaTypes = ['Tourist', 'Business', 'Artist', 'Work'];

    for (let i = 0; i < this.festival.artists.length; i++) {
      const artist = this.festival.artists[i];
      const nationality = nationalities[Math.floor(Math.random() * nationalities.length)];
      const required = nationality !== 'UK'; // Assume UK artists don't need visas
      
      visaChecks.push({
        artistId: artist.id,
        nationality,
        visaType: visaTypes[Math.floor(Math.random() * visaTypes.length)],
        required,
        status: required ? (Math.random() > 0.5 ? 'Applied' : 'NotRequired') : 'NotRequired',
        applicationDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Up to 60 days ago
        approvalDate: new Date(),
        expiryDate: new Date(),
        leadTime: Math.random() * 20 + 10, // 10-30 days
        riskLevel: 'Low'
      });
    }

    return visaChecks;
  }

  private createBacklineMatrix(): BacklineMatrix {
    const equipmentTypes = [
      'Guitar Amp', 'Bass Amp', 'Drum Kit', 'Keyboard', 'Microphone',
      'DI Box', 'Monitor', 'Cable', 'Stand', 'Effects Pedal'
    ];

    const substitutions: BacklineSubstitution[] = [];
    const availability: BacklineAvailability[] = [];
    const qualityImpact: QualityImpact[] = [];

    for (const equipment of equipmentTypes) {
      // Create availability
      availability.push({
        equipment,
        quantity: Math.floor(Math.random() * 10) + 5, // 5-15 units
        reserved: Math.floor(Math.random() * 3),
        available: Math.floor(Math.random() * 5) + 3,
        condition: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)] as any
      });

      // Create substitutions
      const alternativeEquipment = equipmentTypes.filter(e => e !== equipment);
      for (let i = 0; i < 2; i++) {
        const substitute = alternativeEquipment[Math.floor(Math.random() * alternativeEquipment.length)];
        substitutions.push({
          original: equipment,
          substitute,
          compatibility: Math.random() * 0.4 + 0.6, // 60-100%
          qualityLoss: Math.random() * 0.3, // 0-30% quality loss
          available: Math.random() > 0.3, // 70% available
          cost: Math.random() * 500 + 100 // $100-600
        });
      }

      // Create quality impact for each artist
      for (const artist of this.festival.artists) {
        qualityImpact.push({
          artistId: artist.id,
          equipment,
          impactScore: Math.random() * 0.5 + 0.5, // 50-100% impact
          acceptanceRisk: Math.random() * 0.4 + 0.1 // 10-50% rejection risk
        });
      }
    }

    return { substitutions, availability, qualityImpact };
  }

  private createShowfileConverter(): ShowfileConverter {
    const supportedFormats = ['DiGiCo', 'Allen-Heath', 'Avid', 'Yamaha', 'Midas', 'SSL'];
    const conversions: ShowfileConversion[] = [];
    const successRates: ConversionSuccess[] = [];

    // Create success rate matrix
    for (const from of supportedFormats) {
      for (const to of supportedFormats) {
        if (from !== to) {
          successRates.push({
            fromFormat: from,
            toFormat: to,
            successRate: Math.random() * 0.4 + 0.6, // 60-100%
            averageTime: Math.random() * 30 + 10, // 10-40 minutes
            commonIssues: ['Plugin compatibility', 'Automation mapping', 'Sample rate issues']
          });
        }
      }
    }

    // Create some pending conversions
    for (let i = 0; i < 5; i++) {
      const from = supportedFormats[Math.floor(Math.random() * supportedFormats.length)];
      const to = supportedFormats.filter(f => f !== from)[Math.floor(Math.random() * (supportedFormats.length - 1))];
      
      conversions.push({
        id: uuidv4(),
        from,
        to,
        artistId: this.festival.artists[Math.floor(Math.random() * this.festival.artists.length)].id,
        status: 'Pending',
        successProbability: Math.random() * 0.3 + 0.7, // 70-100%
        estimatedTime: Math.random() * 20 + 10, // 10-30 minutes
        actualTime: 0,
        issues: []
      });
    }

    return { supportedFormats, conversions, successRates };
  }

  private createIEMSystem(): IEMSystem {
    const frequencies: IEMFrequency[] = [];
    const sparePool: IEMSparePool = {
      available: 5,
      reserved: 2,
      frequencies: [518.0, 542.0, 566.0, 590.0, 614.0],
      autoAssignment: true
    };
    const monitorMixes: MonitorMix[] = [];

    // Create frequency assignments
    for (let i = 0; i < 20; i++) {
      const frequency = 470 + (i * 2); // 470-508 MHz range
      frequencies.push({
        frequency,
        assigned: Math.random() > 0.3, // 70% assigned
        artistId: Math.random() > 0.3 ? this.festival.artists[Math.floor(Math.random() * this.festival.artists.length)].id : '',
        channel: `Ch${i + 1}`,
        interference: false,
        signalStrength: Math.random() * 20 + 80, // 80-100%
        batteryLevel: Math.random() * 30 + 70 // 70-100%
      });
    }

    // Create monitor mixes
    for (const artist of this.festival.artists) {
      monitorMixes.push({
        artistId: artist.id,
        channels: Array.from({length: 8}, () => Math.random() * 20 - 10), // ±10dB
        preset: `Preset_${artist.genre}`,
        customized: false,
        soundcheck: false
      });
    }

    return {
      frequencies,
      interferenceDetection: true,
      autoRecoordination: true,
      sparePool,
      monitorMixes
    };
  }

  private generateSetlistVariance(): SetlistVariance[] {
    const variances: SetlistVariance[] = [];

    for (const artist of this.festival.artists) {
      const originalSetlist = Array.from({length: 12}, (_, i) => `Song ${i + 1}`);
      
      variances.push({
        artistId: artist.id,
        originalSetlist,
        actualSetlist: [...originalSetlist], // Copy
        bangerRatio: Math.random() * 0.4 + 0.3, // 30-70%
        deepCutRatio: Math.random() * 0.3 + 0.1, // 10-40%
        crowdEnergyImpact: 0,
        spendingImpact: 1,
        satisfactionImpact: 1
      });
    }

    return variances;
  }

  private createDelayModel(): DelayModel[] {
    const delays: DelayModel[] = [];
    const stageIds = ['Main Stage', 'Second Stage', 'Third Stage'];

    for (const stageId of stageIds) {
      const cascadeEffects: CascadeEffect[] = [];
      
      // Each stage can affect others
      for (const otherStage of stageIds) {
        if (otherStage !== stageId) {
          cascadeEffects.push({
            affectedStage: otherStage,
            delayAddition: Math.random() * 15 + 5, // 5-20 minutes
            conflictProbability: Math.random() * 0.6 + 0.2, // 20-80%
            attendeeDisruption: Math.random() * 0.8 + 0.2 // 20-100%
          });
        }
      }

      delays.push({
        stageId,
        currentDelay: 0,
        cascadeEffects,
        rippleImpact: 0,
        mitigationStrategies: [
          'Reduce changeover time',
          'Skip soundcheck',
          'Shorten set time',
          'Parallel setup'
        ]
      });
    }

    return delays;
  }

  private generateDJCrossfades(): DJCrossfadeWindow[] {
    const crossfades: DJCrossfadeWindow[] = [];

    for (let i = 0; i < 5; i++) {
      crossfades.push({
        id: uuidv4(),
        fromDJ: `DJ ${i + 1}`,
        toDJ: `DJ ${i + 2}`,
        beatSync: Math.random() > 0.3, // 70% beat sync capability
        crossfadeDuration: Math.random() * 30 + 15, // 15-45 seconds
        deadAirTime: Math.random() * 5, // 0-5 seconds
        crowdRetention: Math.random() * 0.3 + 0.7, // 70-100%
        technical: {
          mixer: 'Pioneer DJM-900NXS2',
          cdjs: 2,
          laptops: 2,
          synchronized: false,
          bpmMatched: false,
          keyMatched: false
        }
      });
    }

    return crossfades;
  }

  // Public methods for external access
  public getMetrics(): any {
    return {
      visaCompliance: this.calculateVisaCompliance(),
      backlineReadiness: this.calculateBacklineReadiness(),
      showfileReadiness: this.calculateShowfileReadiness(),
      iemReadiness: this.calculateIEMReadiness(),
      productionReadiness: (
        this.calculateVisaCompliance() +
        this.calculateBacklineReadiness() +
        this.calculateShowfileReadiness() +
        this.calculateIEMReadiness()
      ) / 4,
      statistics: {
        totalVisaChecks: this.system.visaChecks.length,
        pendingVisas: this.system.visaChecks.filter(v => v.status === 'Applied').length,
        equipmentTypes: this.system.backlineSubstitution.availability.length,
        activeConversions: this.system.showfileConverter.conversions.filter(c => c.status === 'Converting').length,
        assignedFrequencies: this.system.iemSystem.frequencies.filter(f => f.assigned).length,
        activeDelays: this.system.cascadingDelays.filter(d => d.currentDelay > 0).length
      }
    };
  }

  public getVisaStatus(): VisaCheck[] {
    return this.system.visaChecks;
  }

  public getBacklineStatus(): BacklineMatrix {
    return this.system.backlineSubstitution;
  }

  public getShowfileStatus(): ShowfileConverter {
    return this.system.showfileConverter;
  }

  public getIEMStatus(): IEMSystem {
    return this.system.iemSystem;
  }

  public getDelayStatus(): DelayModel[] {
    return this.system.cascadingDelays;
  }

  public requestGuestAppearance(mainArtist: string, guestArtist: string): string {
    const appearance: GuestAppearanceFlow = {
      id: uuidv4(),
      mainArtist,
      guestArtist,
      approved: false,
      securityCleared: false,
      extraMicsRequired: 0,
      inputsRequired: 0,
      soundcheckTime: 0,
      crowdImpact: 0
    };

    this.system.guestAppearances.push(appearance);
    return appearance.id;
  }

  public scheduleShowfileConversion(artistId: string, fromFormat: string, toFormat: string): string {
    const conversion: ShowfileConversion = {
      id: uuidv4(),
      from: fromFormat,
      to: toFormat,
      artistId,
      status: 'Pending',
      successProbability: 0.8,
      estimatedTime: 20,
      actualTime: 0,
      issues: []
    };

    this.system.showfileConverter.conversions.push(conversion);
    return conversion.id;
  }

  public assignIEMFrequency(artistId: string, preferredFrequency?: number): number | null {
    const availableFreq = this.system.iemSystem.frequencies.find(f => 
      !f.assigned && (!preferredFrequency || f.frequency === preferredFrequency)
    );

    if (availableFreq) {
      availableFreq.assigned = true;
      availableFreq.artistId = artistId;
      availableFreq.batteryLevel = 100;
      availableFreq.signalStrength = 95;
      return availableFreq.frequency;
    }

    return null;
  }
}