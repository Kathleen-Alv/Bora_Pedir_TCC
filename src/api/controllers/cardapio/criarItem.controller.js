import { db } from '../../configBancoDeDados/database.js';




// ================================================================
// CRIAR ITEM
// ================================================================

export async function criarItem(req, res) {

    try {

        // ------------------------------------------------------------
        // COMÉRCIO AUTENTICADO
        // ------------------------------------------------------------

        const comercioId = req.usuario?.comercio_id;

        if (!comercioId) {

            return res.status(403).json({
                message: 'Comércio não identificado.'
            });

        }


        // ------------------------------------------------------------
        // DADOS RECEBIDOS
        // ------------------------------------------------------------

        const {
            categoria_id,
            nome,
            preco,
            descricao,
            foto
        } = req.body;


        // ------------------------------------------------------------
        // VALIDAÇÕES
        // ------------------------------------------------------------

        if (!categoria_id) {

            return res.status(400).json({
                message: 'A categoria é obrigatória.'
            });

        }

        if (!nome || !nome.trim()) {

            return res.status(400).json({
                message: 'O nome do item é obrigatório.'
            });

        }

        if (preco === undefined || preco === null || preco === '') {

            return res.status(400).json({
                message: 'O preço do item é obrigatório.'
            });

        }


        // ------------------------------------------------------------
        // VERIFICA SE A CATEGORIA PERTENCE AO COMÉRCIO
        // ------------------------------------------------------------

        const [categorias] = await db.query(
            `
            SELECT 
                cc.id,
                cc.cardapio_id
            FROM categorias_cardapio cc

            INNER JOIN cardapios c
                ON c.id = cc.cardapio_id

            WHERE cc.id = ?
              AND c.comercio_id = ?

            LIMIT 1
            `,
            [
                categoria_id,
                comercioId
            ]
        );


        if (categorias.length === 0) {

            return res.status(404).json({
                message: 'Categoria não encontrada para este comércio.'
            });

        }


        // ------------------------------------------------------------
        // INSERIR ITEM
        // ------------------------------------------------------------

        const [resultado] = await db.query(
            `
            INSERT INTO itens_cardapio
            (
                categoria_id,
                nome,
                foto,
                preco,
                descricao,
                disponivel
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                categoria_id,
                nome.trim(),
                foto || null,
                Number(preco),
                descricao?.trim() || null,
                true
            ]
        );


        // ------------------------------------------------------------
        // RESPOSTA
        // ------------------------------------------------------------

        return res.status(201).json({

            message: 'Item criado com sucesso.',

            item: {
                id: Number(resultado.insertId),
                categoria_id: Number(categoria_id),
                nome: nome.trim(),
                foto: foto || null,
                preco: Number(preco),
                descricao: descricao?.trim() || null,
                disponivel: true
            }

        });


    } catch (error) {

        console.error('Erro ao criar item:', error);

        return res.status(500).json({
            message: 'Erro interno ao criar item.'
        });

    }

}