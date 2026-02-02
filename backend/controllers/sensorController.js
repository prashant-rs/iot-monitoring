import Sensor from '../models/Sensor.js';
import Bedroom from '../models/Bedroom.js';

// Get all sensors
export const getAllSensors = async (req, res) => {
  try {
    const sensors = await Sensor.getAll();
    res.json({
      success: true,
      data: sensors
    });
  } catch (error) {
    console.error('Error fetching sensors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sensors',
      error: error.message
    });
  }
};

// Get sensors by bedroom ID
export const getSensorsByBedroomId = async (req, res) => {
  try {
    const { bedroomId } = req.params;
    
    const bedroomExists = await Bedroom.exists(bedroomId);
    if (!bedroomExists) {
      return res.status(404).json({
        success: false,
        message: 'Bedroom not found'
      });
    }
    
    const sensors = await Sensor.getByBedroomId(bedroomId);
    res.json({
      success: true,
      data: sensors
    });
  } catch (error) {
    console.error('Error fetching sensors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sensors',
      error: error.message
    });
  }
};

// Get sensor by ID
export const getSensorById = async (req, res) => {
  try {
    const { id } = req.params;
    const sensor = await Sensor.getById(id);
    
    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }
    
    res.json({
      success: true,
      data: sensor
    });
  } catch (error) {
    console.error('Error fetching sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sensor',
      error: error.message
    });
  }
};

// Create new sensor
export const createSensor = async (req, res) => {
  try {
    const { bedroom_id, name, type, unit, min_value, max_value, is_active } = req.body;
    
    // Validate required fields
    if (!bedroom_id || !name || !type || !unit || min_value === undefined || max_value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: bedroom_id, name, type, unit, min_value, max_value'
      });
    }
    
    // Validate type
    if (!['temperature', 'humidity'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sensor type. Must be "temperature" or "humidity"'
      });
    }
    
    // Validate bedroom exists
    const bedroomExists = await Bedroom.exists(bedroom_id);
    if (!bedroomExists) {
      return res.status(404).json({
        success: false,
        message: 'Bedroom not found'
      });
    }
    
    // Validate min/max values
    const min = parseFloat(min_value);
    const max = parseFloat(max_value);
    
    if (isNaN(min) || isNaN(max)) {
      return res.status(400).json({
        success: false,
        message: 'min_value and max_value must be valid numbers'
      });
    }
    
    if (min >= max) {
      return res.status(400).json({
        success: false,
        message: 'min_value must be less than max_value'
      });
    }
    
    const sensor = await Sensor.create({
      bedroom_id,
      name: name.trim(),
      type,
      unit: unit.trim(),
      min_value: min,
      max_value: max,
      is_active
    });
    
    res.status(201).json({
      success: true,
      message: 'Sensor created successfully',
      data: sensor
    });
  } catch (error) {
    console.error('Error creating sensor:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Sensor with this name already exists in this bedroom'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create sensor',
      error: error.message
    });
  }
};

// Update sensor
export const updateSensor = async (req, res) => {
  try {
    const { id } = req.params;
    const { bedroom_id, name, type, unit, min_value, max_value, is_active } = req.body;
    
    const exists = await Sensor.exists(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }
    
    // Validate required fields
    if (!bedroom_id || !name || !type || !unit || min_value === undefined || max_value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Validate type
    if (!['temperature', 'humidity'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sensor type'
      });
    }
    
    // Validate bedroom exists
    const bedroomExists = await Bedroom.exists(bedroom_id);
    if (!bedroomExists) {
      return res.status(404).json({
        success: false,
        message: 'Bedroom not found'
      });
    }
    
    // Validate min/max values
    const min = parseFloat(min_value);
    const max = parseFloat(max_value);
    
    if (isNaN(min) || isNaN(max)) {
      return res.status(400).json({
        success: false,
        message: 'min_value and max_value must be valid numbers'
      });
    }
    
    if (min >= max) {
      return res.status(400).json({
        success: false,
        message: 'min_value must be less than max_value'
      });
    }
    
    const sensor = await Sensor.update(id, {
      bedroom_id,
      name: name.trim(),
      type,
      unit: unit.trim(),
      min_value: min,
      max_value: max,
      is_active
    });
    
    res.json({
      success: true,
      message: 'Sensor updated successfully',
      data: sensor
    });
  } catch (error) {
    console.error('Error updating sensor:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Sensor with this name already exists in this bedroom'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update sensor',
      error: error.message
    });
  }
};

// Delete sensor
export const deleteSensor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exists = await Sensor.exists(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }
    
    const deleted = await Sensor.delete(id);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete sensor'
      });
    }
    
    res.json({
      success: true,
      message: 'Sensor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sensor',
      error: error.message
    });
  }
};

// Toggle sensor active status
export const toggleSensorActive = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exists = await Sensor.exists(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }
    
    const sensor = await Sensor.toggleActive(id);
    
    res.json({
      success: true,
      message: `Sensor ${sensor.is_active ? 'activated' : 'deactivated'} successfully`,
      data: sensor
    });
  } catch (error) {
    console.error('Error toggling sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle sensor status',
      error: error.message
    });
  }
};
