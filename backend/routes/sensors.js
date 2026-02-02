import express from 'express';
import {
  getAllSensors,
  getSensorsByBedroomId,
  getSensorById,
  createSensor,
  updateSensor,
  deleteSensor,
  toggleSensorActive
} from '../controllers/sensorController.js';

const router = express.Router();

router.get('/', getAllSensors);
router.get('/bedroom/:bedroomId', getSensorsByBedroomId);
router.get('/:id', getSensorById);
router.post('/', createSensor);
router.put('/:id', updateSensor);
router.delete('/:id', deleteSensor);
router.patch('/:id/toggle', toggleSensorActive);

export default router;
