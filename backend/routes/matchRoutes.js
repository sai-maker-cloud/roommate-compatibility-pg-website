import express from 'express';

import {findMatches} from '../controllers/matchController.js';
import protect from '../middleware/auth.js';
const router=express.Router();

router.get('/',protect,findMatches);

export default router;