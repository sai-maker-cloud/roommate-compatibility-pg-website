import express from 'express';

import { addPG, getPG, getPGsByOwner, updateRooms, updatePg, deletePg, getDashboardStats, ratePg } from '../controllers/pgController.js';
import protect from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router=express.Router();

router.post('/add',protect,upload.array("images",5),addPG);

router.get('/dashboard/stats', protect, getDashboardStats);

router.get('/',getPG);

router.get('/owner/:userId', getPGsByOwner);

router.put('/rooms/:id',protect,updateRooms);
router.post('/:id/rate', protect, ratePg);

router.put('/:id', protect, updatePg);
router.delete('/:id', protect, deletePg);

export default router;
