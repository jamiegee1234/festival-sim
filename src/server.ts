import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { SimulationEngine } from './core/SimulationEngine';
import { FestivalFactory } from './factories/FestivalFactory';
import { SettingsFactory } from './factories/SettingsFactory';
import { Festival, SimulationSettings } from './types';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

export class FestivalSimulatorServer {
  private app: express.Application;
  private server: http.Server;
  private io: SocketIOServer;
  private simulationEngine: SimulationEngine | null = null;
  private festival: Festival | null = null;
  private settings: SimulationSettings;
  private connectedClients: Set<string> = new Set();

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    this.settings = SettingsFactory.createDefaultSettings();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
    this.setupSimulationEventHandlers();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      limit: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP'
    });
    this.app.use('/api', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });

    // Static files for frontend (if serving from same server)
    this.app.use(express.static('public'));
  }

  private setupRoutes(): void {
    // Import routes here to avoid circular dependencies
    const simulationRoutes = require('./api/routes/simulation').default;
    const festivalRoutes = require('./api/routes/festival').default;
    const metricsRoutes = require('./api/routes/metrics').default;
    const adminRoutes = require('./api/routes/admin').default;

    // API routes
    this.app.use('/api/v1/simulation', simulationRoutes);
    this.app.use('/api/v1/festival', festivalRoutes);
    this.app.use('/api/v1/metrics', metricsRoutes);
    this.app.use('/api/v1/admin', adminRoutes);

    // API info endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'Festival Simulator API',
        version: '1.0.0',
        description: 'REST API for the Festival Simulator',
        endpoints: {
          simulation: '/api/v1/simulation',
          festival: '/api/v1/festival',
          metrics: '/api/v1/metrics',
          admin: '/api/v1/admin'
        }
      });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        simulation: {
          running: this.simulationEngine?.isSimulationRunning() || false,
          festival: this.festival?.name || null
        }
      });
    });

    // Catch all for SPA routing
    this.app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      // Serve index.html for frontend routing
      res.sendFile('index.html', { root: 'public' });
    });

    // Error handling middleware (must be last)
    this.app.use(errorHandler);
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      const clientId = socket.id;
      this.connectedClients.add(clientId);
      
      logger.info(`Client connected: ${clientId}`);
      
      // Send current simulation state to new client
      if (this.simulationEngine) {
        socket.emit('simulationState', {
          festival: this.festival,
          metrics: this.simulationEngine.getMetrics(),
          status: this.simulationEngine.getFestivalStatus(),
          currentTime: this.simulationEngine.getCurrentTime(),
          isRunning: this.simulationEngine.isSimulationRunning()
        });
      }

      // Handle client requests
      socket.on('startSimulation', () => {
        this.startSimulation();
      });

      socket.on('pauseSimulation', () => {
        this.pauseSimulation();
      });

      socket.on('resumeSimulation', () => {
        this.resumeSimulation();
      });

      socket.on('stopSimulation', () => {
        this.stopSimulation();
      });

      socket.on('createFestival', (festivalData) => {
        this.createFestival(festivalData);
      });

      socket.on('injectEvent', (eventData) => {
        this.injectEvent(eventData);
      });

      socket.on('disconnect', () => {
        this.connectedClients.delete(clientId);
        logger.info(`Client disconnected: ${clientId}`);
      });
    });
  }

  private setupSimulationEventHandlers(): void {
    // These handlers will be set up when a simulation is created
    // They broadcast real-time updates to all connected clients
  }

  public async initializeFestival(festivalData?: Partial<Festival>): Promise<Festival> {
    try {
      this.festival = festivalData 
        ? FestivalFactory.createCustomFestival(festivalData)
        : FestivalFactory.createDefaultFestival();

      this.simulationEngine = new SimulationEngine(this.festival, this.settings);
      
      // Set up event listeners for real-time broadcasting
      this.simulationEngine.on('simulationStarted', (data) => {
        this.io.emit('simulationStarted', data);
      });

      this.simulationEngine.on('tick', (data) => {
        // Broadcast every few ticks to avoid overwhelming clients
        if (data.time.getSeconds() % 5 === 0) {
          this.io.emit('simulationTick', data);
        }
      });

      this.simulationEngine.on('weatherChange', (data) => {
        this.io.emit('weatherChange', data);
      });

      this.simulationEngine.on('incident', (data) => {
        this.io.emit('incident', data);
      });

      this.simulationEngine.on('criticalIncident', (data) => {
        this.io.emit('criticalIncident', data);
      });

      this.simulationEngine.on('simulationStopped', (data) => {
        this.io.emit('simulationStopped', data);
      });

      this.simulationEngine.on('error', (data) => {
        this.io.emit('simulationError', data);
      });

      logger.info(`Festival "${this.festival.name}" initialized`);
      
      // Notify all clients
      this.io.emit('festivalInitialized', { festival: this.festival });

      return this.festival;

    } catch (error) {
      logger.error('Failed to initialize festival:', error);
      throw error;
    }
  }

  public startSimulation(): boolean {
    if (!this.simulationEngine) {
      throw new Error('No simulation engine initialized');
    }

    if (!this.simulationEngine.isSimulationRunning()) {
      this.simulationEngine.start();
      logger.info('Simulation started');
      return true;
    }
    
    return false;
  }

  public pauseSimulation(): boolean {
    if (this.simulationEngine && this.simulationEngine.isSimulationRunning()) {
      this.simulationEngine.pause();
      logger.info('Simulation paused');
      return true;
    }
    return false;
  }

  public resumeSimulation(): boolean {
    if (this.simulationEngine && !this.simulationEngine.isSimulationRunning()) {
      this.simulationEngine.resume();
      logger.info('Simulation resumed');
      return true;
    }
    return false;
  }

  public stopSimulation(): boolean {
    if (this.simulationEngine) {
      this.simulationEngine.stop();
      logger.info('Simulation stopped');
      return true;
    }
    return false;
  }

  public createFestival(festivalData: Partial<Festival>): void {
    this.initializeFestival(festivalData);
  }

  public injectEvent(eventData: any): void {
    if (this.simulationEngine) {
      // This would trigger custom events in the simulation
      logger.info('Event injected:', eventData);
      this.io.emit('eventInjected', eventData);
    }
  }

  public getSimulationState() {
    if (!this.simulationEngine || !this.festival) {
      return null;
    }

    return {
      festival: this.festival,
      metrics: this.simulationEngine.getMetrics(),
      incidents: this.simulationEngine.getIncidents(),
      alerts: this.simulationEngine.getAlerts(),
      status: this.simulationEngine.getFestivalStatus(),
      currentTime: this.simulationEngine.getCurrentTime(),
      isRunning: this.simulationEngine.isSimulationRunning(),
      connectedClients: this.connectedClients.size
    };
  }

  public async start(port: number = 8080): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(port, () => {
        logger.info(`🎪 Festival Simulator Server running on port ${port}`);
        logger.info(`🌐 WebSocket server initialized`);
        logger.info(`📊 API endpoints available at http://localhost:${port}/api`);
        resolve();
      });

      this.server.on('error', (error) => {
        logger.error('Server failed to start:', error);
        reject(error);
      });
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.simulationEngine) {
        this.simulationEngine.stop();
      }

      this.server.close(() => {
        logger.info('Server stopped');
        resolve();
      });
    });
  }
}