import { pool } from '../config/database.js';

class SimulationConfig {
  // Get current configuration
  static async getConfig() {
    const [rows] = await pool.query(
      'SELECT * FROM simulation_config LIMIT 1'
    );
    return rows[0];
  }

  // Update interval
  static async updateInterval(intervalMs) {
    await pool.query(
      'UPDATE simulation_config SET interval_ms = ? WHERE id = 1',
      [intervalMs]
    );
    return this.getConfig();
  }

  // Update running status
  static async updateStatus(isRunning) {
    await pool.query(
      'UPDATE simulation_config SET is_running = ? WHERE id = 1',
      [isRunning]
    );
    return this.getConfig();
  }

  // Update both interval and status
  static async update(data) {
    const { interval_ms, is_running } = data;
    
    let query = 'UPDATE simulation_config SET ';
    const params = [];
    const updates = [];

    if (interval_ms !== undefined) {
      updates.push('interval_ms = ?');
      params.push(interval_ms);
    }

    if (is_running !== undefined) {
      updates.push('is_running = ?');
      params.push(is_running);
    }

    if (updates.length === 0) {
      return this.getConfig();
    }

    query += updates.join(', ') + ' WHERE id = 1';
    await pool.query(query, params);
    
    return this.getConfig();
  }
}

export default SimulationConfig;
