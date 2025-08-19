import express from 'express';
import { simulatorServer } from '../../server';
import { FestivalFactory } from '../../factories/FestivalFactory';
import { logger } from '../../utils/logger';

const router = express.Router();

// Get current festival
router.get('/', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state || !state.festival) {
      return res.status(404).json({
        error: 'No festival initialized'
      });
    }

    res.json(state.festival);
  } catch (error) {
    logger.error('Error getting festival:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new festival
router.post('/', async (req, res) => {
  try {
    const festivalData = req.body;
    
    // Validate required fields
    if (!festivalData.name) {
      return res.status(400).json({
        error: 'Festival name is required'
      });
    }

    const festival = await simulatorServer.initializeFestival(festivalData);
    
    res.status(201).json({
      success: true,
      message: 'Festival created successfully',
      festival
    });
  } catch (error) {
    logger.error('Error creating festival:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Get festival templates
router.get('/templates', (req, res) => {
  try {
    const templates = [
      {
        id: 'default',
        name: 'Default Festival',
        description: 'A standard 3-day music festival',
        genre: 'Mixed',
        capacity: 50000,
        duration: 3
      },
      {
        id: 'electronic',
        name: 'Electronic Music Festival',
        description: 'High-energy electronic music event',
        genre: 'Electronic',
        capacity: 30000,
        duration: 2
      },
      {
        id: 'rock',
        name: 'Rock Festival',
        description: 'Classic rock and metal festival',
        genre: 'Rock',
        capacity: 75000,
        duration: 4
      },
      {
        id: 'indie',
        name: 'Indie Music Festival',
        description: 'Independent artists showcase',
        genre: 'Indie',
        capacity: 25000,
        duration: 3
      }
    ];

    res.json({ templates });
  } catch (error) {
    logger.error('Error getting festival templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create festival from template
router.post('/templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const customizations = req.body;

    let festival;
    
    switch (templateId) {
      case 'default':
        festival = FestivalFactory.createDefaultFestival();
        break;
      case 'electronic':
        festival = FestivalFactory.createElectronicFestival();
        break;
      case 'rock':
        festival = FestivalFactory.createRockFestival();
        break;
      case 'indie':
        festival = FestivalFactory.createIndieFestival();
        break;
      default:
        return res.status(404).json({
          error: 'Template not found'
        });
    }

    // Apply customizations
    if (customizations.name) festival.name = customizations.name;
    if (customizations.capacity) festival.capacity = customizations.capacity;
    if (customizations.theme) festival.theme = customizations.theme;

    await simulatorServer.initializeFestival(festival);
    
    res.status(201).json({
      success: true,
      message: `Festival created from ${templateId} template`,
      festival
    });
  } catch (error) {
    logger.error('Error creating festival from template:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Get festival venues
router.get('/venues', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state || !state.festival) {
      return res.status(404).json({
        error: 'No festival initialized'
      });
    }

    res.json({
      venue: state.festival.venue,
      stages: state.festival.stages,
      areas: state.festival.areas
    });
  } catch (error) {
    logger.error('Error getting festival venues:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get festival schedule
router.get('/schedule', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state || !state.festival) {
      return res.status(404).json({
        error: 'No festival initialized'
      });
    }

    res.json({
      artists: state.festival.artists,
      schedule: state.festival.schedule,
      startDate: state.festival.startDate,
      endDate: state.festival.endDate
    });
  } catch (error) {
    logger.error('Error getting festival schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get festival vendors
router.get('/vendors', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state || !state.festival) {
      return res.status(404).json({
        error: 'No festival initialized'
      });
    }

    res.json({
      vendors: state.festival.vendors || []
    });
  } catch (error) {
    logger.error('Error getting festival vendors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get festival staff
router.get('/staff', (req, res) => {
  try {
    const state = simulatorServer.getSimulationState();
    
    if (!state || !state.festival) {
      return res.status(404).json({
        error: 'No festival initialized'
      });
    }

    res.json({
      staff: state.festival.staff || []
    });
  } catch (error) {
    logger.error('Error getting festival staff:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;