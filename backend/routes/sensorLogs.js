import express from 'express';
import {
  getLatestReadings,
  getReadingsBySensor,
  getReadingsByBedroom,
  getSensorStats,
  getRecentReadings,
  getAllReadings
} from '../controllers/sensorLogController.js';

const router = express.Router();

router.get('/latest', getLatestReadings);
router.get('/recent', getRecentReadings);
router.get('/all', getAllReadings);
router.get('/sensor/:sensorId', getReadingsBySensor);
router.get('/sensor/:sensorId/stats', getSensorStats);
router.get('/bedroom/:bedroomName', getReadingsByBedroom);

export default router;
