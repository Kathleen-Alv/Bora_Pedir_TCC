import express from 'express';

import {
    loginComercio
} from '../controllers/loginComercio.controller.js';


const router = express.Router();


// ================================================================
// LOGIN DE COMÉRCIO
// ================================================================

router.post(
    '/',
    loginComercio
);


export default router;