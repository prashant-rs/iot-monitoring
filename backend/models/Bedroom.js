import { pool } from '../config/database.js';

class Bedroom {
  // Get all bedrooms
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM bedrooms ORDER BY created_at DESC'
    );
    return rows;
  }

  // Get bedroom by ID
  static async getById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM bedrooms WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Create new bedroom
  static async create(bedroomData) {
    const { name, description } = bedroomData;
    const [result] = await pool.query(
      'INSERT INTO bedrooms (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    return this.getById(result.insertId);
  }

  // Update bedroom
  static async update(id, bedroomData) {
    const { name, description } = bedroomData;
    await pool.query(
      'UPDATE bedrooms SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );
    return this.getById(id);
  }

  // Delete bedroom
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM bedrooms WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Check if bedroom exists
  static async exists(id) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM bedrooms WHERE id = ?',
      [id]
    );
    return rows[0].count > 0;
  }

  // Get bedroom with sensors count
  static async getAllWithSensorCount() {
    const [rows] = await pool.query(`
      SELECT 
        b.*, 
        COUNT(s.id) as sensor_count,
        SUM(CASE WHEN s.is_active = 1 THEN 1 ELSE 0 END) as active_sensors
      FROM bedrooms b
      LEFT JOIN sensors s ON b.id = s.bedroom_id
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `);
    return rows;
  }
}

export default Bedroom;
