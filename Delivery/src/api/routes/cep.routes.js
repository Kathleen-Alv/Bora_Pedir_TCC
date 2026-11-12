
import express from 'express';
import { consultarCep } from '../controllers/cep.controller.js';

const router = express.Router();

router.get('/:cep', consultarCep);

export default router;
