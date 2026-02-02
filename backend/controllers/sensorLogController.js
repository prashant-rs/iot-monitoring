import SensorLog from '../models/SensorLog.js';

// Get latest readings for all sensors
export const getLatestReadings = async (req, res) => {
  try {
    const readings = await SensorLog.getLatestReadings();
    res.json({
      success: true,
      data: readings
    });
  } catch (error) {
    console.error('Error fetching latest readings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest readings',
      error: error.message
    });
  }
};

// Get readings by sensor ID
export const getReadingsBySensor = async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { start_time, end_time } = req.query;
    
    const readings = await SensorLog.getBySensorId(sensorId, start_time, end_time);
    res.json({
      success: true,
      data: readings
    });
  } catch (error) {
    console.error('Error fetching sensor readings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sensor readings',
      error: error.message
    });
  }
};

// Get readings by bedroom
export const getReadingsByBedroom = async (req, res) => {
  try {
    const { bedroomName } = req.params;
    const { start_time, end_time } = req.query;
    
    const readings = await SensorLog.getByBedroom(bedroomName, start_time, end_time);
    res.json({
      success: true,
      data: readings
    });
  } catch (error) {
    console.error('Error fetching bedroom readings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bedroom readings',
      error: error.message
    });
  }
};

// Get sensor statistics
export const getSensorStats = async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { start_time, end_time } = req.query;
    
    const stats = await SensorLog.getSensorStats(sensorId, start_time, end_time);
    
    if (!stats) {
      return res.json({
        success: true,
        data: null,
        message: 'No readings found for this sensor'
      });
    }
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching sensor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sensor statistics',
      error: error.message
    });
  }
};

// Get recent readings (last N minutes)
export const getRecentReadings = async (req, res) => {
  try {
    const minutes = parseInt(req.query.minutes) || 10;
    
    if (minutes <= 0 || minutes > 1440) { // Max 24 hours
      return res.status(400).json({
        success: false,
        message: 'Minutes must be between 1 and 1440'
      });
    }
    
    const readings = await SensorLog.getRecentReadings(minutes);
    res.json({
      success: true,
      data: readings,
      minutes
    });
  } catch (error) {
    console.error('Error fetching recent readings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent readings',
      error: error.message
    });
  }
};

// Get all readings with pagination
export const getAllReadings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    if (limit <= 0 || limit > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 1000'
      });
    }
    
    const readings = await SensorLog.getAll(limit, offset);
    res.json({
      success: true,
      data: readings,
      pagination: {
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Error fetching all readings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch readings',
      error: error.message
    });
  }
};
