import express from 'express';
import {
  startSimulation,
  stopSimulation,
  getSimulationStatus,
  updateSimulationInterval,
  restartSimulation,
  getSimulationConfig,
  updateSimulationConfig
} from '../controllers/simulationController.js';

const router = express.Router();

router.post('/start', startSimulation);
router.post('/stop', stopSimulation);
router.post('/restart', restartSimulation);
router.get('/status', getSimulationStatus);
router.put('/interval', updateSimulationInterval);
router.get('/config', getSimulationConfig);
router.put('/config', updateSimulationConfig);

export default router;
