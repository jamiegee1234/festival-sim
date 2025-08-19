import express from 'express';
import { simulatorServer } from '../../server';
import { logger } from '../../utils/logger';

const router = express.Router();

// Basic auth middleware for admin routes (in production, use proper JWT/OAuth)
const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-token';
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  const token = authHeader.substring(7);
  if (token !== adminToken) {
    return res.status(403).json({ error: 'Invalid admin token' });
  }
  
  next();
};

// Apply admin auth to all routes
router.use(adminAuth);

// Get system status
router.get('/system', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    res.json({
      system: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      },
      simulation: state ? {
        initialized: true,
        running: state.isRunning,
        festival: state.festival?.name,
        connectedClients: state.connectedClients
      } : {
        initialized: false
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting system status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Inject custom event
router.post('/events', (req, res) => {
  try {
    const eventData = req.body;
    
    if (!eventData.type) {
      return res.status(400).json({
        error: 'Event type is required'
      });
    }

    simulatorServer.injectEvent(eventData);
    
    logger.info('Admin event injected:', eventData);
    
    res.json({
      success: true,
      message: 'Event injected successfully',
      event: eventData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error injecting event:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Get available event types for injection
router.get('/events/types', (req, res) => {
  try {
    const eventTypes = [
      {
        type: 'weather',
        description: 'Weather event',
        parameters: {
          condition: ['rain', 'storm', 'heat', 'cold'],
          severity: 'number (1-10)',
          duration: 'number (minutes)'
        }
      },
      {
        type: 'technical',
        description: 'Technical issue',
        parameters: {
          system: ['sound', 'lighting', 'stage', 'power'],
          severity: 'number (1-10)',
          location: 'string'
        }
      },
      {
        type: 'safety',
        description: 'Safety incident',
        parameters: {
          incident: ['medical', 'accident', 'security'],
          severity: 'number (1-10)',
          location: 'string'
        }
      },
      {
        type: 'crowd',
        description: 'Crowd management event',
        parameters: {
          event: ['surge', 'bottleneck', 'evacuation'],
          location: 'string',
          peopleAffected: 'number'
        }
      },
      {
        type: 'artist',
        description: 'Artist-related event',
        parameters: {
          artist: 'string',
          event: ['late', 'cancelled', 'extended', 'illness'],
          impact: 'number (1-10)'
        }
      },
      {
        type: 'vendor',
        description: 'Vendor-related event',
        parameters: {
          vendor: 'string',
          event: ['shortage', 'quality_issue', 'closed'],
          impact: 'number (1-10)'
        }
      }
    ];

    res.json({
      eventTypes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting event types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get debug information
router.get('/debug', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    res.json({
      debug: {
        simulationState: state,
        systemEngines: {
          // This would show internal engine states in debug mode
          weather: 'active',
          crowd: 'active',
          financial: 'active',
          safety: 'active',
          // ... other engines
        },
        performance: {
          tickRate: '1000ms',
          lastTick: new Date().toISOString(),
          memoryUsage: process.memoryUsage()
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting debug info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset simulation
router.post('/reset', async (req, res) => {
  try {
    // Stop current simulation
    simulatorServer.stopSimulation();
    
    // Create new default festival
    const festival = await simulatorServer.initializeFestival();
    
    logger.info('Simulation reset by admin');
    
    res.json({
      success: true,
      message: 'Simulation reset successfully',
      festival: festival.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error resetting simulation:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Update simulation settings
router.put('/settings', (req, res) => {
  try {
    const settings = req.body;
    
    // This would require implementing settings update in SimulationEngine
    logger.info('Admin updated settings:', settings);
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating settings:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Get connected clients
router.get('/clients', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    res.json({
      connectedClients: state?.connectedClients || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting client info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Server logs (last N entries)
router.get('/logs', (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    // This would require implementing log storage/retrieval
    res.json({
      logs: [], // Would contain recent log entries
      limit: Number(limit),
      message: 'Log storage not yet implemented',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;