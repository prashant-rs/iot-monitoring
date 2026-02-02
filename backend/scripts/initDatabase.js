import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  let connection;
  
  try {
    // Connect without specifying database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'iot_monitoring';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database '${dbName}' created/verified`);

    // Use the database
    await connection.query(`USE ${dbName}`);

    // Create bedrooms table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bedrooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "bedrooms" created/verified');

    // Create sensors table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sensors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bedroom_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        type ENUM('temperature', 'humidity') NOT NULL,
        unit VARCHAR(10) NOT NULL,
        min_value DECIMAL(5,2) NOT NULL,
        max_value DECIMAL(5,2) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (bedroom_id) REFERENCES bedrooms(id) ON DELETE CASCADE,
        UNIQUE KEY unique_sensor (bedroom_id, name)
      )
    `);
    console.log('Table "sensors" created/verified');

    // Create sensor_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sensor_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sensor_id INT NOT NULL,
        room_name VARCHAR(50) NOT NULL,
        sensor_name VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        value DECIMAL(5,2) NOT NULL,
        FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE,
        INDEX idx_timestamp (timestamp),
        INDEX idx_sensor_timestamp (sensor_id, timestamp),
        INDEX idx_room_timestamp (room_name, timestamp)
      )
    `);
    console.log('Table "sensor_logs" created/verified');

    // Create simulation_config table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS simulation_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        interval_ms INT NOT NULL DEFAULT 60000,
        is_running BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "simulation_config" created/verified');

    // Insert default simulation config if not exists
    await connection.query(`
      INSERT INTO simulation_config (interval_ms, is_running)
      SELECT 60000, FALSE
      WHERE NOT EXISTS (SELECT 1 FROM simulation_config LIMIT 1)
    `);
    console.log('Default simulation config initialized');

    console.log('\n Database initialization completed successfully!\n');

  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run initialization
initDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
