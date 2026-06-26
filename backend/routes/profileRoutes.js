import express from 'express';


import {saveProfile} from '../controllers/profileController.js';

import protect from '../middleware/auth.js';

const router=express.Router();

router.put('/save',protect,saveProfile);


export default router;