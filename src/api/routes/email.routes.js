import express from 'express';
import { enviarEmailPendente } from '../../services/emailService.js';

const router = express.Router();

router.get('/teste', async (req, res) => {

    try {

        await enviarEmailPendente(
            'kathleen.alv.1111@gmail.com',
            'Teste de Email - Bora Pedir',
            'Olá! Este é um email de teste enviado pelo sistema Bora Pedir.'
        );

        res.json({
            sucesso: true,
            mensagem: 'Email enviado com sucesso!'
        });

    } catch (error) {

        console.error('Erro ao enviar email:', error);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao enviar email.'
        });

    }

});

export default router;