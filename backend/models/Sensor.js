import { pool } from '../config/database.js';

class Sensor {
  // Get all sensors
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT s.*, b.name as bedroom_name 
      FROM sensors s
      JOIN bedrooms b ON s.bedroom_id = b.id
      ORDER BY s.created_at DESC
    `);
    return rows;
  }

  // Get sensors by bedroom ID
  static async getByBedroomId(bedroomId) {
    const [rows] = await pool.query(`
      SELECT s.*, b.name as bedroom_name 
      FROM sensors s
      JOIN bedrooms b ON s.bedroom_id = b.id
      WHERE s.bedroom_id = ?
      ORDER BY s.created_at DESC
    `, [bedroomId]);
    return rows;
  }

  // Get sensor by ID
  static async getById(id) {
    const [rows] = await pool.query(`
      SELECT s.*, b.name as bedroom_name 
      FROM sensors s
      JOIN bedrooms b ON s.bedroom_id = b.id
      WHERE s.id = ?
    `, [id]);
    return rows[0];
  }

  // Create new sensor
  static async create(sensorData) {
    const { bedroom_id, name, type, unit, min_value, max_value, is_active } = sensorData;
    
    const [result] = await pool.query(
      `INSERT INTO sensors (bedroom_id, name, type, unit, min_value, max_value, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [bedroom_id, name, type, unit, min_value, max_value, is_active !== undefined ? is_active : true]
    );
    
    return this.getById(result.insertId);
  }

  // Update sensor
  static async update(id, sensorData) {
    const { bedroom_id, name, type, unit, min_value, max_value, is_active } = sensorData;
    
    await pool.query(
      `UPDATE sensors 
       SET bedroom_id = ?, name = ?, type = ?, unit = ?, min_value = ?, max_value = ?, is_active = ?
       WHERE id = ?`,
      [bedroom_id, name, type, unit, min_value, max_value, is_active, id]
    );
    
    return this.getById(id);
  }

  // Delete sensor
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM sensors WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get all active sensors for simulation
  static async getActiveSensors() {
    const [rows] = await pool.query(`
      SELECT s.*, b.name as bedroom_name 
      FROM sensors s
      JOIN bedrooms b ON s.bedroom_id = b.id
      WHERE s.is_active = TRUE
      ORDER BY s.bedroom_id, s.id
    `);
    return rows;
  }

  // Toggle sensor active status
  static async toggleActive(id) {
    await pool.query(
      'UPDATE sensors SET is_active = NOT is_active WHERE id = ?',
      [id]
    );
    return this.getById(id);
  }

  // Check if sensor exists
  static async exists(id) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM sensors WHERE id = ?',
      [id]
    );
    return rows[0].count > 0;
  }
}

export default Sensor;
