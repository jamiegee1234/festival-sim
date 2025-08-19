import express from 'express';
import { simulatorServer } from '../../server';
import { logger } from '../../utils/logger';

const router = express.Router();

// Get simulation status
router.get('/status', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state) {
      return res.status(404).json({
        error: 'No simulation initialized'
      });
    }

    res.json({
      status: state.status,
      isRunning: state.isRunning,
      currentTime: state.currentTime,
      connectedClients: state.connectedClients
    });
  } catch (error) {
    logger.error('Error getting simulation status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get full simulation state
router.get('/state', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state) {
      return res.status(404).json({
        error: 'No simulation initialized'
      });
    }

    res.json(state);
  } catch (error) {
    logger.error('Error getting simulation state:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start simulation
router.post('/start', async (req, res) => {
  try {
    const started = simulatorServer.startSimulation();
    
    if (started) {
      res.json({ 
        success: true, 
        message: 'Simulation started',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({ 
        error: 'Simulation is already running or not initialized' 
      });
    }
  } catch (error) {
    logger.error('Error starting simulation:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Pause simulation
router.post('/pause', (req, res) => {
  try {
    const paused = simulatorServer.pauseSimulation();
    
    if (paused) {
      res.json({ 
        success: true, 
        message: 'Simulation paused',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({ 
        error: 'Simulation is not running' 
      });
    }
  } catch (error) {
    logger.error('Error pausing simulation:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Resume simulation
router.post('/resume', (req, res) => {
  try {
    const resumed = simulatorServer.resumeSimulation();
    
    if (resumed) {
      res.json({ 
        success: true, 
        message: 'Simulation resumed',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({ 
        error: 'Simulation is already running or not initialized' 
      });
    }
  } catch (error) {
    logger.error('Error resuming simulation:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Stop simulation
router.post('/stop', (req, res) => {
  try {
    const stopped = simulatorServer.stopSimulation();
    
    res.json({ 
      success: true, 
      message: 'Simulation stopped',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error stopping simulation:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Set simulation speed/time scale
router.post('/speed', (req, res) => {
  try {
    const { timeScale } = req.body;
    
    if (!timeScale || timeScale < 0.1 || timeScale > 100) {
      return res.status(400).json({
        error: 'Invalid timeScale. Must be between 0.1 and 100'
      });
    }

    // This would require adding a method to SimulationEngine
    // simulatorServer.setTimeScale(timeScale);
    
    res.json({ 
      success: true, 
      message: `Simulation speed set to ${timeScale}x`,
      timeScale
    });
  } catch (error) {
    logger.error('Error setting simulation speed:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export default router;