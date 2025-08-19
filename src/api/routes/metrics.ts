import express from 'express';
import { simulatorServer } from '../../server';
import { logger } from '../../utils/logger';

const router = express.Router();

// Get all current metrics
router.get('/', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state) {
      return res.status(404).json({
        error: 'No simulation initialized'
      });
    }

    res.json({
      metrics: state.metrics,
      timestamp: new Date().toISOString(),
      currentTime: state.currentTime
    });
  } catch (error) {
    logger.error('Error getting metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attendance metrics
router.get('/attendance', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state || !state.metrics) {
      return res.status(404).json({
        error: 'No metrics available'
      });
    }

    res.json({
      attendance: state.metrics.attendance || {
        total: 0,
        current: 0,
        capacity: state.festival?.capacity || 0,
        averageSatisfaction: 0,
        demographicBreakdown: {}
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting attendance metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get financial metrics
router.get('/financial', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state || !state.metrics) {
      return res.status(404).json({
        error: 'No metrics available'
      });
    }

    res.json({
      financial: state.metrics.financial || {
        revenue: 0,
        costs: 0,
        profit: 0,
        ticketSales: 0,
        vendorRevenue: 0,
        sponsorshipRevenue: 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting financial metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get safety metrics
router.get('/safety', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state || !state.metrics) {
      return res.status(404).json({
        error: 'No metrics available'
      });
    }

    res.json({
      safety: state.metrics.safety || {
        incidents: 0,
        criticalIncidents: 0,
        medicalCalls: 0,
        securityAlerts: 0,
        overallSafetyScore: 100
      },
      incidents: state.incidents || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting safety metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get weather metrics
router.get('/weather', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state || !state.festival) {
      return res.status(404).json({
        error: 'No festival data available'
      });
    }

    res.json({
      weather: {
        current: state.festival.weather?.current || {},
        forecast: state.festival.weather?.forecast || [],
        impact: state.metrics?.weather?.impact || {}
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting weather metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get operational metrics
router.get('/operations', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state || !state.metrics) {
      return res.status(404).json({
        error: 'No metrics available'
      });
    }

    res.json({
      operations: {
        logistics: state.metrics.logistics || {},
        technical: state.metrics.technical || {},
        staff: state.metrics.staff || {},
        vendors: state.metrics.vendors || {},
        power: state.metrics.power || {}
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting operational metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get performance metrics
router.get('/performance', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state || !state.metrics) {
      return res.status(404).json({
        error: 'No metrics available'
      });
    }

    res.json({
      performance: state.metrics.performance || {
        artistSatisfaction: 0,
        technicalIssues: 0,
        soundQuality: 100,
        stageUtilization: 0,
        audienceEngagement: 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting performance metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sustainability metrics
router.get('/sustainability', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state || !state.metrics) {
      return res.status(404).json({
        error: 'No metrics available'
      });
    }

    res.json({
      sustainability: {
        carbonFootprint: state.metrics.sustainability?.carbonFootprint || 0,
        wasteGeneration: state.metrics.sustainability?.wasteGeneration || 0,
        recyclingRate: state.metrics.sustainability?.recyclingRate || 0,
        energyConsumption: state.metrics.sustainability?.energyConsumption || 0,
        renewableEnergyUsage: state.metrics.sustainability?.renewableEnergyUsage || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting sustainability metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get historical metrics
router.get('/history', (req, res) => {
  try {
    const { timeRange = '1h', metric = 'all' } = req.query;
    
    // This would require implementing a metrics history storage system
    // For now, return placeholder structure
    
    res.json({
      timeRange,
      metric,
      data: [], // Historical data points would go here
      message: 'Historical metrics storage not yet implemented',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting historical metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get alerts
router.get('/alerts', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state) {
      return res.status(404).json({
        error: 'No simulation initialized'
      });
    }

    res.json({
      alerts: state.alerts || [],
      incidents: state.incidents || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;