import Sensor from '../models/Sensor.js';
import SensorLog from '../models/SensorLog.js';
import SimulationConfig from '../models/SimulationConfig.js';

class SimulationService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  // Generate random value within sensor range
  generateValue(minValue, maxValue) {
    const min = parseFloat(minValue);
    const max = parseFloat(maxValue);
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(2));
  }

  // Generate readings for all active sensors
  async generateReadings() {
    try {
      const activeSensors = await Sensor.getActiveSensors();
      
      if (activeSensors.length === 0) {
        console.log('No active sensors found for simulation');
        return [];
      }

      const readings = activeSensors.map(sensor => ({
        sensor_id: sensor.id,
        room_name: sensor.bedroom_name,
        sensor_name: sensor.name,
        value: this.generateValue(sensor.min_value, sensor.max_value)
      }));

      // Bulk insert all readings
      await SensorLog.bulkCreate(readings);
      
      console.log(`Generated ${readings.length} sensor readings at ${new Date().toISOString()}`);
      return readings;
    } catch (error) {
      console.error('Error generating readings:', error.message);
      throw error;
    }
  }

  // Start simulation
  async start(intervalMs = null) {
    if (this.isRunning) {
      return { success: false, message: 'Simulation is already running' };
    }

    try {
      // Get interval from database config or use provided value
      let interval = intervalMs;
      if (!interval) {
        const config = await SimulationConfig.getConfig();
        interval = config.interval_ms;
      }

      // Update config
      await SimulationConfig.update({ is_running: true, interval_ms: interval });

      // Generate first reading immediately
      await this.generateReadings();

      // Set up interval for subsequent readings
      this.intervalId = setInterval(async () => {
        try {
          await this.generateReadings();
        } catch (error) {
          console.error('Error in simulation interval:', error.message);
        }
      }, interval);

      this.isRunning = true;      
      return { 
        success: true, 
        message: 'Simulation started successfully',
        interval_ms: interval 
      };
    } catch (error) {
      console.error('Failed to start simulation:', error.message);
      throw error;
    }
  }

  // Stop simulation
  async stop() {
    if (!this.isRunning) {
      return { success: false, message: 'Simulation is not running' };
    }

    try {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

      this.isRunning = false;
      await SimulationConfig.updateStatus(false);
      return { success: true, message: 'Simulation stopped successfully' };
    } catch (error) {
      console.error('Failed to stop simulation:', error.message);
      throw error;
    }
  }

  // Restart simulation with new interval
  async restart(intervalMs) {
    await this.stop();
    return await this.start(intervalMs);
  }

  // Get simulation status
  async getStatus() {
    const config = await SimulationConfig.getConfig();
    return {
      is_running: this.isRunning,
      interval_ms: config.interval_ms,
      interval_seconds: config.interval_ms / 1000
    };
  }

  // Update interval without stopping
  async updateInterval(intervalMs) {
    const wasRunning = this.isRunning;
    
    if (wasRunning) {
      await this.stop();
    }

    await SimulationConfig.updateInterval(intervalMs);

    if (wasRunning) {
      await this.start(intervalMs);
    }

    return {
      success: true,
      message: 'Interval updated successfully',
      interval_ms: intervalMs,
      is_running: this.isRunning
    };
  }
}

// Create singleton instance
const simulationService = new SimulationService();

export default simulationService;
