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

// ================================================================
// ALTERAR ITEM
// ================================================================
//
// Este endpoint recebe:
// multipart/form-data
//
// O Multer coloca:
// - campos de texto em req.body
// - nova imagem em req.file
//
// A rota deve usar:
//
// uploadCardapio.single('foto')
//
// ================================================================

export async function alterarItem(req, res) {

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
        // ID DO ITEM
        // ========================================================

        const itemId =
            Number(req.params.id);


        if (
            !itemId ||
            Number.isNaN(itemId)
        ) {

            return res.status(400).json({

                message:
                    'ID do item inválido.'

            });

        }


        // ========================================================
        // DADOS
        // ========================================================

        const {
            categoria_id,
            nome,
            preco,
            descricao,
            disponivel
        } = req.body || {};


        // ========================================================
        // CONEXÃO
        // ========================================================

        conexao =
            await db.getConnection();


        // ========================================================
        // BUSCA O ITEM
        // ========================================================
        //
        // Também verifica se o item pertence ao comércio
        // autenticado.
        //
        // ========================================================

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
                WHERE
                    ic.id = ?
                    AND c.comercio_id = ?
                LIMIT 1
                `,
                [
                    itemId,
                    comercioId
                ]
            );


        // ========================================================
        // ITEM NÃO ENCONTRADO
        // ========================================================

        if (
            !itens ||
            itens.length === 0
        ) {

            return res.status(404).json({

                message:
                    'Item não encontrado para este comércio.'

            });

        }


        const itemAtual =
            itens[0];


        // ========================================================
        // CATEGORIA
        // ========================================================

        const categoriaFinal =
            categoria_id !== undefined &&
            categoria_id !== null &&
            categoria_id !== ''
                ? Number(categoria_id)
                : Number(itemAtual.categoria_id);


        if (
            !categoriaFinal ||
            Number.isNaN(categoriaFinal)
        ) {

            return res.status(400).json({

                message:
                    'A categoria é obrigatória.'

            });

        }


        // ========================================================
        // VERIFICA SE A CATEGORIA PERTENCE AO COMÉRCIO
        // ========================================================

        const categorias =
            await conexao.query(
                `
                SELECT
                    cc.id
                FROM categorias_cardapio cc
                INNER JOIN cardapios c
                    ON c.id = cc.cardapio_id
                WHERE
                    cc.id = ?
                    AND c.comercio_id = ?
                LIMIT 1
                `,
                [
                    categoriaFinal,
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
        // NOME
        // ========================================================

        const nomeFinal =
            nome !== undefined
                ? String(nome).trim()
                : String(itemAtual.nome).trim();


        if (!nomeFinal) {

            return res.status(400).json({

                message:
                    'O nome do item é obrigatório.'

            });

        }


        // ========================================================
        // PREÇO
        // ========================================================

        let precoFinal;


        if (
            preco === undefined ||
            preco === null ||
            preco === ''
        ) {

            precoFinal =
                Number(itemAtual.preco);

        } else {

            precoFinal =
                Number(
                    String(preco).replace(',', '.')
                );

        }


        if (
            Number.isNaN(precoFinal) ||
            precoFinal <= 0
        ) {

            return res.status(400).json({

                message:
                    'O preço do item é inválido.'

            });

        }


        // ========================================================
        // DESCRIÇÃO
        // ========================================================

        let descricaoFinal;


        if (descricao !== undefined) {

            descricaoFinal =
                String(descricao).trim()
                    ? String(descricao).trim()
                    : null;

        } else {

            descricaoFinal =
                itemAtual.descricao || null;

        }


        // ========================================================
        // DISPONIBILIDADE
        // ========================================================

        let disponivelFinal;


        if (disponivel === undefined) {

            disponivelFinal =
                Boolean(itemAtual.disponivel);

        } else {

            disponivelFinal =
                disponivel === true ||
                disponivel === 1 ||
                disponivel === '1' ||
                disponivel === 'true';

        }


        // ========================================================
        // FOTO
        // ========================================================

        let fotoFinal =
            itemAtual.foto || null;


        // --------------------------------------------------------
        // SE FOI ENVIADA UMA NOVA FOTO
        // --------------------------------------------------------

        if (req.file) {

            fotoFinal =
                `/uploads/cardapio/${req.file.filename}`;

        }


        // ========================================================
        // ATUALIZA ITEM
        // ========================================================

        await conexao.query(
            `
            UPDATE itens_cardapio
            SET
                categoria_id = ?,
                nome = ?,
                foto = ?,
                preco = ?,
                descricao = ?,
                disponivel = ?
            WHERE
                id = ?
            `,
            [
                categoriaFinal,
                nomeFinal,
                fotoFinal,
                precoFinal,
                descricaoFinal,
                disponivelFinal,
                itemId
            ]
        );


        // ========================================================
        // BUSCA ITEM ATUALIZADO
        // ========================================================

        const itemAtualizado =
            await conexao.query(
                `
                SELECT
                    id,
                    categoria_id,
                    nome,
                    foto,
                    preco,
                    descricao,
                    disponivel
                FROM itens_cardapio
                WHERE id = ?
                LIMIT 1
                `,
                [
                    itemId
                ]
            );


        // ========================================================
        // FORMATA ITEM
        // ========================================================

        const itemFormatado = {

            id:
                Number(
                    itemAtualizado[0].id
                ),

            categoria_id:
                Number(
                    itemAtualizado[0].categoria_id
                ),

            nome:
                itemAtualizado[0].nome,

            foto:
                itemAtualizado[0].foto || null,

            preco:
                Number(
                    itemAtualizado[0].preco
                ),

            descricao:
                itemAtualizado[0].descricao || null,

            disponivel:
                Boolean(
                    itemAtualizado[0].disponivel
                )

        };


        // ========================================================
        // RESPOSTA
        // ========================================================

        return res.status(200).json({

            message:
                'Item alterado com sucesso.',

            item:
                itemFormatado

        });


    } catch (error) {

        console.error(
            'Erro ao alterar item:',
            error
        );


        return res.status(500).json({

            message:
                'Erro interno ao alterar item.'

        });


    } finally {

        if (conexao) {
            conexao.release();
        }

    }

}


// ================================================================
// ALTERAR DISPONIBILIDADE DO ITEM
// ================================================================
//
// Este endpoint altera somente a disponibilidade do item.
//
// true  = Disponível
// false = Indisponível
//
// Também verifica se o item pertence ao comércio autenticado.
// ================================================================

export async function alterarDisponibilidadeItem(req, res) {

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
        // ID DO ITEM
        // ========================================================

        const itemId =
            Number(req.params.id);


        if (
            !itemId ||
            Number.isNaN(itemId)
        ) {

            return res.status(400).json({

                message:
                    'ID do item inválido.'

            });

        }


        // ========================================================
        // DISPONIBILIDADE RECEBIDA
        // ========================================================

        const {
            disponivel
        } = req.body || {};


        // ========================================================
        // VALIDA DISPONIBILIDADE
        // ========================================================

        let novaDisponibilidade;


        if (disponivel === true) {

            novaDisponibilidade = true;

        } else if (disponivel === false) {

            novaDisponibilidade = false;

        } else if (
            disponivel === 1 ||
            disponivel === '1' ||
            disponivel === 'true'
        ) {

            novaDisponibilidade = true;

        } else if (
            disponivel === 0 ||
            disponivel === '0' ||
            disponivel === 'false'
        ) {

            novaDisponibilidade = false;

        } else {

            return res.status(400).json({

                message:
                    'A disponibilidade deve ser true ou false.'

            });

        }


        // ========================================================
        // CONEXÃO
        // ========================================================

        conexao =
            await db.getConnection();


        // ========================================================
        // CONSULTA O ITEM NO BANCO
        // ========================================================
        //
        // Aqui o banco informa qual é o estado atual do item.
        //
        // Também verificamos se o item pertence ao comércio
        // autenticado.
        //
        // ========================================================

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
                WHERE
                    ic.id = ?
                    AND c.comercio_id = ?
                LIMIT 1
                `,
                [
                    itemId,
                    comercioId
                ]
            );


        // ========================================================
        // ITEM NÃO ENCONTRADO
        // ========================================================

        if (
            !itens ||
            itens.length === 0
        ) {

            return res.status(404).json({

                message:
                    'Item não encontrado para este comércio.'

            });

        }


        // ========================================================
        // ESTADO ATUAL DO BANCO
        // ========================================================

        const itemAtual =
            itens[0];


        const disponibilidadeAtual =
            Boolean(
                itemAtual.disponivel
            );


        // ========================================================
        // ATUALIZA DISPONIBILIDADE
        // ========================================================

        await conexao.query(
            `
            UPDATE itens_cardapio
            SET
                disponivel = ?
            WHERE
                id = ?
            `,
            [
                novaDisponibilidade,
                itemId
            ]
        );


        // ========================================================
        // BUSCA NOVAMENTE NO BANCO
        // ========================================================
        //
        // Assim a resposta vem realmente do estado salvo
        // no MariaDB.
        //
        // ========================================================

        const itemAtualizado =
            await conexao.query(
                `
                SELECT
                    id,
                    categoria_id,
                    nome,
                    foto,
                    preco,
                    descricao,
                    disponivel
                FROM itens_cardapio
                WHERE
                    id = ?
                LIMIT 1
                `,
                [
                    itemId
                ]
            );


        // ========================================================
        // FORMATA ITEM
        // ========================================================

        const itemFormatado = {

            id:
                Number(
                    itemAtualizado[0].id
                ),

            categoria_id:
                Number(
                    itemAtualizado[0].categoria_id
                ),

            nome:
                itemAtualizado[0].nome,

            foto:
                itemAtualizado[0].foto || null,

            preco:
                Number(
                    itemAtualizado[0].preco
                ),

            descricao:
                itemAtualizado[0].descricao || null,

            disponivel:
                Boolean(
                    itemAtualizado[0].disponivel
                )

        };


        // ========================================================
        // RESPOSTA
        // ========================================================

        return res.status(200).json({

            message:
                novaDisponibilidade
                    ? 'Item marcado como disponível.'
                    : 'Item marcado como indisponível.',

            disponibilidade_anterior:
                disponibilidadeAtual,

            disponibilidade_atual:
                itemFormatado.disponivel,

            item:
                itemFormatado

        });


    } catch (error) {

        console.error(
            'Erro ao alterar disponibilidade do item:',
            error
        );


        return res.status(500).json({

            message:
                'Erro interno ao alterar disponibilidade do item.'

        });


    } finally {

        if (conexao) {
            conexao.release();
        }

    }


}


export async function excluirItem(req, res) {

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
        // ID DO ITEM
        // ========================================================

        const itemId =
            Number(req.params.id);


        if (
            !itemId ||
            Number.isNaN(itemId)
        ) {

            return res.status(400).json({

                message:
                    'ID do item inválido.'

            });

        }


        // ========================================================
        // CONEXÃO
        // ========================================================

        conexao =
            await db.getConnection();


        // ========================================================
        // VERIFICAR SE O ITEM PERTENCE AO COMÉRCIO
        // ========================================================

        const itens =
            await conexao.query(
                `
                SELECT
                    ic.id,
                    ic.nome
                FROM itens_cardapio ic

                INNER JOIN categorias_cardapio cc
                    ON cc.id = ic.categoria_id

                INNER JOIN cardapios c
                    ON c.id = cc.cardapio_id

                WHERE
                    ic.id = ?
                    AND c.comercio_id = ?

                LIMIT 1
                `,
                [
                    itemId,
                    comercioId
                ]
            );


        // ========================================================
        // ITEM NÃO ENCONTRADO
        // ========================================================

        if (
            !itens ||
            itens.length === 0
        ) {

            return res.status(404).json({

                message:
                    'Item não encontrado para este comércio.'

            });

        }


        // ========================================================
        // EXCLUIR ITEM
        // ========================================================

        await conexao.query(
            `
            DELETE FROM itens_cardapio
            WHERE id = ?
            `,
            [
                itemId
            ]
        );


        // ========================================================
        // RESPOSTA
        // ========================================================

        return res.status(200).json({

            message:
                'Item excluído com sucesso.',

            item: {

                id:
                    itemId,

                nome:
                    itens[0].nome

            }

        });


    } catch (error) {

        console.error(
            'Erro ao excluir item:',
            error
        );


        // ========================================================
        // ERRO DE CHAVE ESTRANGEIRA
        // ========================================================

        if (
            error.code ===
            'ER_ROW_IS_REFERENCED_2'
        ) {

            return res.status(409).json({

                message:
                    'Não foi possível excluir o item porque ele possui registros relacionados.'

            });

        }


        return res.status(500).json({

            message:
                'Erro interno ao excluir item.'

        });


    } finally {

        if (conexao) {

            conexao.release();

        }

    }

}

// ================================================================
// ALTERAR CATEGORIA
// ================================================================
//
// Altera o nome de uma categoria do cardápio.
//
// Também verifica:
// - se existe comércio no token
// - se a categoria pertence ao comércio
// - se o novo nome foi informado
// - se já existe outra categoria com o mesmo nome
//
// ================================================================

export async function alterarCategoria(req, res) {

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
        // ID DA CATEGORIA
        // ========================================================

        const categoriaId =
            Number(req.params.id);


        if (
            !categoriaId ||
            Number.isNaN(categoriaId)
        ) {

            return res.status(400).json({

                message:
                    'ID da categoria inválido.'

            });

        }


        // ========================================================
        // DADOS RECEBIDOS
        // ========================================================

        const {
            nome
        } = req.body || {};


        // ========================================================
        // VALIDA NOME
        // ========================================================

        if (
            !nome ||
            !String(nome).trim()
        ) {

            return res.status(400).json({

                message:
                    'O nome da categoria é obrigatório.'

            });

        }


        const nomeCategoria =
            String(nome).trim();


        // ========================================================
        // CONEXÃO
        // ========================================================

        conexao =
            await db.getConnection();


        // ========================================================
        // VERIFICA SE A CATEGORIA PERTENCE AO COMÉRCIO
        // ========================================================

        const categorias =
            await conexao.query(
                `
                SELECT
                    cc.id,
                    cc.nome,
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
                    categoriaId,
                    comercioId
                ]
            );


        // ========================================================
        // CATEGORIA NÃO ENCONTRADA
        // ========================================================

        if (
            !categorias ||
            categorias.length === 0
        ) {

            return res.status(404).json({

                message:
                    'Categoria não encontrada para este comércio.'

            });

        }


        const categoriaAtual =
            categorias[0];


        // ========================================================
        // VERIFICA NOME DUPLICADO
        // ========================================================
        //
        // A verificação é feita somente dentro do mesmo cardápio.
        //
        // A própria categoria que está sendo editada é ignorada.
        //
        // ========================================================

        const categoriasExistentes =
            await conexao.query(
                `
                SELECT
                    id
                FROM categorias_cardapio
                WHERE
                    cardapio_id = ?
                    AND LOWER(TRIM(nome)) = LOWER(TRIM(?))
                    AND id <> ?
                LIMIT 1
                `,
                [
                    categoriaAtual.cardapio_id,
                    nomeCategoria,
                    categoriaId
                ]
            );


        // ========================================================
        // NOME JÁ EXISTE
        // ========================================================

        if (
            categoriasExistentes &&
            categoriasExistentes.length > 0
        ) {

            return res.status(409).json({

                message:
                    'Já existe uma categoria com este nome.'

            });

        }


        // ========================================================
        // ATUALIZA CATEGORIA
        // ========================================================

        await conexao.query(
            `
            UPDATE categorias_cardapio
            SET
                nome = ?
            WHERE
                id = ?
            `,
            [
                nomeCategoria,
                categoriaId
            ]
        );


        // ========================================================
        // BUSCA CATEGORIA ATUALIZADA
        // ========================================================

        const categoriaAtualizada =
            await conexao.query(
                `
                SELECT
                    id,
                    cardapio_id,
                    nome
                FROM categorias_cardapio
                WHERE
                    id = ?
                LIMIT 1
                `,
                [
                    categoriaId
                ]
            );


        // ========================================================
        // RESPOSTA
        // ========================================================

        return res.status(200).json({

            message:
                'Categoria alterada com sucesso.',

            categoria: {

                id:
                    Number(
                        categoriaAtualizada[0].id
                    ),

                cardapio_id:
                    Number(
                        categoriaAtualizada[0].cardapio_id
                    ),

                nome:
                    categoriaAtualizada[0].nome

            }

        });


    } catch (error) {

        // ========================================================
        // ERRO
        // ========================================================

        console.error(
            'Erro ao alterar categoria:',
            error
        );


        // ========================================================
        // CATEGORIA DUPLICADA
        // ========================================================

        if (
            error.code ===
            'ER_DUP_ENTRY'
        ) {

            return res.status(409).json({

                message:
                    'Já existe uma categoria com este nome.'

            });

        }


        return res.status(500).json({

            message:
                'Erro interno ao alterar categoria.'

        });


    } finally {

        // ========================================================
        // LIBERAR CONEXÃO
        // ========================================================

        if (conexao) {

            conexao.release();

        }

    }

}