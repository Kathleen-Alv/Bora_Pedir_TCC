import { db } from "../../../configBancoDeDados/database.js";


// ================================================================
// LISTAR CATEGORIAS
// ================================================================

export async function listarCategorias(req, res) {

    let conexao;

    try {

        const comercioId =
            req.usuario.comercio_id;


        // --------------------------------------------------------
        // VERIFICA COMÉRCIO
        // --------------------------------------------------------

        if (!comercioId) {

            return res.status(403).json({
                message:
                    'Comércio não identificado no token.'
            });

        }


        // --------------------------------------------------------
        // CONEXÃO
        // --------------------------------------------------------

        conexao =
            await db.getConnection();


        // --------------------------------------------------------
        // BUSCA CATEGORIAS
        // --------------------------------------------------------

        const categorias =
            await conexao.query(
                `
                SELECT
                    cc.id,
                    cc.nome,
                    COUNT(ic.id) AS quantidade
                FROM cardapios c
                INNER JOIN categorias_cardapio cc
                    ON cc.cardapio_id = c.id
                LEFT JOIN itens_cardapio ic
                    ON ic.categoria_id = cc.id
                WHERE c.comercio_id = ?
                GROUP BY
                    cc.id,
                    cc.nome
                ORDER BY
                    cc.id ASC
                `,
                [
                    comercioId
                ]
            );


        // --------------------------------------------------------
        // FORMATA RESULTADO
        // --------------------------------------------------------

        const categoriasFormatadas =
            categorias.map(
                (categoria) => ({

                    id:
                        Number(categoria.id),

                    nome:
                        categoria.nome,

                    quantidade:
                        Number(categoria.quantidade)

                })
            );


        // --------------------------------------------------------
        // RESPOSTA
        // --------------------------------------------------------

        return res.status(200).json({

            categorias:
                categoriasFormatadas

        });


    } catch (error) {

        console.error(
            'Erro ao listar categorias:',
            error
        );


        return res.status(500).json({

            message:
                'Erro interno ao carregar categorias.'

        });


    } finally {

        if (conexao) {
            conexao.release();
        }

    }

}



// ================================================================
// CRIAR CATEGORIA
// ================================================================

export async function criarCategoria(req, res) {

    let conexao;

    try {

        const comercioId =
            req.usuario.comercio_id;


        // --------------------------------------------------------
        // VERIFICA COMÉRCIO
        // --------------------------------------------------------

        if (!comercioId) {

            return res.status(403).json({

                message:
                    'Comércio não identificado no token.'

            });

        }


        // --------------------------------------------------------
        // DADOS
        // --------------------------------------------------------

        const {
            nome
        } = req.body || {};


        // --------------------------------------------------------
        // VALIDA NOME
        // --------------------------------------------------------

        if (
            !nome ||
            !nome.trim()
        ) {

            return res.status(400).json({

                message:
                    'O nome da categoria é obrigatório.'

            });

        }


        const nomeCategoria =
            nome.trim();


        // --------------------------------------------------------
        // CONEXÃO
        // --------------------------------------------------------

        conexao =
            await db.getConnection();


        // --------------------------------------------------------
        // PROCURA CARDÁPIO DO COMÉRCIO
        // --------------------------------------------------------

        const cardapios =
            await conexao.query(
                `
                SELECT
                    id
                FROM cardapios
                WHERE comercio_id = ?
                `,
                [
                    comercioId
                ]
            );


        let cardapioId;


        // --------------------------------------------------------
        // CRIA CARDÁPIO CASO NÃO EXISTA
        // --------------------------------------------------------

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
                    (?)
                    `,
                    [
                        comercioId
                    ]
                );


            cardapioId =
                Number(
                    novoCardapio.insertId
                );

        } else {

            cardapioId =
                Number(
                    cardapios[0].id
                );

        }


        // --------------------------------------------------------
        // CRIA CATEGORIA
        // --------------------------------------------------------

        const resultado =
            await conexao.query(
                `
                INSERT INTO categorias_cardapio
                (
                    cardapio_id,
                    nome
                )
                VALUES
                (?, ?)
                `,
                [
                    cardapioId,
                    nomeCategoria
                ]
            );


        // --------------------------------------------------------
        // RESPOSTA
        // --------------------------------------------------------

        return res.status(201).json({

            message:
                'Categoria criada com sucesso.',

            categoria: {

                id:
                    Number(
                        resultado.insertId
                    ),

                cardapio_id:
                    Number(
                        cardapioId
                    ),

                nome:
                    nomeCategoria

            }

        });


    } catch (error) {

        // --------------------------------------------------------
        // CATEGORIA DUPLICADA
        // --------------------------------------------------------

        if (
            error.code ===
            'ER_DUP_ENTRY'
        ) {

            return res.status(409).json({

                message:
                    'Já existe uma categoria com este nome.'

            });

        }


        console.error(
            'Erro ao criar categoria:',
            error
        );


        return res.status(500).json({

            message:
                'Erro interno ao criar categoria.'

        });


    } finally {

        if (conexao) {
            conexao.release();
        }

    }

}



// ================================================================
// BUSCAR DADOS DO COMÉRCIO
// ================================================================

export async function buscarDadosComercio(req, res) {

    let conexao;

    try {

        const comercioId =
            req.usuario.comercio_id;


        // --------------------------------------------------------
        // VERIFICA COMÉRCIO
        // --------------------------------------------------------

        if (!comercioId) {

            return res.status(403).json({

                message:
                    'Comércio não identificado no token.'

            });

        }


        // --------------------------------------------------------
        // CONEXÃO
        // --------------------------------------------------------

        conexao =
            await db.getConnection();


        // --------------------------------------------------------
        // BUSCA DADOS
        // --------------------------------------------------------

        const dados =
            await conexao.query(
                `
                SELECT
                    comercio_id,
                    nome_comercio
                FROM dados_comercio
                WHERE comercio_id = ?
                LIMIT 1
                `,
                [
                    comercioId
                ]
            );


        // --------------------------------------------------------
        // NÃO ENCONTRADO
        // --------------------------------------------------------

        if (
            !dados ||
            dados.length === 0
        ) {

            return res.status(404).json({

                message:
                    'Dados do comércio não encontrados.'

            });

        }


        // --------------------------------------------------------
        // RESPOSTA
        // --------------------------------------------------------

        return res.status(200).json({

            comercio: {

                id:
                    Number(
                        dados[0].comercio_id
                    ),

                nome_comercio:
                    dados[0].nome_comercio

            }

        });


    } catch (error) {

        console.error(
            'Erro ao buscar dados do comércio:',
            error
        );


        return res.status(500).json({

            message:
                'Erro interno ao carregar dados do comércio.'

        });


    } finally {

        if (conexao) {
            conexao.release();
        }

    }

}



// ================================================================
// CRIAR ITEM
// ================================================================
//
// IMPORTANTE:
//
// Este endpoint recebe:
// multipart/form-data
//
// O Multer coloca:
// - campos de texto em req.body
// - imagem em req.file
//
// A rota deve usar:
//
// uploadCardapio.single('foto')
//
// ================================================================

export async function criarItem(req, res) {

    let conexao;

    try {

        // ========================================================
        // COMÉRCIO DO TOKEN
        // ========================================================

        const comercioId =
            req.usuario.comercio_id;


        if (!comercioId) {

            return res.status(403).json({

                message:
                    'Comércio não identificado no token.'

            });

        }


        // ========================================================
        // DADOS DO FORM DATA
        // ========================================================

        const {
            categoria_id,
            nome,
            preco,
            descricao
        } = req.body || {};


        // ========================================================
        // FOTO
        // ========================================================

        let foto = null;


        if (req.file) {

            foto =
                `/uploads/cardapio/${req.file.filename}`;

        }


        // ========================================================
        // VALIDA CATEGORIA
        // ========================================================

        if (!categoria_id) {

            return res.status(400).json({

                message:
                    'A categoria é obrigatória.'

            });

        }


        // ========================================================
        // VALIDA NOME
        // ========================================================

        if (
            !nome ||
            !nome.trim()
        ) {

            return res.status(400).json({

                message:
                    'O nome do item é obrigatório.'

            });

        }


        // ========================================================
        // VALIDA PREÇO
        // ========================================================

        if (
            preco === undefined ||
            preco === null ||
            preco === ''
        ) {

            return res.status(400).json({

                message:
                    'O preço do item é obrigatório.'

            });

        }


        const precoNumerico =
            Number(
                String(preco).replace(',', '.')
            );


        if (
            Number.isNaN(precoNumerico) ||
            precoNumerico <= 0
        ) {

            return res.status(400).json({

                message:
                    'O preço do item é inválido.'

            });

        }


        // ========================================================
        // CONEXÃO COM BANCO
        // ========================================================

        conexao =
            await db.getConnection();


        // ========================================================
        // VERIFICA CATEGORIA
        // ========================================================
        //
        // Aqui garantimos que a categoria realmente pertence
        // ao comércio que está fazendo a requisição.
        //
        // ========================================================

        const categorias =
            await conexao.query(
                `
                SELECT
                    cc.id,
                    cc.cardapio_id
                FROM categorias_cardapio cc
                INNER JOIN cardapios c
                    ON c.id = cc.cardapio_id
                WHERE
                    cc.id = ?
                    AND c.comercio_id = ?
                LIMIT 1
                `,
                [
                    Number(categoria_id),
                    comercioId
                ]
            );


        if (
            !categorias ||
            categorias.length === 0
        ) {

            return res.status(404).json({

                message:
                    'Categoria não encontrada para este comércio.'

            });

        }


        // ========================================================
        // CRIA ITEM NO BANCO
        // ========================================================

        const resultado =
            await conexao.query(
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
                VALUES
                (?, ?, ?, ?, ?, ?)
                `,
                [
                    Number(categoria_id),

                    nome.trim(),

                    foto,

                    precoNumerico,

                    descricao &&
                    descricao.trim()
                        ? descricao.trim()
                        : null,

                    true
                ]
            );


        // ========================================================
        // ITEM CRIADO
        // ========================================================

        const itemCriado = {

            id:
                Number(
                    resultado.insertId
                ),

            categoria_id:
                Number(
                    categoria_id
                ),

            nome:
                nome.trim(),

            foto:
                foto,

            preco:
                precoNumerico,

            descricao:
                descricao &&
                descricao.trim()
                    ? descricao.trim()
                    : null,

            disponivel:
                true

        };


        // ========================================================
        // RESPOSTA
        // ========================================================

        return res.status(201).json({

            message:
                'Item criado com sucesso.',

            item:
                itemCriado

        });


    } catch (error) {

        console.error(
            'Erro ao criar item:',
            error
        );


        return res.status(500).json({

            message:
                'Erro interno ao criar item.'

        });


    } finally {

        if (conexao) {
            conexao.release();
        }

    }

}



// ================================================================
// LISTAR ITENS
// ================================================================

export async function listarItens(req, res) {

    let conexao;

    try {

        // --------------------------------------------------------
        // COMÉRCIO DO TOKEN
        // --------------------------------------------------------

        const comercioId =
            req.usuario.comercio_id;


        if (!comercioId) {

            return res.status(403).json({

                message:
                    'Comércio não identificado no token.'

            });

        }


        // --------------------------------------------------------
        // CONEXÃO
        // --------------------------------------------------------

        conexao =
            await db.getConnection();


        // --------------------------------------------------------
        // BUSCA ITENS
        // --------------------------------------------------------

        const itens =
            await conexao.query(
                `
                SELECT
                    ic.id,
                    ic.categoria_id,
                    ic.nome,
                    ic.foto,
                    ic.preco,
                    ic.descricao,
                    ic.disponivel
                FROM itens_cardapio ic
                INNER JOIN categorias_cardapio cc
                    ON cc.id = ic.categoria_id
                INNER JOIN cardapios c
                    ON c.id = cc.cardapio_id
                WHERE c.comercio_id = ?
                ORDER BY ic.id ASC
                `,
                [
                    comercioId
                ]
            );


        // --------------------------------------------------------
        // FORMATA ITENS
        // --------------------------------------------------------

        const itensFormatados =
            itens.map(
                (item) => ({

                    id:
                        Number(
                            item.id
                        ),

                    categoria_id:
                        Number(
                            item.categoria_id
                        ),

                    nome:
                        item.nome,

                    foto:
                        item.foto || null,

                    preco:
                        Number(
                            item.preco
                        ),

                    descricao:
                        item.descricao || null,

                    disponivel:
                        Boolean(
                            item.disponivel
                        )

                })
            );


        // --------------------------------------------------------
        // RESPOSTA
        // --------------------------------------------------------

        return res.status(200).json({

            itens:
                itensFormatados

        });


    } catch (error) {

        console.error(
            'Erro ao listar itens:',
            error
        );


        return res.status(500).json({

            message:
                'Erro interno ao carregar itens.'

        });


    } finally {

        if (conexao) {
            conexao.release();
        }

    }

}