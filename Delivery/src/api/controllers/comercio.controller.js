// ================================================================
// IMPORTS
// ================================================================

import { db } from '../../configBancoDeDados/database.js';


// ================================================================
// SALVAR PRIMEIRO ACESSO DO COMÉRCIO
// ================================================================

export async function salvarPrimeiroAcesso(req, res) {

    let conexao;

    try {

        // ============================================================
        // 1. PEGAR O USUÁRIO DO TOKEN
        // ============================================================

        const usuarioId = req.usuario?.id;

        if (!usuarioId) {

            return res.status(401).json({
                message: 'Usuário não autenticado.'
            });

        }


        // ============================================================
        // 2. ABRIR CONEXÃO COM O BANCO
        // ============================================================

        conexao = await db.getConnection();


        // ============================================================
        // 3. ENCONTRAR O COMÉRCIO DO USUÁRIO
        // ============================================================

        const comercios = await conexao.query(
            `
            SELECT id
            FROM comercios
            WHERE usuario_id = ?
            `,
            [usuarioId]
        );


        if (comercios.length === 0) {

            return res.status(404).json({
                message: 'Comércio não encontrado.'
            });

        }


        const comercioId = comercios[0].id;


        // ============================================================
        // 4. PEGAR OS DADOS ENVIADOS PELO FRONTEND
        // ============================================================

        const {
            nomeComercio,
            categoria,

            banco,
            agencia,
            conta,
            tipoConta,

            cep,
            endereco,
            numero,
            complemento,
            bairro,
            cidade,
            estado,

            horarios
        } = req.body;


        // ============================================================
        // 5. VALIDAR DADOS OBRIGATÓRIOS
        // ============================================================

        if (!nomeComercio || !categoria) {

            return res.status(400).json({
                message: 'Nome do comércio e categoria são obrigatórios.'
            });

        }


        if (
            !cep ||
            !endereco ||
            !numero ||
            !bairro ||
            !cidade ||
            !estado
        ) {

            return res.status(400).json({
                message: 'Os dados de endereço são obrigatórios.'
            });

        }


        // ============================================================
        // 6. PEGAR LOGO E BANNER
        // ============================================================

        let caminhoLogo = null;
        let caminhoBanner = null;


        if (req.files?.logo?.[0]) {

            caminhoLogo =
                `/uploads/comercios/logos/${req.files.logo[0].filename}`;

        }


        if (req.files?.banner?.[0]) {

            caminhoBanner =
                `/uploads/comercios/banners/${req.files.banner[0].filename}`;

        }


        // ============================================================
        // 7. CONVERTER HORÁRIOS
        // ============================================================

        let horariosArray = [];


        if (horarios) {

            try {

                horariosArray = JSON.parse(horarios);

            } catch (error) {

                return res.status(400).json({
                    message: 'Formato dos horários inválido.'
                });

            }

        }


        // ============================================================
        // 8. INICIAR TRANSAÇÃO
        // ============================================================

        await conexao.beginTransaction();


        // ============================================================
        // 9. SALVAR DADOS DO COMÉRCIO
        // ============================================================

        await conexao.query(
            `
            INSERT INTO dados_comercio (

                comercio_id,

                nome_comercio,
                categoria,

                banco,
                agencia,
                conta,
                tipo_conta,

                cep,
                endereco,
                numero,
                complemento,
                bairro,
                cidade,
                estado,

                logo,
                banner,

                aberto

            )

            VALUES (
                ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?,
                ?
            )

            ON DUPLICATE KEY UPDATE

                nome_comercio = VALUES(nome_comercio),
                categoria = VALUES(categoria),

                banco = VALUES(banco),
                agencia = VALUES(agencia),
                conta = VALUES(conta),
                tipo_conta = VALUES(tipo_conta),

                cep = VALUES(cep),
                endereco = VALUES(endereco),
                numero = VALUES(numero),
                complemento = VALUES(complemento),
                bairro = VALUES(bairro),
                cidade = VALUES(cidade),
                estado = VALUES(estado),

                logo = COALESCE(VALUES(logo), logo),
                banner = COALESCE(VALUES(banner), banner),

                atualizado_em = CURRENT_TIMESTAMP
            `,
            [

                comercioId,

                nomeComercio,
                categoria,

                banco || null,
                agencia || null,
                conta || null,

                tipoConta
                    ? tipoConta.toUpperCase()
                    : null,

                cep.replace(/\D/g, ''),
                endereco,
                numero,
                complemento || null,
                bairro,
                cidade,
                estado.toUpperCase(),

                caminhoLogo,
                caminhoBanner,

                false

            ]
        );


        // ============================================================
        // 10. REMOVER HORÁRIOS ANTIGOS
        // ============================================================

        await conexao.query(
            `
            DELETE FROM horarios_comercio
            WHERE comercio_id = ?
            `,
            [comercioId]
        );


        // ============================================================
        // 11. SALVAR NOVOS HORÁRIOS
        // ============================================================

        for (const horario of horariosArray) {

            // --------------------------------------------------------
            // Ignorar horário incompleto
            // --------------------------------------------------------

            if (
                !horario.dia ||
                !horario.abertura ||
                !horario.fechamento
            ) {

                continue;

            }


            // --------------------------------------------------------
            // Converter dia para o ENUM do banco
            // --------------------------------------------------------

            const diaSemana =
                horario.dia.toUpperCase();


            // --------------------------------------------------------
            // Inserir horário
            // --------------------------------------------------------

            await conexao.query(
                `
                INSERT INTO horarios_comercio (

                    comercio_id,
                    dia_semana,
                    abertura,
                    fechamento

                )

                VALUES (?, ?, ?, ?)
                `,
                [

                    comercioId,
                    diaSemana,
                    horario.abertura,
                    horario.fechamento

                ]
            );

        }


        // ============================================================
        // 12. FINALIZAR PRIMEIRO ACESSO
        // ============================================================

        await conexao.query(
            `
            UPDATE comercios

            SET primeiro_acesso = FALSE

            WHERE id = ?
            `,
            [comercioId]
        );


        // ============================================================
        // 13. CONFIRMAR TRANSAÇÃO
        // ============================================================

        await conexao.commit();


        // ============================================================
        // 14. RESPONDER AO FRONTEND
        // ============================================================

        return res.status(200).json({

            message: 'Dados do comércio salvos com sucesso.'

        });


    } catch (error) {

        // ============================================================
        // DESFAZER ALTERAÇÕES SE DER ERRO
        // ============================================================

        if (conexao) {

            try {

                await conexao.rollback();

            } catch (rollbackError) {

                console.error(
                    'Erro ao desfazer transação:',
                    rollbackError
                );

            }

        }


        // ============================================================
        // MOSTRAR ERRO NO TERMINAL
        // ============================================================

        console.error(
            'Erro ao salvar primeiro acesso:',
            error
        );


        // ============================================================
        // RESPONDER ERRO
        // ============================================================

        return res.status(500).json({

            message:
                'Erro interno ao salvar os dados do comércio.'

        });


    } finally {

        // ============================================================
        // LIBERAR CONEXÃO
        // ============================================================

        if (conexao) {

            conexao.release();

        }

    }

}



 // ================================================================
// MOSTRAR E-MAIL DO COMÉRCIO LOGADO
// ================================================================

export async function verEmail(req, res) {
    let conexao;

    try {
        // 1. Identificar o usuário autenticado pelo token
        const usuarioId = req.usuario?.id;

        if (!usuarioId) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Usuário não autenticado.'
            });
        }

        // 2. Abrir conexão com o banco
        conexao = await db.getConnection();

        // 3. Buscar o e-mail do usuário associado ao comércio
        const resultado = await conexao.query(
            `
            SELECT u.email
            FROM comercios AS c
            INNER JOIN usuarios AS u
                ON u.id = c.usuario_id
            WHERE c.usuario_id = ?
            LIMIT 1
            `,
            [usuarioId]
        );

        // 4. Verificar se encontrou o e-mail
        if (resultado.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Comércio ou e-mail não encontrado.'
            });
        }

        // 5. Retornar o e-mail ao frontend
        return res.status(200).json({
            sucesso: true,
            email: resultado[0].email
        });

    } catch (erro) {
        console.error('Erro ao buscar e-mail:', erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao consultar o e-mail do comércio.'
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}
