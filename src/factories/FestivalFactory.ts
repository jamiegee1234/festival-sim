import { Festival, Venue, Stage, Facility, Artist, Performance, Budget, WeatherSystem, PerformanceSchedule } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class FestivalFactory {
  public static createDefaultFestival(): Festival {
    const startDate = new Date();
    startDate.setHours(12, 0, 0, 0); // Start at noon
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2); // 3-day festival
    
    const venue = this.createDefaultVenue();
    const artists = this.createDefaultArtists();
    const schedule = this.createDefaultSchedule(artists, startDate);
    const budget = this.createDefaultBudget();
    const weather = this.createDefaultWeather();
    
    return {
      id: uuidv4(),
      name: 'Electric Dreams Festival 2024',
      genre: 'EDM',
      theme: 'Futuristic',
      startDate,
      endDate,
      venue,
      capacity: 15000,
      currentAttendees: 0,
      budget,
      status: 'Planning',
      weather,
      schedule,
      vendors: this.createDefaultVendors(),
      artists,
      staff: this.createDefaultStaff(),
      incidents: [],
      metrics: this.createDefaultMetrics(),
      settings: {
        timeScale: 1,
        aiComplexity: 0.8,
        realismLevel: 0.9,
        difficulty: 'Normal',
        features: [],
        plugins: []
      }
    };
  }

  private static createDefaultVenue(): Venue {
    return {
      id: uuidv4(),
      name: 'Neon Valley Complex',
      type: 'Hybrid',
      location: {
        x: 500,
        y: 500,
        zone: 'Main Complex',
        coordinates: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      },
      capacity: {
        maxAttendees: 15000,
        maxStaff: 2000,
        maxArtists: 50,
        maxVendors: 100,
        fireCodeLimit: 15000,
        currentOccupancy: 0
      },
      stages: this.createDefaultStages(),
      facilities: this.createDefaultFacilities(),
      restrictions: {
        noiseCurfew: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        maxDbLevel: 95,
        alcoholLicense: true,
        alcoholHours: {
          start: new Date(Date.now() + 12 * 60 * 60 * 1000),
          end: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 12 * 60 * 60 * 1000
        },
        ageRestriction: 18,
        capacityLimit: 15000,
        fireCodeCompliance: true,
        accessibilityRequirements: ['Wheelchair Access', 'Hearing Assistance', 'Visual Assistance']
      },
      permits: this.createDefaultPermits(),
      layout: this.createDefaultLayout()
    };
  }

  private static createDefaultStages(): any[] {
    return [
      {
        id: uuidv4(),
        name: 'Main Stage',
        capacity: 8000,
        equipment: {
          audio: {
            paSystem: true,
            monitors: true,
            mixingConsole: true,
            microphones: 8,
            instruments: ['DJ Equipment', 'Synthesizers'],
            status: 'Operational'
          },
          lighting: {
            mainLights: true,
            spotlights: true,
            movingLights: true,
            fogMachine: true,
            lasers: true,
            status: 'Operational'
          },
          video: {
            screens: true,
            projectors: true,
            cameras: true,
            streaming: true,
            status: 'Operational'
          },
          power: {
            generators: true,
            ups: true,
            distribution: true,
            backup: true,
            status: 'Operational'
          },
          special: {
            pyro: false,
            co2: true,
            confetti: true,
            bubbles: false,
            status: 'Operational'
          }
        },
        schedule: {
          performances: [],
          changeovers: [],
          maintenance: [],
          setup: []
        },
        technicalRider: {
          id: uuidv4(),
          requirements: [],
          backline: [],
          soundcheck: {
            startTime: new Date(),
            endTime: new Date(),
            duration: 60 * 60 * 1000,
            critical: true,
            completed: false
          },
          loadIn: {
            startTime: new Date(),
            endTime: new Date(),
            duration: 2 * 60 * 60 * 1000,
            dock: 'Main Dock',
            equipment: [],
            completed: false
          },
          loadOut: {
            startTime: new Date(),
            endTime: new Date(),
            duration: 1 * 60 * 60 * 1000,
            dock: 'Main Dock',
            equipment: [],
            completed: false
          },
          powerRequirements: {
            total: 100,
            phases: 3,
            voltage: 480,
            critical: true,
            backup: true
          },
          lightingRequirements: {
            total: 50,
            dimmers: 48,
            movingLights: 12,
            specialEffects: true,
            programming: true
          },
          specialEffects: []
        },
        changeoverTime: 15 * 60 * 1000 // 15 minutes
      },
      {
        id: uuidv4(),
        name: 'Chill Zone',
        capacity: 3000,
        equipment: {
          audio: {
            paSystem: true,
            monitors: false,
            mixingConsole: true,
            microphones: 4,
            instruments: ['Acoustic', 'DJ Equipment'],
            status: 'Operational'
          },
          lighting: {
            mainLights: true,
            spotlights: false,
            movingLights: false,
            fogMachine: false,
            lasers: false,
            status: 'Operational'
          },
          video: {
            screens: false,
            projectors: false,
            cameras: false,
            streaming: false,
            status: 'Operational'
          },
          power: {
            generators: false,
            ups: false,
            distribution: true,
            backup: false,
            status: 'Operational'
          },
          special: {
            pyro: false,
            co2: false,
            confetti: false,
            bubbles: false,
            status: 'Operational'
          }
        },
        schedule: {
          performances: [],
          changeovers: [],
          maintenance: [],
          setup: []
        },
        technicalRider: {
          id: uuidv4(),
          requirements: [],
          backline: [],
          soundcheck: {
            startTime: new Date(),
            endTime: new Date(),
            duration: 30 * 60 * 1000,
            critical: false,
            completed: false
          },
          loadIn: {
            startTime: new Date(),
            endTime: new Date(),
            duration: 1 * 60 * 60 * 1000,
            dock: 'Side Dock',
            equipment: [],
            completed: false
          },
          loadOut: {
            startTime: new Date(),
            endTime: new Date(),
            duration: 30 * 60 * 1000,
            dock: 'Side Dock',
            equipment: [],
            completed: false
          },
          powerRequirements: {
            total: 30,
            phases: 1,
            voltage: 120,
            critical: false,
            backup: false
          },
          lightingRequirements: {
            total: 20,
            dimmers: 24,
            movingLights: 0,
            specialEffects: false,
            programming: false
          },
          specialEffects: []
        },
        changeoverTime: 10 * 60 * 1000 // 10 minutes
      }
    ];
  }

  private static createDefaultFacilities(): any[] {
    return [
      {
        id: uuidv4(),
        type: 'Toilet',
        capacity: 100,
        currentUsage: 0,
        maintenance: {
          status: 'Operational',
          lastCheck: new Date(),
          nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000),
          issues: []
        },
        location: { x: 300, y: 400, zone: 'Facilities' }
      },
      {
        id: uuidv4(),
        type: 'Bar',
        capacity: 200,
        currentUsage: 0,
        maintenance: {
          status: 'Operational',
          lastCheck: new Date(),
          nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000),
          issues: []
        },
        location: { x: 400, y: 300, zone: 'Food Court' }
      },
      {
        id: uuidv4(),
        type: 'Food',
        capacity: 500,
        currentUsage: 0,
        maintenance: {
          status: 'Operational',
          lastCheck: new Date(),
          nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000),
          issues: []
        },
        location: { x: 500, y: 300, zone: 'Food Court' }
      },
      {
        id: uuidv4(),
        type: 'Medical',
        capacity: 50,
        currentUsage: 0,
        maintenance: {
          status: 'Operational',
          lastCheck: new Date(),
          nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000),
          issues: []
        },
        location: { x: 200, y: 200, zone: 'Services' }
      }
    ];
  }

  private static createDefaultPermits(): any[] {
    return [
      {
        id: uuidv4(),
        type: 'Special Event Permit',
        issuer: 'City of New York',
        issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Active',
        requirements: ['Security Plan', 'Medical Plan', 'Traffic Plan'],
        fees: 5000
      },
      {
        id: uuidv4(),
        type: 'Alcohol License',
        issuer: 'State Liquor Authority',
        issueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        status: 'Active',
        requirements: ['Age Verification', 'Security Staff', 'Training'],
        fees: 2000
      }
    ];
  }

  private static createDefaultLayout(): any {
    return {
      zones: [
        {
          id: uuidv4(),
          name: 'Main Stage',
          type: 'Stage',
          capacity: 8000,
          currentOccupancy: 0,
          boundaries: [],
          facilities: []
        },
        {
          id: uuidv4(),
          name: 'Chill Zone',
          type: 'Stage',
          capacity: 3000,
          currentOccupancy: 0,
          boundaries: [],
          facilities: []
        },
        {
          id: uuidv4(),
          name: 'Food Court',
          type: 'Vendor',
          capacity: 2000,
          currentOccupancy: 0,
          boundaries: [],
          facilities: []
        },
        {
          id: uuidv4(),
          name: 'VIP Area',
          type: 'VIP',
          capacity: 500,
          currentOccupancy: 0,
          boundaries: [],
          facilities: []
        }
      ],
      pathways: [],
      barriers: [],
      emergencyExits: [],
      accessibilityFeatures: []
    };
  }

  private static createDefaultArtists(): Artist[] {
    return [
      {
        id: uuidv4(),
        name: 'Neon Pulse',
        genre: 'EDM',
        tier: 'Headliner',
        technicalRider: {
          id: uuidv4(),
          requirements: [],
          backline: [],
          soundcheck: {
            startTime: new Date(),
            endTime: new Date(),
            duration: 60 * 60 * 1000,
            critical: true,
            completed: false
          },
          loadIn: {
            startTime: new Date(),
            endTime: new Date(),
            duration: 2 * 60 * 60 * 1000,
            dock: 'Main Dock',
            equipment: [],
            completed: false
          },
          loadOut: {
            startTime: new Date(),
            endTime: new Date(),
            duration: 1 * 60 * 60 * 1000,
            dock: 'Main Dock',
            equipment: [],
            completed: false
          },
          powerRequirements: {
            total: 100,
            phases: 3,
            voltage: 480,
            critical: true,
            backup: true
          },
          lightingRequirements: {
            total: 50,
            dimmers: 48,
            movingLights: 12,
            specialEffects: true,
            programming: true
          },
          specialEffects: []
        },
        performance: {
          id: uuidv4(),
          artistId: '',
          stageId: '',
          startTime: new Date(),
          endTime: new Date(),
          duration: 90 * 60 * 1000,
          setlist: [],
          technicalRequirements: [],
          status: 'Scheduled'
        },
        contract: {
          id: uuidv4(),
          fee: 50000,
          deposit: 10000,
          cancellationPolicy: 'Standard',
          radiusClause: 100,
          forceMajeure: true,
          insurance: true,
          penalties: []
        },
        hospitality: {
          id: uuidv4(),
          food: [],
          beverages: [],
          accommodation: {
            type: 'Hotel',
            rooms: 2,
            amenities: ['WiFi', 'Room Service', 'Transportation'],
            location: 'Nearby Hotel',
            critical: true
          },
          transportation: {
            type: 'Limousine',
            capacity: 6,
            timing: '2 hours before performance',
            special: [],
            critical: true
          },
          special: []
        },
        merch: {
          id: uuidv4(),
          items: [],
          cut: 0.3,
          revenue: 0,
          inventory: 0
        },
        status: 'Confirmed'
      }
    ];
  }

  private static createDefaultSchedule(artists: Artist[], startDate: Date): PerformanceSchedule {
    return {
      performances: [],
      changeovers: [],
      breaks: [],
      specialEvents: []
    };
  }

  private static createDefaultBudget(): Budget {
    return {
      total: 1000000,
      allocated: 800000,
      spent: 0,
      revenue: 0,
      profit: 0,
      categories: [
        {
          name: 'Artist Fees',
          allocated: 300000,
          spent: 0,
          remaining: 300000,
          critical: true
        },
        {
          name: 'Venue & Infrastructure',
          allocated: 200000,
          spent: 0,
          remaining: 200000,
          critical: true
        },
        {
          name: 'Staff & Security',
          allocated: 150000,
          spent: 0,
          remaining: 150000,
          critical: true
        },
        {
          name: 'Marketing & Promotion',
          allocated: 100000,
          spent: 0,
          remaining: 100000,
          critical: false
        },
        {
          name: 'Contingency',
          allocated: 50000,
          spent: 0,
          remaining: 50000,
          critical: false
        }
      ],
      projections: []
    };
  }

  private static createDefaultWeather(): WeatherSystem {
    return {
      current: {
        temperature: 22,
        humidity: 60,
        windSpeed: 5,
        windDirection: 180,
        precipitation: 0,
        visibility: 10000,
        uvIndex: 5,
        lightning: false
      },
      forecast: [],
      impact: {
        onCrowd: 0,
        onEquipment: 0,
        onLogistics: 0,
        onSafety: 0,
        onRevenue: 0
      },
      alerts: []
    };
  }

  private static createDefaultVendors(): any[] {
    return [
      {
        id: uuidv4(),
        name: 'Taco Fusion',
        type: 'Food',
        location: { x: 450, y: 320, zone: 'Food Court' },
        capacity: 100,
        currentQueue: 0,
        revenue: 0,
        satisfaction: 0.8,
        healthRating: 95
      },
      {
        id: uuidv4(),
        name: 'Craft Beer Garden',
        type: 'Beverage',
        location: { x: 380, y: 310, zone: 'Food Court' },
        capacity: 150,
        currentQueue: 0,
        revenue: 0,
        satisfaction: 0.9,
        healthRating: 98
      }
    ];
  }

  private static createDefaultStaff(): any[] {
    return [
      {
        id: uuidv4(),
        name: 'John Smith',
        role: 'Manager',
        department: 'Operations',
        skills: [
          { name: 'Event Management', level: 9, certified: true, experience: 10 },
          { name: 'Crisis Management', level: 8, certified: true, experience: 8 }
        ],
        availability: {
          startTime: new Date(),
          endTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
          breaks: [],
          overtime: true,
          emergency: true
        },
        performance: {
          score: 9.2,
          feedback: ['Excellent leadership', 'Great problem solver'],
          improvements: ['Could delegate more'],
          recognition: ['Employee of the Month - March 2024']
        },
        location: { x: 500, y: 500, zone: 'Operations Center' }
      }
    ];
  }

  private static createDefaultMetrics(): any {
    return {
      attendance: {
        total: 0,
        peak: 0,
        average: 0,
        byDay: {},
        byStage: {},
        capacityUtilization: 0
      },
      financial: {
        revenue: 0,
        costs: 0,
        profit: 0,
        roi: 0,
        breakEven: false,
        projections: []
      },
      operational: {
        efficiency: 0.95,
        responseTime: 300,
        incidents: 0,
        staffUtilization: 0.8,
        equipmentUptime: 0.98
      },
      safety: {
        incidents: 0,
        responseTime: 180,
        compliance: 0.98,
        training: 0.95,
        riskLevel: 'Low'
      },
      satisfaction: {
        overall: 0.8,
        byCategory: {},
        feedback: [],
        improvements: []
      },
      environmental: {
        carbonFootprint: 0,
        waste: 0,
        recycling: 0,
        energy: 0,
        water: 0
      }
    };
  }

  // Template-specific festival creators
  public static createElectronicFestival(): Festival {
    const festival = this.createDefaultFestival();
    festival.name = 'Electric Vibes Festival 2024';
    festival.genre = 'Electronic';
    festival.theme = 'Neon Dreams';
    festival.capacity = 30000;
    
    // Adjust for electronic music festival characteristics
    festival.artists = this.createElectronicArtists();
    festival.schedule = this.createDefaultSchedule(festival.artists, festival.startDate);
    
    return festival;
  }

  public static createRockFestival(): Festival {
    const festival = this.createDefaultFestival();
    festival.name = 'Rock Storm Festival 2024';
    festival.genre = 'Rock';
    festival.theme = 'Classic Rock Revival';
    festival.capacity = 75000;
    
    // Adjust for rock festival characteristics
    festival.artists = this.createRockArtists();
    festival.schedule = this.createDefaultSchedule(festival.artists, festival.startDate);
    
    return festival;
  }

  public static createIndieFestival(): Festival {
    const festival = this.createDefaultFestival();
    festival.name = 'Indie Sounds Festival 2024';
    festival.genre = 'Indie';
    festival.theme = 'Underground Culture';
    festival.capacity = 25000;
    
    // Adjust for indie festival characteristics
    festival.artists = this.createIndieArtists();
    festival.schedule = this.createDefaultSchedule(festival.artists, festival.startDate);
    
    return festival;
  }

  public static createCustomFestival(festivalData: Partial<Festival>): Festival {
    const defaultFestival = this.createDefaultFestival();
    
    // Merge custom data with defaults
    return {
      ...defaultFestival,
      ...festivalData,
      // Ensure required fields are preserved
      id: festivalData.id || defaultFestival.id,
      startDate: festivalData.startDate || defaultFestival.startDate,
      endDate: festivalData.endDate || defaultFestival.endDate,
      venue: { ...defaultFestival.venue, ...festivalData.venue },
      budget: { ...defaultFestival.budget, ...festivalData.budget },
      weather: { ...defaultFestival.weather, ...festivalData.weather },
      schedule: festivalData.schedule || defaultFestival.schedule,
      artists: festivalData.artists || defaultFestival.artists,
      vendors: festivalData.vendors || defaultFestival.vendors,
      staff: festivalData.staff || defaultFestival.staff,
      settings: { ...defaultFestival.settings, ...festivalData.settings }
    };
  }

  // Specialized artist creators
  private static createElectronicArtists(): Artist[] {
    return [
      {
        id: uuidv4(),
        name: 'Circuit Break',
        genre: 'Dubstep',
        popularity: 0.85,
        fee: 50000,
        requirements: ['High-end sound system', 'Laser show', 'Fog machines'],
        reputation: 4.7,
        fanBase: 2500000,
        socialMedia: {
          instagram: 850000,
          twitter: 320000,
          facebook: 180000
        },
        riderRequirements: ['Vegan catering', 'Soundcheck 2 hours before']
      },
      {
        id: uuidv4(),
        name: 'Neon Pulse',
        genre: 'Techno',
        popularity: 0.78,
        fee: 35000,
        requirements: ['360-degree sound setup', 'LED visuals'],
        reputation: 4.5,
        fanBase: 1800000,
        socialMedia: {
          instagram: 620000,
          twitter: 180000,
          facebook: 120000
        },
        riderRequirements: ['Energy drinks', 'Late night performance slot']
      },
      {
        id: uuidv4(),
        name: 'Bass Generator',
        genre: 'Bass Music',
        popularity: 0.82,
        fee: 45000,
        requirements: ['Subwoofer array', 'Strobe lights'],
        reputation: 4.6,
        fanBase: 2200000,
        socialMedia: {
          instagram: 780000,
          twitter: 290000,
          facebook: 150000
        },
        riderRequirements: ['High-protein meals', 'Quiet green tent']
      }
    ];
  }

  private static createRockArtists(): Artist[] {
    return [
      {
        id: uuidv4(),
        name: 'Thunder Road',
        genre: 'Classic Rock',
        popularity: 0.88,
        fee: 80000,
        requirements: ['Large stage setup', 'Pyrotechnics', 'Marshall amplifiers'],
        reputation: 4.8,
        fanBase: 3200000,
        socialMedia: {
          instagram: 920000,
          twitter: 450000,
          facebook: 680000
        },
        riderRequirements: ['Full hot meal service', 'Security detail']
      },
      {
        id: uuidv4(),
        name: 'Steel Vengeance',
        genre: 'Heavy Metal',
        popularity: 0.75,
        fee: 55000,
        requirements: ['Heavy duty stage', 'Smoke effects', 'High-gain amplifiers'],
        reputation: 4.4,
        fanBase: 1900000,
        socialMedia: {
          instagram: 580000,
          twitter: 220000,
          facebook: 380000
        },
        riderRequirements: ['Meat-heavy catering', 'Dark backstage area']
      },
      {
        id: uuidv4(),
        name: 'Electric Storm',
        genre: 'Alternative Rock',
        popularity: 0.79,
        fee: 42000,
        requirements: ['Flexible stage lighting', 'Acoustic setup capability'],
        reputation: 4.5,
        fanBase: 2100000,
        socialMedia: {
          instagram: 710000,
          twitter: 310000,
          facebook: 280000
        },
        riderRequirements: ['Organic food options', 'Instrument tuning room']
      }
    ];
  }

  private static createIndieArtists(): Artist[] {
    return [
      {
        id: uuidv4(),
        name: 'Velvet Skies',
        genre: 'Indie Folk',
        popularity: 0.65,
        fee: 25000,
        requirements: ['Acoustic setup', 'Intimate lighting', 'Piano access'],
        reputation: 4.3,
        fanBase: 850000,
        socialMedia: {
          instagram: 380000,
          twitter: 120000,
          facebook: 85000
        },
        riderRequirements: ['Vegetarian catering', 'Quiet preparation space']
      },
      {
        id: uuidv4(),
        name: 'Midnight Canvas',
        genre: 'Indie Rock',
        popularity: 0.68,
        fee: 30000,
        requirements: ['Mid-size stage', 'Creative lighting', 'Multiple instrument setups'],
        reputation: 4.4,
        fanBase: 1200000,
        socialMedia: {
          instagram: 520000,
          twitter: 180000,
          facebook: 95000
        },
        riderRequirements: ['Local craft beer', 'Art supplies in green area']
      },
      {
        id: uuidv4(),
        name: 'Echo Chamber',
        genre: 'Indie Electronic',
        popularity: 0.71,
        fee: 28000,
        requirements: ['Electronic setup', 'Ambient lighting', 'Multiple screens'],
        reputation: 4.2,
        fanBase: 980000,
        socialMedia: {
          instagram: 420000,
          twitter: 150000,
          facebook: 72000
        },
        riderRequirements: ['Healthy snacks', 'Tech setup time']
      }
    ];
  }
}
