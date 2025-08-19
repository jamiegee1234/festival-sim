import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { SimulationSettings } from '../../types';
import { 
  AccreditationSystem, Badge, AccreditationKiosk, BadgeScanner, 
  OfflineScans, ScanRecord, SecurityLevel, BadgeType, FestivalLocation 
} from '../../types/enhanced';

export class AccreditationEngine extends EventEmitter {
  private system: AccreditationSystem;
  private settings: SimulationSettings;

  constructor(system: AccreditationSystem, settings: SimulationSettings) {
    super();
    this.system = system;
    this.settings = settings;
    this.initializeSystem();
  }

  private initializeSystem(): void {
    // Initialize with default kiosks and scanners if empty
    if (this.system.kiosks.length === 0) {
      this.system.kiosks = this.createDefaultKiosks();
    }
    if (this.system.scanners.length === 0) {
      this.system.scanners = this.createDefaultScanners();
    }
    if (this.system.securityLevels.length === 0) {
      this.system.securityLevels = this.createSecurityLevels();
    }
  }

  public process(currentTime: Date): void {
    this.processKiosks(currentTime);
    this.processScanners(currentTime);
    this.handleOfflineSync(currentTime);
    this.monitorBadgeUsage(currentTime);
    this.checkSecurityAlerts(currentTime);
  }

  private processKiosks(currentTime: Date): void {
    for (const kiosk of this.system.kiosks) {
      // Simulate kiosk processing
      if (kiosk.status === 'Online') {
        // Process queue
        if (kiosk.queueLength > 0) {
          const processingRate = Math.max(1, 5 - kiosk.issuesCount);
          kiosk.queueLength = Math.max(0, kiosk.queueLength - processingRate);
          kiosk.processingTime = this.calculateProcessingTime(kiosk.queueLength);
        }

        // Random chance of issues
        if (Math.random() < 0.01) {
          kiosk.issuesCount++;
          if (kiosk.issuesCount > 5) {
            kiosk.status = 'Error';
            this.emit('kioskError', { kiosk, time: currentTime });
          }
        }

        // Go offline randomly (network issues)
        if (Math.random() < 0.005) {
          kiosk.status = 'Offline';
          kiosk.offlineMode = true;
          this.emit('kioskOffline', { kiosk, time: currentTime });
        }
      } else if (kiosk.status === 'Offline' && kiosk.offlineMode) {
        // Try to come back online
        if (Math.random() < 0.1) {
          kiosk.status = 'Online';
          kiosk.offlineMode = false;
          kiosk.lastSync = currentTime;
          this.emit('kioskOnline', { kiosk, time: currentTime });
        }
      }

      // Add random queue growth
      if (Math.random() < 0.3) {
        kiosk.queueLength += Math.floor(Math.random() * 3);
      }
    }
  }

  private processScanners(currentTime: Date): void {
    for (const scanner of this.system.scanners) {
      if (scanner.status === 'Online') {
        // Simulate scanning activity
        if (Math.random() < 0.2) {
          const scanSuccess = this.simulateScan(scanner, currentTime);
          if (!scanSuccess && scanner.type !== 'Hybrid') {
            // Fallback for non-hybrid scanners
            this.emit('scanFallback', { scanner, time: currentTime });
          }
        }

        // Battery drain for mobile scanners
        if (scanner.batteryLevel > 0) {
          scanner.batteryLevel = Math.max(0, scanner.batteryLevel - 1);
          if (scanner.batteryLevel < 20) {
            this.emit('lowBattery', { scanner, time: currentTime });
          }
        }

        // Go offline if battery too low
        if (scanner.batteryLevel === 0) {
          scanner.status = 'Offline';
          this.emit('scannerOffline', { scanner, reason: 'Battery', time: currentTime });
        }
      }
    }
  }

  private simulateScan(scanner: BadgeScanner, currentTime: Date): boolean {
    const badge = this.getRandomBadge();
    if (!badge) return false;

    const scanRecord: ScanRecord = {
      badgeId: badge.id,
      scannerId: scanner.id,
      timestamp: currentTime,
      location: scanner.location,
      success: true,
      denied: false
    };

    // Check if scan should be denied
    if (badge.status !== 'Active') {
      scanRecord.success = false;
      scanRecord.denied = true;
      scanRecord.reason = `Badge ${badge.status}`;
    }

    // Check security level access
    const hasAccess = this.checkAccess(badge, scanner.location);
    if (!hasAccess) {
      scanRecord.success = false;
      scanRecord.denied = true;
      scanRecord.reason = 'Access Denied';
    }

    // Store scan record
    badge.scanHistory.push(scanRecord);
    badge.lastScan = currentTime;

    if (scanner.status === 'Offline') {
      // Store offline scan
      scanner.offlineScans++;
      this.storeOfflineScan(scanner.id, scanRecord);
    }

    this.emit('badgeScan', { badge, scanner, scanRecord, time: currentTime });

    return scanRecord.success;
  }

  private handleOfflineSync(currentTime: Date): void {
    const offlineScans = this.system.offlineBuffer.filter(
      buffer => (currentTime.getTime() - buffer.timestamp.getTime()) > 300000 // 5 minutes
    );

    for (const buffer of offlineScans) {
      const scanner = this.system.scanners.find(s => s.id === buffer.scannerId);
      if (scanner && scanner.status === 'Online') {
        // Sync offline scans
        scanner.offlineScans = Math.max(0, scanner.offlineScans - buffer.scans.length);
        scanner.lastSync = currentTime;
        
        // Remove synced buffer
        const index = this.system.offlineBuffer.indexOf(buffer);
        this.system.offlineBuffer.splice(index, 1);

        this.emit('offlineSync', { 
          scanner, 
          scansCount: buffer.scans.length, 
          time: currentTime 
        });
      }
    }
  }

  private monitorBadgeUsage(currentTime: Date): void {
    for (const badge of this.system.badges) {
      // Check for expired badges
      if (badge.validUntil < currentTime && badge.status === 'Active') {
        badge.status = 'Expired';
        this.emit('badgeExpired', { badge, time: currentTime });
      }

      // Check for suspicious activity (multiple rapid scans)
      const recentScans = badge.scanHistory.filter(
        scan => (currentTime.getTime() - scan.timestamp.getTime()) < 60000 // 1 minute
      );
      
      if (recentScans.length > 5) {
        this.emit('suspiciousBadgeActivity', { badge, scans: recentScans, time: currentTime });
      }
    }
  }

  private checkSecurityAlerts(currentTime: Date): void {
    const deniedScans = this.system.badges
      .flatMap(badge => badge.scanHistory)
      .filter(scan => 
        scan.denied && 
        (currentTime.getTime() - scan.timestamp.getTime()) < 300000 // 5 minutes
      );

    if (deniedScans.length > 10) {
      this.emit('securityAlert', { 
        type: 'Multiple Access Denials',
        count: deniedScans.length,
        time: currentTime
      });
    }
  }

  private calculateProcessingTime(queueLength: number): number {
    return Math.max(30, queueLength * 45); // 45 seconds per person minimum
  }

  private checkAccess(badge: Badge, location: FestivalLocation): boolean {
    const securityLevel = this.system.securityLevels.find(
      level => level.level === badge.securityLevel
    );
    
    if (!securityLevel) return false;

    // Simple zone-based access check
    const zone = this.getZoneFromLocation(location);
    return securityLevel.zones.includes(zone) || badge.zones.includes(zone);
  }

  private getZoneFromLocation(location: FestivalLocation): string {
    // Simple zone mapping based on coordinates
    if (location.x < 100) return 'Public';
    if (location.x < 200) return 'VIP';
    if (location.x < 300) return 'Backstage';
    return 'Production';
  }

  private getRandomBadge(): Badge | null {
    if (this.system.badges.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.system.badges.length);
    return this.system.badges[randomIndex];
  }

  private storeOfflineScan(scannerId: string, scanRecord: ScanRecord): void {
    let buffer = this.system.offlineBuffer.find(b => b.scannerId === scannerId);
    if (!buffer) {
      buffer = {
        scannerId,
        scans: [],
        timestamp: new Date()
      };
      this.system.offlineBuffer.push(buffer);
    }
    buffer.scans.push(scanRecord);
  }

  private createDefaultKiosks(): AccreditationKiosk[] {
    return [
      {
        id: uuidv4(),
        location: { x: 50, y: 50, zone: 'Main Entrance' },
        status: 'Online',
        queueLength: 0,
        processingTime: 30,
        offlineMode: false,
        lastSync: new Date(),
        issuesCount: 0
      },
      {
        id: uuidv4(),
        location: { x: 100, y: 100, zone: 'Artist Entrance' },
        status: 'Online',
        queueLength: 0,
        processingTime: 30,
        offlineMode: false,
        lastSync: new Date(),
        issuesCount: 0
      }
    ];
  }

  private createDefaultScanners(): BadgeScanner[] {
    return [
      {
        id: uuidv4(),
        location: { x: 60, y: 60, zone: 'Gate 1' },
        type: 'Hybrid',
        status: 'Online',
        batteryLevel: 100,
        offlineScans: 0,
        lastSync: new Date()
      },
      {
        id: uuidv4(),
        location: { x: 150, y: 150, zone: 'VIP Area' },
        type: 'NFC',
        status: 'Online',
        batteryLevel: 85,
        offlineScans: 0,
        lastSync: new Date()
      }
    ];
  }

  private createSecurityLevels(): SecurityLevel[] {
    return [
      {
        level: 1,
        name: 'Public Access',
        description: 'General public areas',
        zones: ['Public', 'Food', 'Merchandise'],
        restrictions: []
      },
      {
        level: 2,
        name: 'VIP Access', 
        description: 'VIP areas and amenities',
        zones: ['Public', 'Food', 'Merchandise', 'VIP'],
        restrictions: []
      },
      {
        level: 3,
        name: 'Backstage Access',
        description: 'Artist and crew areas',
        zones: ['Public', 'Food', 'Merchandise', 'VIP', 'Backstage'],
        restrictions: ['Escort Required']
      },
      {
        level: 4,
        name: 'Production Access',
        description: 'Full production access',
        zones: ['Public', 'Food', 'Merchandise', 'VIP', 'Backstage', 'Production'],
        restrictions: []
      }
    ];
  }

  // Public methods for external access
  public createBadge(type: BadgeType, personId: string, name: string, securityLevel: number): Badge {
    const badge: Badge = {
      id: uuidv4(),
      type,
      personId,
      name,
      photo: `photo_${personId}.jpg`,
      qrCode: `QR_${uuidv4()}`,
      nfcData: `NFC_${uuidv4()}`,
      securityLevel,
      zones: this.getZonesForSecurityLevel(securityLevel),
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'Active',
      lastScan: new Date(),
      scanHistory: []
    };

    this.system.badges.push(badge);
    return badge;
  }

  private getZonesForSecurityLevel(level: number): string[] {
    const securityLevel = this.system.securityLevels.find(sl => sl.level === level);
    return securityLevel ? securityLevel.zones : ['Public'];
  }

  public getBadgeById(id: string): Badge | undefined {
    return this.system.badges.find(badge => badge.id === id);
  }

  public getSystemStatus(): AccreditationSystem {
    return this.system;
  }

  public getKioskStatus(): AccreditationKiosk[] {
    return this.system.kiosks;
  }

  public getScannerStatus(): BadgeScanner[] {
    return this.system.scanners;
  }

  public getMetrics(): any {
    const totalBadges = this.system.badges.length;
    const activeBadges = this.system.badges.filter(b => b.status === 'Active').length;
    const recentScans = this.system.badges.reduce((total, badge) => 
      total + badge.scanHistory.filter(scan => 
        (Date.now() - scan.timestamp.getTime()) < 3600000 // 1 hour
      ).length, 0
    );

    return {
      totalBadges,
      activeBadges,
      recentScans,
      kiosksOnline: this.system.kiosks.filter(k => k.status === 'Online').length,
      scannersOnline: this.system.scanners.filter(s => s.status === 'Online').length,
      offlineScansPending: this.system.scanners.reduce((total, scanner) => total + scanner.offlineScans, 0)
    };
  }
}