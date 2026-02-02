import express from 'express';
import {
  getAllBedrooms,
  getBedroomById,
  createBedroom,
  updateBedroom,
  deleteBedroom
} from '../controllers/bedroomController.js';

const router = express.Router();

router.get('/', getAllBedrooms);
router.get('/:id', getBedroomById);
router.post('/', createBedroom);
router.put('/:id', updateBedroom);
router.delete('/:id', deleteBedroom);

export default router;
