import express from 'express';
import { bookPG, acceptBooking, ownerBookings, getUserBookings } from '../controllers/bookingController.js';
import protect from '../middleware/auth.js';

const router=express.Router();

router.post('/book',protect,bookPG);
router.put('/accept/:id',protect,acceptBooking);
router.get('/owner',protect,ownerBookings); // Note: it's important to use '/owner' as specified by plan
router.get('/', protect, getUserBookings);

export default router;