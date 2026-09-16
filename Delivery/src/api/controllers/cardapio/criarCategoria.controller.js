
import { db } from '../../configBancoDeDados/database.js';

// ================================================================
// CRIAR CATEGORIA
// ================================================================

export async function criarCategoria(req, res) {

    let conexao;

    try {

        // ========================================================
        // 1. PEGA O COMÉRCIO DO TOKEN JWT
        // ========================================================

        const comercioId =
            req.usuario.comercio_id;


        // ========================================================
        // 2. VERIFICA O COMÉRCIO
        // ========================================================

        if (!comercioId) {

            return res.status(403).json({

                message:
                    'Comércio não identificado no token.'

            });

        }


        // ========================================================
        // 3. PEGA O NOME DA CATEGORIA
        // ========================================================

        const { nome } =
            req.body;


        if (!nome || nome.trim() === '') {

            return res.status(400).json({

                message:
                    'O nome da categoria é obrigatório.'

            });

        }


        const nomeCategoria =
            nome.trim();


        // ========================================================
        // 4. ABRE CONEXÃO
        // ========================================================

        conexao =
            await db.getConnection();


        // ========================================================
        // 5. PROCURA O CARDÁPIO DO COMÉRCIO
        // ========================================================

        const cardapios =
            await conexao.query(

                `
                SELECT
                    id

                FROM cardapios

                WHERE comercio_id = ?
                `,

                [comercioId]

            );


        let cardapioId;


        // ========================================================
        // 6. SE NÃO EXISTIR CARDÁPIO, CRIA AUTOMATICAMENTE
        // ========================================================

        if (
            !cardapios ||
            cardapios.length === 0
        ) {

            const novoCardapio =
                await conexao.query(

                    `
                    INSERT INTO cardapios
                    (
                        comercio_id
                    )

                    VALUES
                    (
                        ?
                    )
                    `,

                    [comercioId]

                );


            cardapioId =
                Number(novoCardapio.insertId);


        } else {

            // ====================================================
            // 7. CARDÁPIO JÁ EXISTE
            // ====================================================

            cardapioId =
                Number(cardapios[0].id);

        }


        // ========================================================
        // 8. CRIA A CATEGORIA
        // ========================================================

        const resultado =
            await conexao.query(

                `
                INSERT INTO categorias_cardapio
                (
                    cardapio_id,
                    nome
                )

                VALUES
                (
                    ?,
                    ?
                )
                `,

                [
                    cardapioId,
                    nomeCategoria
                ]

            );


        // ========================================================
        // 9. RETORNA A CATEGORIA CRIADA
        // ========================================================

        return res.status(201).json({

            message:
                'Categoria criada com sucesso.',

            categoria: {

                id:
                    Number(resultado.insertId),

                cardapio_id:
                    cardapioId,

                nome:
                    nomeCategoria,

                quantidade:
                    0

            }

        });


    } catch (error) {

        // ========================================================
        // CATEGORIA DUPLICADA
        // ========================================================

        if (
            error.code === 'ER_DUP_ENTRY'
        ) {

            return res.status(409).json({

                message:
                    'Já existe uma categoria com este nome.'

            });

        }


        // ========================================================
        // ERRO INTERNO
        // ========================================================

        console.error(
            'Erro ao criar categoria:',
            error
        );


        return res.status(500).json({

            message:
                'Erro interno ao criar categoria.'

        });


    } finally {

        // ========================================================
        // LIBERA A CONEXÃO
        // ========================================================

        if (conexao) {

            conexao.release();

        }

    }

}

