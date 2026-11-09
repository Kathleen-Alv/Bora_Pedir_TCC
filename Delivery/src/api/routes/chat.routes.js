
import express from 'express';

import { autenticar } from '../middlewares/autenticacao.js';

import {
    criarChatDuvida,
    criarChatPedido,
    listarChats,
    listarMensagens,
    enviarMensagem,
    marcarMensagensLidas,
    encerrarChat
} from '../controllers/chat/chat.controller.js';

const router = express.Router();

// Todas as rotas do chat exigem autenticação.
router.use(autenticar);

// Criar ou recuperar conversa de dúvida.
router.post('/duvida', criarChatDuvida);

// Criar ou recuperar conversa vinculada a um pedido.
router.post('/pedido/:pedidoId', criarChatPedido);

// Listar conversas do usuário autenticado.
router.get('/', listarChats);

// Buscar mensagens de uma conversa.
router.get('/:chatId/mensagens', listarMensagens);

// Enviar mensagem.
router.post('/:chatId/mensagens', enviarMensagem);

// Marcar mensagens recebidas como lidas.
router.patch('/:chatId/lida', marcarMensagensLidas);

// Encerrar conversa.
router.patch('/:chatId/encerrar', encerrarChat);

export default router;
