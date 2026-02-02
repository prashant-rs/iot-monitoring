import Bedroom from '../models/Bedroom.js';

// Get all bedrooms
export const getAllBedrooms = async (req, res) => {
  try {
    const bedrooms = await Bedroom.getAllWithSensorCount();
    res.json({
      success: true,
      data: bedrooms
    });
  } catch (error) {
    console.error('Error fetching bedrooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bedrooms',
      error: error.message
    });
  }
};

// Get bedroom by ID
export const getBedroomById = async (req, res) => {
  try {
    const { id } = req.params;
    const bedroom = await Bedroom.getById(id);
    
    if (!bedroom) {
      return res.status(404).json({
        success: false,
        message: 'Bedroom not found'
      });
    }
    
    res.json({
      success: true,
      data: bedroom
    });
  } catch (error) {
    console.error('Error fetching bedroom:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bedroom',
      error: error.message
    });
  }
};

// Create new bedroom
export const createBedroom = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Bedroom name is required'
      });
    }
    
    const bedroom = await Bedroom.create({ name: name.trim(), description });
    
    res.status(201).json({
      success: true,
      message: 'Bedroom created successfully',
      data: bedroom
    });
  } catch (error) {
    console.error('Error creating bedroom:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Bedroom with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create bedroom',
      error: error.message
    });
  }
};

// Update bedroom
export const updateBedroom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const exists = await Bedroom.exists(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Bedroom not found'
      });
    }
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Bedroom name is required'
      });
    }
    
    const bedroom = await Bedroom.update(id, { name: name.trim(), description });
    
    res.json({
      success: true,
      message: 'Bedroom updated successfully',
      data: bedroom
    });
  } catch (error) {
    console.error('Error updating bedroom:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Bedroom with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update bedroom',
      error: error.message
    });
  }
};

// Delete bedroom
export const deleteBedroom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exists = await Bedroom.exists(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Bedroom not found'
      });
    }
    
    const deleted = await Bedroom.delete(id);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete bedroom'
      });
    }
    
    res.json({
      success: true,
      message: 'Bedroom deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bedroom:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bedroom',
      error: error.message
    });
  }
};
