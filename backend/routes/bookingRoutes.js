import express from 'express';
import { bookPG,acceptBooking,ownerBookings } from '../controllers/bookingController.js';
import protect from '../middleware/auth.js';

const router=express.Router();

router.post('/book',protect,bookPG);

router.put('/accept/:id',protect,acceptBooking);

router.get('/',protect,ownerBookings);

export default router;