
import { db } from '../../../configBancoDeDados/database.js';

/* =====================================================
   IDENTIFICAR USUÁRIO AUTENTICADO

   CLIENTE:
   usuario_id
   cliente_id
   tipo: cliente

   COMÉRCIO:
   id
   comercio_id
   papel: COMERCIO
===================================================== */

function identificarParticipante(usuario) {
    const numeroValido = (valor) => {
        const numero = Number(valor);
        return Number.isSafeInteger(numero) && numero > 0;
    };

    if (
        usuario?.tipo === 'cliente' &&
        numeroValido(usuario.usuario_id) &&
        numeroValido(usuario.cliente_id)
    ) {
        return {
            usuarioId: Number(usuario.usuario_id),
            clienteId: Number(usuario.cliente_id),
            comercioId: null,
            tipo: 'CLIENTE'
        };
    }

    if (
        usuario?.papel === 'COMERCIO' &&
        numeroValido(usuario.id) &&
        numeroValido(usuario.comercio_id)
    ) {
        return {
            usuarioId: Number(usuario.id),
            clienteId: null,
            comercioId: Number(usuario.comercio_id),
            tipo: 'COMERCIO'
        };
    }

    return null;
}

function validarId(valor) {
    const numero = Number(valor);

    return Number.isSafeInteger(numero) && numero > 0
        ? numero
        : null;
}

/* =====================================================
   VERIFICAR ACESSO À CONVERSA

   Somente o cliente e o comércio daquela conversa
   podem visualizar e enviar mensagens.
===================================================== */

async function buscarChatComParticipantes(conexao, chatId) {
    const resultado = await conexao.query(
        `
        SELECT
            c.*,
            cl.usuario_id AS cliente_usuario_id,
            co.usuario_id AS comercio_usuario_id
        FROM chat c
        INNER JOIN clientes cl
            ON cl.id = c.cliente_id
        INNER JOIN comercios co
            ON co.id = c.comercio_id
        WHERE c.id = ?
        LIMIT 1
        `,
        [chatId]
    );

    return resultado[0] || null;
}

function participanteTemAcesso(chat, participante) {
    if (!chat || !participante) return false;

    if (participante.tipo === 'CLIENTE') {
        return (
            Number(chat.cliente_id) === participante.clienteId &&
            Number(chat.cliente_usuario_id) === participante.usuarioId
        );
    }

    if (participante.tipo === 'COMERCIO') {
        return (
            Number(chat.comercio_id) === participante.comercioId &&
            Number(chat.comercio_usuario_id) === participante.usuarioId
        );
    }

    return false;
}

/* =====================================================
   CRIAR OU RECUPERAR CHAT DE DÚVIDA

   POST /api/chat/duvida

   Somente cliente pode iniciar.
   O comercio_id vem do corpo da requisição.
===================================================== */

export async function criarChatDuvida(req, res) {
    const participante = identificarParticipante(req.usuario);

    if (!participante) {
        return res.status(403).json({
            mensagem: 'Usuário não autorizado a utilizar o chat.'
        });
    }

    if (participante.tipo !== 'CLIENTE') {
        return res.status(403).json({
            mensagem: 'Somente o cliente pode iniciar um chat de dúvida.'
        });
    }

    const comercioId = validarId(req.body.comercio_id);

    if (!comercioId) {
        return res.status(400).json({
            mensagem: 'Informe um comércio válido.'
        });
    }

    let conexao;

    try {
        conexao = await db.getConnection();
        await conexao.beginTransaction();

        // Bloqueia a linha do cliente para evitar
        // criação simultânea de conversas duplicadas.
        const cliente = await conexao.query(
            `
            SELECT id
            FROM clientes
            WHERE id = ?
              AND usuario_id = ?
            FOR UPDATE
            `,
            [participante.clienteId, participante.usuarioId]
        );

        if (!cliente.length) {
            await conexao.rollback();

            return res.status(404).json({
                mensagem: 'Cadastro de cliente não encontrado.'
            });
        }

        const comercio = await conexao.query(
            `
            SELECT id
            FROM comercios
            WHERE id = ?
            LIMIT 1
            `,
            [comercioId]
        );

        if (!comercio.length) {
            await conexao.rollback();

            return res.status(404).json({
                mensagem: 'Comércio não encontrado.'
            });
        }

        // Recupera uma conversa de dúvida que ainda esteja aberta.
        const existente = await conexao.query(
            `
            SELECT id
            FROM chat
            WHERE cliente_id = ?
              AND comercio_id = ?
              AND tipo = 'DUVIDA'
              AND status = 'ABERTO'
            ORDER BY id DESC
            LIMIT 1
            `,
            [participante.clienteId, comercioId]
        );

        if (existente.length) {
            await conexao.commit();

            return res.status(200).json({
                mensagem: 'Conversa recuperada.',
                chat_id: Number(existente[0].id),
                tipo: 'DUVIDA',
                status: 'ABERTO'
            });
        }

        const resultado = await conexao.query(
            `
            INSERT INTO chat (
                cliente_id,
                comercio_id,
                pedido_id,
                tipo,
                status
            )
            VALUES (?, ?, NULL, 'DUVIDA', 'ABERTO')
            `,
            [participante.clienteId, comercioId]
        );

        await conexao.commit();

        return res.status(201).json({
            mensagem: 'Conversa criada com sucesso.',
            chat_id: Number(resultado.insertId),
            tipo: 'DUVIDA',
            status: 'ABERTO'
        });

    } catch (erro) {
        if (conexao) await conexao.rollback();

        console.error('Erro ao criar chat de dúvida:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao criar conversa.'
        });

    } finally {
        if (conexao) conexao.release();
    }
}

/* =====================================================
   CRIAR OU RECUPERAR CHAT DE PEDIDO

   POST /api/chat/pedido/:pedidoId

   O pedido determina o cliente e o comércio.
===================================================== */

export async function criarChatPedido(req, res) {
    const participante = identificarParticipante(req.usuario);
    const pedidoId = validarId(req.params.pedidoId);

    if (!participante) {
        return res.status(403).json({
            mensagem: 'Usuário não autorizado a utilizar o chat.'
        });
    }

    if (!pedidoId) {
        return res.status(400).json({
            mensagem: 'Pedido inválido.'
        });
    }

    let conexao;

    try {
        conexao = await db.getConnection();
        await conexao.beginTransaction();

        const pedidos = await conexao.query(
            `
            SELECT
                id,
                cliente_id,
                comercio_id,
                status
            FROM pedidos
            WHERE id = ?
            LIMIT 1
            `,
            [pedidoId]
        );

        if (!pedidos.length) {
            await conexao.rollback();

            return res.status(404).json({
                mensagem: 'Pedido não encontrado.'
            });
        }

        const pedido = pedidos[0];

        const pertenceAoCliente =
            participante.tipo === 'CLIENTE' &&
            Number(pedido.cliente_id) === participante.clienteId;

        const pertenceAoComercio =
            participante.tipo === 'COMERCIO' &&
            Number(pedido.comercio_id) === participante.comercioId;

        if (!pertenceAoCliente && !pertenceAoComercio) {
            await conexao.rollback();

            return res.status(403).json({
                mensagem: 'Você não tem acesso ao chat deste pedido.'
            });
        }

        // Um pedido só pode possuir um chat.
        const existente = await conexao.query(
            `
            SELECT id, tipo, status
            FROM chat
            WHERE pedido_id = ?
            LIMIT 1
            `,
            [pedidoId]
        );

        if (existente.length) {
            await conexao.commit();

            return res.status(200).json({
                mensagem: 'Conversa do pedido recuperada.',
                chat_id: Number(existente[0].id),
                tipo: existente[0].tipo,
                status: existente[0].status
            });
        }

        const resultado = await conexao.query(
            `
            INSERT INTO chat (
                cliente_id,
                comercio_id,
                pedido_id,
                tipo,
                status
            )
            VALUES (?, ?, ?, 'PEDIDO', 'ABERTO')
            `,
            [
                Number(pedido.cliente_id),
                Number(pedido.comercio_id),
                pedidoId
            ]
        );

        await conexao.commit();

        return res.status(201).json({
            mensagem: 'Chat do pedido criado com sucesso.',
            chat_id: Number(resultado.insertId),
            tipo: 'PEDIDO',
            status: 'ABERTO'
        });

    } catch (erro) {
        if (conexao) await conexao.rollback();

        // Caso duas requisições tentem criar o chat
        // do mesmo pedido simultaneamente, recupera o existente.
        if (erro.code === 'ER_DUP_ENTRY') {
            try {
                const existente = await db.query(
                    `
                    SELECT id, tipo, status
                    FROM chat
                    WHERE pedido_id = ?
                    LIMIT 1
                    `,
                    [pedidoId]
                );

                if (existente.length) {
                    return res.status(200).json({
                        mensagem: 'Conversa do pedido recuperada.',
                        chat_id: Number(existente[0].id),
                        tipo: existente[0].tipo,
                        status: existente[0].status
                    });
                }
            } catch (erroConsulta) {
                console.error(erroConsulta);
            }
        }

        console.error('Erro ao criar chat do pedido:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao criar conversa do pedido.'
        });

    } finally {
        if (conexao) conexao.release();
    }
}

/* =====================================================
   LISTAR CONVERSAS DO USUÁRIO

   GET /api/chat

   No site: retorna nome do cliente.
   No app: retorna nome do comércio.
===================================================== */

export async function listarChats(req, res) {
    const participante = identificarParticipante(req.usuario);

    if (!participante) {
        return res.status(403).json({
            mensagem: 'Usuário não autorizado.'
        });
    }

    try {
        const condicao = participante.tipo === 'CLIENTE'
            ? 'c.cliente_id = ?'
            : 'c.comercio_id = ?';

        const valor = participante.tipo === 'CLIENTE'
            ? participante.clienteId
            : participante.comercioId;

        const chats = await db.query(
            `
            SELECT
                c.id AS chat_id,
                c.cliente_id,
                c.comercio_id,
                c.pedido_id,
                c.tipo,
                c.status,
                c.criado_em,
                c.atualizado_em,

                cl.nome AS nome_cliente,

                COALESCE(
                    dc.nome_comercio,
                    co.nome_responsavel
                ) AS nome_comercio,

                (
                    SELECT m.mensagem
                    FROM mensagem_chat m
                    WHERE m.chat_id = c.id
                    ORDER BY m.id DESC
                    LIMIT 1
                ) AS ultima_mensagem,

                (
                    SELECT m.tipo_mensagem
                    FROM mensagem_chat m
                    WHERE m.chat_id = c.id
                    ORDER BY m.id DESC
                    LIMIT 1
                ) AS tipo_ultima_mensagem,

                (
                    SELECT m.criado_em
                    FROM mensagem_chat m
                    WHERE m.chat_id = c.id
                    ORDER BY m.id DESC
                    LIMIT 1
                ) AS ultima_mensagem_em

            FROM chat c

            INNER JOIN clientes cl
                ON cl.id = c.cliente_id

            INNER JOIN comercios co
                ON co.id = c.comercio_id

            LEFT JOIN dados_comercio dc
                ON dc.comercio_id = co.id

            WHERE ${condicao}

            ORDER BY
                COALESCE(
                    (
                        SELECT MAX(m.criado_em)
                        FROM mensagem_chat m
                        WHERE m.chat_id = c.id
                    ),
                    c.criado_em
                ) DESC
            `,
            [valor]
        );

        return res.status(200).json({
            chats
        });

    } catch (erro) {
        console.error('Erro ao listar chats:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao carregar conversas.'
        });
    }
}

/* =====================================================
   BUSCAR MENSAGENS

   GET /api/chat/:chatId/mensagens
===================================================== */

export async function listarMensagens(req, res) {
    const participante = identificarParticipante(req.usuario);
    const chatId = validarId(req.params.chatId);

    if (!participante) {
        return res.status(403).json({
            mensagem: 'Usuário não autorizado.'
        });
    }

    if (!chatId) {
        return res.status(400).json({
            mensagem: 'Conversa inválida.'
        });
    }

    let conexao;

    try {
        conexao = await db.getConnection();

        const chat = await buscarChatComParticipantes(
            conexao,
            chatId
        );

        if (!participanteTemAcesso(chat, participante)) {
            return res.status(403).json({
                mensagem: 'Você não tem acesso a esta conversa.'
            });
        }

        const mensagens = await conexao.query(
            `
            SELECT
                m.id,
                m.chat_id,
                m.remetente_usuario_id,
                m.mensagem,
                m.tipo_mensagem,
                m.arquivo_url,
                m.lida_em,
                m.criado_em,

                CASE
                    WHEN m.remetente_usuario_id = cl.usuario_id
                        THEN 'CLIENTE'
                    WHEN m.remetente_usuario_id = co.usuario_id
                        THEN 'COMERCIO'
                    ELSE 'SISTEMA'
                END AS remetente_tipo,

                CASE
                    WHEN m.remetente_usuario_id = cl.usuario_id
                        THEN cl.nome
                    WHEN m.remetente_usuario_id = co.usuario_id
                        THEN COALESCE(
                            dc.nome_comercio,
                            co.nome_responsavel
                        )
                    ELSE 'Sistema'
                END AS remetente_nome

            FROM mensagem_chat m

            INNER JOIN chat c
                ON c.id = m.chat_id

            INNER JOIN clientes cl
                ON cl.id = c.cliente_id

            INNER JOIN comercios co
                ON co.id = c.comercio_id

            LEFT JOIN dados_comercio dc
                ON dc.comercio_id = co.id

            WHERE m.chat_id = ?

            ORDER BY m.id ASC
            `,
            [chatId]
        );

        return res.status(200).json({
            chat_id: chatId,
            status: chat.status,
            mensagens
        });

    } catch (erro) {
        console.error('Erro ao listar mensagens:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao carregar mensagens.'
        });

    } finally {
        if (conexao) conexao.release();
    }
}

/* =====================================================
   ENVIAR MENSAGEM DE TEXTO

   POST /api/chat/:chatId/mensagens

   O remetente é identificado pelo JWT.
   O frontend não escolhe o remetente.
===================================================== */

export async function enviarMensagem(req, res) {
    const participante = identificarParticipante(req.usuario);
    const chatId = validarId(req.params.chatId);

    const mensagem = typeof req.body.mensagem === 'string'
        ? req.body.mensagem.trim()
        : '';

    if (!participante) {
        return res.status(403).json({
            mensagem: 'Usuário não autorizado.'
        });
    }

    if (!chatId) {
        return res.status(400).json({
            mensagem: 'Conversa inválida.'
        });
    }

    if (!mensagem) {
        return res.status(400).json({
            mensagem: 'Digite uma mensagem.'
        });
    }

    if (mensagem.length > 5000) {
        return res.status(400).json({
            mensagem: 'A mensagem ultrapassa o limite de 5000 caracteres.'
        });
    }

    let conexao;

    try {
        conexao = await db.getConnection();
        await conexao.beginTransaction();

        const chats = await conexao.query(
            `
            SELECT
                c.*,
                cl.usuario_id AS cliente_usuario_id,
                co.usuario_id AS comercio_usuario_id
            FROM chat c
            INNER JOIN clientes cl
                ON cl.id = c.cliente_id
            INNER JOIN comercios co
                ON co.id = c.comercio_id
            WHERE c.id = ?
            FOR UPDATE
            `,
            [chatId]
        );

        const chat = chats[0] || null;

        if (!participanteTemAcesso(chat, participante)) {
            await conexao.rollback();

            return res.status(403).json({
                mensagem: 'Você não tem acesso a esta conversa.'
            });
        }

        if (chat.status !== 'ABERTO') {
            await conexao.rollback();

            return res.status(409).json({
                mensagem: 'Esta conversa está encerrada.'
            });
        }

        const resultado = await conexao.query(
            `
            INSERT INTO mensagem_chat (
                chat_id,
                remetente_usuario_id,
                mensagem,
                tipo_mensagem
            )
            VALUES (?, ?, ?, 'TEXTO')
            `,
            [
                chatId,
                participante.usuarioId,
                mensagem
            ]
        );

        await conexao.query(
            `
            UPDATE chat
            SET atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [chatId]
        );

        await conexao.commit();

        return res.status(201).json({
            mensagem: 'Mensagem enviada.',
            dados: {
                id: Number(resultado.insertId),
                chat_id: chatId,
                remetente_usuario_id: participante.usuarioId,
                remetente_tipo: participante.tipo,
                mensagem,
                tipo_mensagem: 'TEXTO',
                lida_em: null
            }
        });

    } catch (erro) {
        if (conexao) await conexao.rollback();

        console.error('Erro ao enviar mensagem:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao enviar mensagem.'
        });

    } finally {
        if (conexao) conexao.release();
    }
}

/* =====================================================
   MARCAR MENSAGENS COMO LIDAS

   PATCH /api/chat/:chatId/lida

   Marca somente mensagens enviadas pela outra pessoa.
===================================================== */

export async function marcarMensagensLidas(req, res) {
    const participante = identificarParticipante(req.usuario);
    const chatId = validarId(req.params.chatId);

    if (!participante) {
        return res.status(403).json({
            mensagem: 'Usuário não autorizado.'
        });
    }

    if (!chatId) {
        return res.status(400).json({
            mensagem: 'Conversa inválida.'
        });
    }

    let conexao;

    try {
        conexao = await db.getConnection();

        const chat = await buscarChatComParticipantes(
            conexao,
            chatId
        );

        if (!participanteTemAcesso(chat, participante)) {
            return res.status(403).json({
                mensagem: 'Você não tem acesso a esta conversa.'
            });
        }

        const resultado = await conexao.query(
            `
            UPDATE mensagem_chat
            SET lida_em = CURRENT_TIMESTAMP
            WHERE chat_id = ?
              AND remetente_usuario_id <> ?
              AND lida_em IS NULL
              AND tipo_mensagem <> 'SISTEMA'
            `,
            [
                chatId,
                participante.usuarioId
            ]
        );

        return res.status(200).json({
            mensagem: 'Mensagens marcadas como lidas.',
            quantidade: Number(resultado.affectedRows)
        });

    } catch (erro) {
        console.error('Erro ao marcar mensagens como lidas:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao atualizar leitura das mensagens.'
        });

    } finally {
        if (conexao) conexao.release();
    }
}

/* =====================================================
   ENCERRAR CONVERSA

   PATCH /api/chat/:chatId/encerrar
===================================================== */

export async function encerrarChat(req, res) {
    const participante = identificarParticipante(req.usuario);
    const chatId = validarId(req.params.chatId);

    if (!participante) {
        return res.status(403).json({
            mensagem: 'Usuário não autorizado.'
        });
    }

    if (!chatId) {
        return res.status(400).json({
            mensagem: 'Conversa inválida.'
        });
    }

    let conexao;

    try {
        conexao = await db.getConnection();
        await conexao.beginTransaction();

        const chats = await conexao.query(
            `
            SELECT
                c.*,
                cl.usuario_id AS cliente_usuario_id,
                co.usuario_id AS comercio_usuario_id
            FROM chat c
            INNER JOIN clientes cl
                ON cl.id = c.cliente_id
            INNER JOIN comercios co
                ON co.id = c.comercio_id
            WHERE c.id = ?
            FOR UPDATE
            `,
            [chatId]
        );

        const chat = chats[0] || null;

        if (!participanteTemAcesso(chat, participante)) {
            await conexao.rollback();

            return res.status(403).json({
                mensagem: 'Você não tem acesso a esta conversa.'
            });
        }

        if (chat.status === 'ENCERRADO') {
            await conexao.commit();

            return res.status(200).json({
                mensagem: 'Esta conversa já estava encerrada.'
            });
        }

        await conexao.query(
            `
            UPDATE chat
            SET
                status = 'ENCERRADO',
                encerrado_em = CURRENT_TIMESTAMP,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [chatId]
        );

        await conexao.commit();

        return res.status(200).json({
            mensagem: 'Conversa encerrada com sucesso.'
        });

    } catch (erro) {
        if (conexao) await conexao.rollback();

        console.error('Erro ao encerrar chat:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao encerrar conversa.'
        });

    } finally {
        if (conexao) conexao.release();
    }
}
