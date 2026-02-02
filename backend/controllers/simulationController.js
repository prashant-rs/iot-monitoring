import simulationService from '../services/simulationService.js';
import SimulationConfig from '../models/SimulationConfig.js';

// Start simulation
export const startSimulation = async (req, res) => {
  try {
    const { interval_ms } = req.body;
    
    if (interval_ms && (interval_ms < 1000 || interval_ms > 3600000)) {
      return res.status(400).json({
        success: false,
        message: 'Interval must be between 1000ms (1s) and 3600000ms (1hr)'
      });
    }
    
    const result = await simulationService.start(interval_ms);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error starting simulation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start simulation',
      error: error.message
    });
  }
};

// Stop simulation
export const stopSimulation = async (req, res) => {
  try {
    const result = await simulationService.stop();
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error stopping simulation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop simulation',
      error: error.message
    });
  }
};

// Get simulation status
export const getSimulationStatus = async (req, res) => {
  try {
    const status = await simulationService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching simulation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch simulation status',
      error: error.message
    });
  }
};

// Update simulation interval
export const updateSimulationInterval = async (req, res) => {
  try {
    const { interval_ms } = req.body;
    
    if (!interval_ms) {
      return res.status(400).json({
        success: false,
        message: 'interval_ms is required'
      });
    }
    
    if (interval_ms < 1000 || interval_ms > 3600000) {
      return res.status(400).json({
        success: false,
        message: 'Interval must be between 1000ms (1s) and 3600000ms (1hr)'
      });
    }
    
    const result = await simulationService.updateInterval(interval_ms);
    res.json(result);
  } catch (error) {
    console.error('Error updating simulation interval:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update simulation interval',
      error: error.message
    });
  }
};

// Restart simulation
export const restartSimulation = async (req, res) => {
  try {
    const { interval_ms } = req.body;
    
    if (interval_ms && (interval_ms < 1000 || interval_ms > 3600000)) {
      return res.status(400).json({
        success: false,
        message: 'Interval must be between 1000ms (1s) and 3600000ms (1hr)'
      });
    }
    
    const result = await simulationService.restart(interval_ms);
    res.json(result);
  } catch (error) {
    console.error('Error restarting simulation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restart simulation',
      error: error.message
    });
  }
};

// Get simulation configuration
export const getSimulationConfig = async (req, res) => {
  try {
    const config = await SimulationConfig.getConfig();
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching simulation config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch simulation config',
      error: error.message
    });
  }
};

// Update simulation configuration
export const updateSimulationConfig = async (req, res) => {
  try {
    const { interval_ms, is_running } = req.body;
    
    if (interval_ms !== undefined && (interval_ms < 1000 || interval_ms > 3600000)) {
      return res.status(400).json({
        success: false,
        message: 'Interval must be between 1000ms (1s) and 3600000ms (1hr)'
      });
    }
    
    const config = await SimulationConfig.update({ interval_ms, is_running });
    
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Error updating simulation config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update simulation config',
      error: error.message
    });
  }
};
