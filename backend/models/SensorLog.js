import { pool } from '../config/database.js';

class SensorLog {
  // Create sensor log entry
  static async create(logData) {
    const { sensor_id, room_name, sensor_name, value } = logData;
    
    const [result] = await pool.query(
      `INSERT INTO sensor_logs (sensor_id, room_name, sensor_name, value) 
       VALUES (?, ?, ?, ?)`,
      [sensor_id, room_name, sensor_name, value]
    );
    
    return result.insertId;
  }

  // Bulk insert sensor logs
  static async bulkCreate(logsData) {
    if (logsData.length === 0) return [];

    const values = logsData.map(log => [
      log.sensor_id,
      log.room_name,
      log.sensor_name,
      log.value
    ]);

    const [result] = await pool.query(
      `INSERT INTO sensor_logs (sensor_id, room_name, sensor_name, value) VALUES ?`,
      [values]
    );

    return result.affectedRows;
  }

  // Get latest readings for all sensors
  static async getLatestReadings() {
    const [rows] = await pool.query(`
      SELECT 
        sl.*,
        s.type,
        s.unit,
        b.name as bedroom_name
      FROM sensor_logs sl
      INNER JOIN (
        SELECT sensor_id, MAX(timestamp) as max_timestamp
        FROM sensor_logs
        GROUP BY sensor_id
      ) latest ON sl.sensor_id = latest.sensor_id AND sl.timestamp = latest.max_timestamp
      JOIN sensors s ON sl.sensor_id = s.id
      JOIN bedrooms b ON s.bedroom_id = b.id
      ORDER BY b.name, s.name
    `);
    return rows;
  }

  // Get readings by sensor ID with optional time range
  static async getBySensorId(sensorId, startTime = null, endTime = null) {
    let query = `
      SELECT sl.*, s.type, s.unit, b.name as bedroom_name
      FROM sensor_logs sl
      JOIN sensors s ON sl.sensor_id = s.id
      JOIN bedrooms b ON s.bedroom_id = b.id
      WHERE sl.sensor_id = ?
    `;
    
    const params = [sensorId];
    
    if (startTime) {
      query += ' AND sl.timestamp >= ?';
      params.push(startTime);
    }
    
    if (endTime) {
      query += ' AND sl.timestamp <= ?';
      params.push(endTime);
    }
    
    query += ' ORDER BY sl.timestamp DESC';
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get readings by bedroom with optional time range
  static async getByBedroom(bedroomName, startTime = null, endTime = null) {
    let query = `
      SELECT sl.*, s.type, s.unit
      FROM sensor_logs sl
      JOIN sensors s ON sl.sensor_id = s.id
      WHERE sl.room_name = ?
    `;
    
    const params = [bedroomName];
    
    if (startTime) {
      query += ' AND sl.timestamp >= ?';
      params.push(startTime);
    }
    
    if (endTime) {
      query += ' AND sl.timestamp <= ?';
      params.push(endTime);
    }
    
    query += ' ORDER BY sl.timestamp DESC';
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get statistics for a sensor
  static async getSensorStats(sensorId, startTime = null, endTime = null) {
    let query = `
      SELECT 
        sensor_id,
        room_name,
        sensor_name,
        COUNT(*) as reading_count,
        MIN(value) as min_value,
        MAX(value) as max_value,
        AVG(value) as avg_value,
        MIN(timestamp) as first_reading,
        MAX(timestamp) as last_reading
      FROM sensor_logs
      WHERE sensor_id = ?
    `;
    
    const params = [sensorId];
    
    if (startTime) {
      query += ' AND timestamp >= ?';
      params.push(startTime);
    }
    
    if (endTime) {
      query += ' AND timestamp <= ?';
      params.push(endTime);
    }
    
    query += ' GROUP BY sensor_id, room_name, sensor_name';
    
    const [rows] = await pool.query(query, params);
    return rows[0];
  }

  // Get all readings with pagination
  static async getAll(limit = 100, offset = 0) {
    const [rows] = await pool.query(`
      SELECT sl.*, s.type, s.unit, b.name as bedroom_name
      FROM sensor_logs sl
      JOIN sensors s ON sl.sensor_id = s.id
      JOIN bedrooms b ON s.bedroom_id = b.id
      ORDER BY sl.timestamp DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    return rows;
  }

  // Delete old logs (cleanup)
  static async deleteOlderThan(days) {
    const [result] = await pool.query(
      `DELETE FROM sensor_logs 
       WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days]
    );
    return result.affectedRows;
  }

  // Get recent readings (last N minutes)
  static async getRecentReadings(minutes = 10) {
    const [rows] = await pool.query(`
      SELECT sl.*, s.type, s.unit, b.name as bedroom_name
      FROM sensor_logs sl
      JOIN sensors s ON sl.sensor_id = s.id
      JOIN bedrooms b ON s.bedroom_id = b.id
      WHERE sl.timestamp >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
      ORDER BY sl.timestamp DESC
    `, [minutes]);
    
    return rows;
  }
}

export default SensorLog;
