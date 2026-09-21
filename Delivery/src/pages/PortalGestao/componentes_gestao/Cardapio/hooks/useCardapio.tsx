import { useEffect, useState } from 'react';

import {
    buscarCategorias,
    buscarItens,
    buscarDadosComercio,
    criarCategoria,
    alterarCategoria,
    alterarDisponibilidadeItem,
    excluirItem,
    excluirCategoria
} from '../api/cardapio.api';

import type {
    Categoria,
    Item,
    ItemRecebidoAPI,
    DadosComercio
} from '../types/cardapio.types';



// ================================================================
// HOOK DO CARDÁPIO
// ================================================================

export function useCardapio() {

    // ============================================================
    // ESTADOS DOS DADOS
    // ============================================================

    const [categorias, setCategorias] =
        useState<Categoria[]>([]);

    const [itens, setItens] =
        useState<Item[]>([]);


    // ============================================================
    // ESTADO DA CATEGORIA SELECIONADA
    // ============================================================

    const [categoriaSelecionada, setCategoriaSelecionada] =
        useState<number | null>(null);


    // ============================================================
    // ITENS SELECIONADOS
    // ============================================================

    const [itensSelecionados, setItensSelecionados] =
        useState<number[]>([]);


    // ============================================================
    // MODAL NOVO ITEM
    // ============================================================

    const [mostrarNovoItem, setMostrarNovoItem] =
        useState(false);


    // ============================================================
    // MODAL NOVA CATEGORIA
    // ============================================================

    const [mostrarNovaCategoria, setMostrarNovaCategoria] =
        useState(false);


    // ============================================================
    // CATEGORIA EM ALTERAÇÃO
    // ============================================================

    const [categoriaEmEdicao, setCategoriaEmEdicao] =
        useState<Categoria | null>(null);


    // ============================================================
    // ITEM EM ALTERAÇÃO
    // ============================================================

    const [itemEmAlteracao, setItemEmAlteracao] =
        useState<Item | null>(null);


    // ============================================================
    // ITEM SENDO VISUALIZADO
    // ============================================================

    const [itemEmVisualizacao, setItemEmVisualizacao] =
        useState<Item | null>(null);


    // ============================================================
    // BUSCA
    // ============================================================

    const [busca, setBusca] =
        useState('');


    // ============================================================
    // FILTRO DE STATUS
    // ============================================================

    const [filtroStatus, setFiltroStatus] =
        useState('todos');


    // ============================================================
    // NOME DO COMÉRCIO
    // ============================================================

    const [nomeComercio, setNomeComercio] =
        useState('Carregando...');


    // ============================================================
    // ESTADOS DE CARREGAMENTO
    // ============================================================

    const [carregandoCategorias, setCarregandoCategorias] =
        useState(false);

    const [carregandoItens, setCarregandoItens] =
        useState(false);


    // ============================================================
    // ESTADO AO SALVAR CATEGORIA
    // ============================================================

    const [salvandoCategoria, setSalvandoCategoria] =
        useState(false);


    // ============================================================
    // ESTADO AO EXCLUIR UM ITEM
    // ============================================================

    const [excluindoItemId, setExcluindoItemId] =
        useState<number | null>(null);


    // ============================================================
    // ESTADO AO EXCLUIR ITENS SELECIONADOS
    // ============================================================

    const [excluindoSelecionados, setExcluindoSelecionados] =
        useState(false);


    // ============================================================
    // ERRO
    // ============================================================

    const [erro, setErro] =
        useState('');


    // ================================================================
    // CONVERTER BOOLEANO
    // ================================================================

    function converterBooleano(
        valor: boolean | number | string
    ): boolean {

        if (typeof valor === 'boolean') {
            return valor;
        }

        if (typeof valor === 'number') {
            return valor === 1;
        }

        return (
            valor === '1' ||
            valor === 'true'
        );
    }


    // ================================================================
    // CONVERTER QUANTIDADE
    // ================================================================

    function converterQuantidade(
        valor: unknown
    ): number {

        const quantidade =
            Number(valor);

        if (
            !Number.isFinite(
                quantidade
            )
        ) {

            return 0;
        }

        return Math.max(
            0,
            quantidade
        );
    }


    // ================================================================
    // CARREGAR CATEGORIAS
    // ================================================================

    async function carregarCategorias() {

        try {

            setCarregandoCategorias(true);
            setErro('');

            const categoriasRecebidas:
                Categoria[] =
                await buscarCategorias();

            const categoriasConvertidas:
                Categoria[] =
                categoriasRecebidas.map(
                    (categoria) => ({

                        ...categoria,

                        quantidade:
                            converterQuantidade(
                                categoria.quantidade
                            )
                    })
                );

            setCategorias(
                categoriasConvertidas
            );

        } catch (error) {

            console.error(
                'Erro ao carregar categorias:',
                error
            );

            if (error instanceof Error) {

                setErro(
                    error.message
                );

            } else {

                setErro(
                    'Erro ao carregar categorias.'
                );
            }

        } finally {

            setCarregandoCategorias(false);
        }
    }


    // ================================================================
    // CARREGAR ITENS
    // ================================================================

    async function carregarItens() {

        try {

            setCarregandoItens(true);
            setErro('');

            const itensRecebidos:
                ItemRecebidoAPI[] =
                await buscarItens();

            const itensConvertidos:
                Item[] =
                itensRecebidos.map(
                    (item) => {

                        const disponivel =
                            converterBooleano(
                                item.disponivel
                            );

                        return {

                            id:
                                Number(
                                    item.id
                                ),

                            nome:
                                item.nome,

                            preco:
                                Number(
                                    item.preco
                                ),

                            imagem:
                                item.foto || '',

                            descricao:
                                item.descricao || '',

                            disponivel,

                            categoriaId:
                                Number(
                                    item.categoria_id
                                ),

                            statusVenda:
                                disponivel
                                    ? 'ativo'
                                    : 'pausado'
                        };
                    }
                );

            setItens(
                itensConvertidos
            );

        } catch (error) {

            console.error(
                'Erro ao carregar itens:',
                error
            );

            if (error instanceof Error) {

                setErro(
                    error.message
                );

            } else {

                setErro(
                    'Erro ao carregar itens.'
                );
            }

        } finally {

            setCarregandoItens(false);
        }
    }


    // ================================================================
    // CARREGAR DADOS DO COMÉRCIO
    // ================================================================

    async function carregarDadosComercio() {

        try {

            const comercio:
                DadosComercio =
                await buscarDadosComercio();

            setNomeComercio(
                comercio.nome_comercio
            );

        } catch (error) {

            console.error(
                'Erro ao carregar dados do comércio:',
                error
            );

            if (error instanceof Error) {

                setErro(
                    error.message
                );

            } else {

                setErro(
                    'Erro ao carregar dados do comércio.'
                );
            }
        }
    }


    // ================================================================
    // SALVAR CATEGORIA
    // ================================================================

    async function handleSalvarCategoria(
        nomeCategoria: string
    ) {

        try {

            setSalvandoCategoria(true);
            setErro('');


            // ========================================================
            // EDITAR CATEGORIA
            // ========================================================

            if (categoriaEmEdicao) {

                const categoriaAnterior =
                    categoriaEmEdicao;

                const categoriaAtualizada =
                    await alterarCategoria(
                        categoriaAnterior.id,
                        nomeCategoria
                    );

                const quantidadeConvertida =
                    converterQuantidade(
                        categoriaAtualizada.quantidade
                    );

                const categoriaConvertida:
                    Categoria = {

                        ...categoriaAtualizada,

                        quantidade:
                            quantidadeConvertida ||
                            categoriaAnterior.quantidade
                    };

                setCategorias(
                    (categoriasAtuais) =>
                        categoriasAtuais.map(
                            (categoria) =>
                                categoria.id ===
                                categoriaConvertida.id
                                    ? categoriaConvertida
                                    : categoria
                        )
                );

                setCategoriaEmEdicao(null);

                setMostrarNovaCategoria(false);

                return true;
            }


            // ========================================================
            // CRIAR NOVA CATEGORIA
            // ========================================================

            const novaCategoria:
                Categoria =
                await criarCategoria(
                    nomeCategoria
                );

            const categoriaConvertida:
                Categoria = {

                    ...novaCategoria,

                    quantidade:
                        converterQuantidade(
                            novaCategoria.quantidade
                        )
                };

            setCategorias(
                (categoriasAtuais) => [

                    ...categoriasAtuais,

                    categoriaConvertida

                ]
            );

            setMostrarNovaCategoria(false);

            return true;

        } catch (error) {

            console.error(
                categoriaEmEdicao
                    ? 'Erro ao alterar categoria:'
                    : 'Erro ao criar categoria:',
                error
            );

            if (
                error instanceof Error
            ) {

                setErro(
                    error.message
                );

            } else {

                setErro(
                    categoriaEmEdicao
                        ? 'Erro ao alterar categoria.'
                        : 'Erro ao criar categoria.'
                );
            }

            return false;

        } finally {

            setSalvandoCategoria(false);
        }
    }


    // ================================================================
    // FECHAR MODAL DA CATEGORIA
    // ================================================================

    function handleFecharNovaCategoria() {

        setMostrarNovaCategoria(
            false
        );

        setCategoriaEmEdicao(
            null
        );
    }


    // ================================================================
    // ABRIR ALTERAÇÃO DE CATEGORIA
    // ================================================================

    function handleAlterarCategoria(
        categoria: Categoria
    ) {

        setCategoriaEmEdicao(
            categoria
        );

        setMostrarNovaCategoria(
            true
        );
    }


    // ================================================================
    // ITEM CRIADO
    // ================================================================

    async function handleItemCriado(
        itemRecebido: ItemRecebidoAPI
    ) {

        const disponivel =
            converterBooleano(
                itemRecebido.disponivel
            );

        const novoItem:
            Item = {

            id:
                Number(
                    itemRecebido.id
                ),

            nome:
                itemRecebido.nome,

            preco:
                Number(
                    itemRecebido.preco
                ),

            imagem:
                itemRecebido.foto || '',

            descricao:
                itemRecebido.descricao || '',

            disponivel,

            categoriaId:
                Number(
                    itemRecebido.categoria_id
                ),

            statusVenda:
                disponivel
                    ? 'ativo'
                    : 'pausado'
        };

        setItens(
            (itensAtuais) => [

                ...itensAtuais,

                novoItem

            ]
        );

        await carregarCategorias();

        setMostrarNovoItem(false);
    }


    // ================================================================
    // ABRIR ALTERAÇÃO DE ITEM
    // ================================================================

    function handleAlterarItem(
        item: Item
    ) {

        setItemEmAlteracao(
            item
        );

        setMostrarNovoItem(
            true
        );
    }


    // ================================================================
    // ABRIR VISUALIZAÇÃO DO ITEM
    // ================================================================

    function handleVerItem(
        item: Item
    ) {

        setItemEmVisualizacao(
            item
        );
    }


    // ================================================================
    // FECHAR VISUALIZAÇÃO DO ITEM
    // ================================================================

    function handleFecharVerItem() {

        setItemEmVisualizacao(
            null
        );
    }


    // ================================================================
    // FECHAR MODAL DO ITEM
    // ================================================================

    function handleFecharNovoItem() {

        setMostrarNovoItem(
            false
        );

        setItemEmAlteracao(
            null
        );
    }


    // ================================================================
    // ITEM ALTERADO
    // ================================================================

    async function handleItemAlterado(
        itemRecebido: ItemRecebidoAPI
    ) {

        const disponivel =
            converterBooleano(
                itemRecebido.disponivel
            );

        const itemAtualizado:
            Item = {

            id:
                Number(
                    itemRecebido.id
                ),

            nome:
                itemRecebido.nome,

            preco:
                Number(
                    itemRecebido.preco
                ),

            imagem:
                itemRecebido.foto || '',

            descricao:
                itemRecebido.descricao || '',

            disponivel,

            categoriaId:
                Number(
                    itemRecebido.categoria_id
                ),

            statusVenda:
                disponivel
                    ? 'ativo'
                    : 'pausado'
        };

        setItens(
            (itensAtuais) =>
                itensAtuais.map(
                    (item) =>
                        item.id ===
                        itemAtualizado.id
                            ? itemAtualizado
                            : item
                )
        );

        await carregarCategorias();

        setItemEmAlteracao(
            null
        );

        setMostrarNovoItem(
            false
        );
    }


    // ================================================================
    // EXCLUIR UM ITEM
    // ================================================================

    async function handleExcluirItem(
        item: Item
    ) {

        try {

            setExcluindoItemId(
                item.id
            );

            setErro('');

            await excluirItem(
                item.id
            );

            setItens(
                (itensAtuais) =>
                    itensAtuais.filter(
                        (itemAtual) =>
                            itemAtual.id !==
                            item.id
                    )
            );

            setItensSelecionados(
                (selecionados) =>
                    selecionados.filter(
                        (id) =>
                            id !== item.id
                    )
            );

            await carregarCategorias();

            return true;

        } catch (error) {

            console.error(
                'Erro ao excluir item:',
                error
            );

            if (
                error instanceof Error
            ) {

                setErro(
                    error.message
                );

            } else {

                setErro(
                    'Erro ao excluir item.'
                );
            }

            return false;

        } finally {

            setExcluindoItemId(
                null
            );
        }
    }


    // ================================================================
    // SELECIONAR / DESSELECIONAR ITEM
    // ================================================================

    function alternarItem(
        id: number
    ) {

        setItensSelecionados(
            (selecionados) => {

                if (
                    selecionados.includes(id)
                ) {

                    return selecionados.filter(
                        (itemId) =>
                            itemId !== id
                    );
                }

                return [

                    ...selecionados,

                    id

                ];
            }
        );
    }


    // ================================================================
    // ITENS FILTRADOS
    // ================================================================

    const itensFiltrados =
        itens.filter(
            (item) => {

                const pertenceCategoria =
                    categoriaSelecionada === null ||
                    item.categoriaId ===
                        categoriaSelecionada;

                const correspondeBusca =
                    item.nome
                        .toLowerCase()
                        .includes(
                            busca
                                .toLowerCase()
                                .trim()
                        );

                const correspondeStatus =
                    filtroStatus === 'todos' ||
                    (
                        filtroStatus === 'ativos' &&
                        item.disponivel
                    ) ||
                    (
                        filtroStatus === 'pausados' &&
                        !item.disponivel
                    );

                return (
                    pertenceCategoria &&
                    correspondeBusca &&
                    correspondeStatus
                );
            }
        );


    // ================================================================
    // VERIFICAR SE TODOS OS ITENS ESTÃO SELECIONADOS
    // ================================================================

    const todosSelecionados =
        itensFiltrados.length > 0 &&
        itensFiltrados.every(
            (item) =>
                itensSelecionados.includes(
                    item.id
                )
        );


    // ================================================================
    // SELECIONAR / DESSELECIONAR TODOS
    // ================================================================

    function alternarTodos() {

        if (
            itensFiltrados.length === 0
        ) {

            return;
        }

        if (
            todosSelecionados
        ) {

            setItensSelecionados(
                (selecionados) =>
                    selecionados.filter(
                        (id) =>
                            !itensFiltrados.some(
                                (item) =>
                                    item.id === id
                            )
                    )
            );

            return;
        }

        setItensSelecionados(
            (selecionados) => {

                const idsAtuais =
                    new Set(
                        selecionados
                    );

                itensFiltrados.forEach(
                    (item) => {

                        idsAtuais.add(
                            item.id
                        );
                    }
                );

                return Array.from(
                    idsAtuais
                );
            }
        );
    }


    // ================================================================
    // EXCLUIR ITENS SELECIONADOS
    // ================================================================

    async function handleExcluirSelecionados() {

        if (
            itensSelecionados.length === 0
        ) {

            return;
        }

        try {

            setExcluindoSelecionados(
                true
            );

            setErro('');

            const idsParaExcluir =
                [
                    ...itensSelecionados
                ];

            for (
                const id
                of idsParaExcluir
            ) {

                await excluirItem(
                    id
                );
            }

            setItens(
                (itensAtuais) =>
                    itensAtuais.filter(
                        (item) =>
                            !idsParaExcluir.includes(
                                item.id
                            )
                    )
            );

            await carregarCategorias();

            setItensSelecionados([]);

        } catch (error) {

            console.error(
                'Erro ao excluir itens selecionados:',
                error
            );

            if (
                error instanceof Error
            ) {

                setErro(
                    error.message
                );

            } else {

                setErro(
                    'Erro ao excluir itens selecionados.'
                );
            }

        } finally {

            setExcluindoSelecionados(
                false
            );
        }
    }


    // ================================================================
    // CATEGORIA ATUAL
    // ================================================================

    const categoriaAtual =
        categorias.find(
            (categoria) =>
                categoria.id ===
                categoriaSelecionada
        );


    // ================================================================
    // ALTERAR DISPONIBILIDADE
    // ================================================================
    //
    // Existem dois modos:
    //
    // 1. itemId informado:
    //    altera somente aquele item.
    //
    // 2. itemId não informado:
    //    altera todos os itens selecionados.
    //
    // ================================================================

    async function handleAlterarDisponibilidade(
        disponibilidadeSolicitada: boolean,
        itemId?: number
    ) {

        try {

            setErro('');


            // ========================================================
            // MODO 1 — ALTERAÇÃO DE UM ÚNICO ITEM
            // ========================================================

            if (
                itemId !== undefined
            ) {

                const item =
                    itens.find(
                        (itemAtual) =>
                            Number(itemAtual.id) ===
                            Number(itemId)
                    );


                // ====================================================
                // ITEM NÃO ENCONTRADO
                // ====================================================

                if (!item) {

                    throw new Error(
                        'Item não encontrado.'
                    );
                }


                // ====================================================
                // SE JÁ ESTIVER NO ESTADO SOLICITADO,
                // NÃO ENVIA PATCH DESNECESSÁRIO.
                // ====================================================

                if (
                    item.disponivel ===
                    disponibilidadeSolicitada
                ) {

                    return;
                }


                // ====================================================
                // ALTERAR NO BANCO
                // ====================================================

                const resposta =
                    await alterarDisponibilidadeItem(
                        Number(item.id),
                        disponibilidadeSolicitada
                    );


                // ====================================================
                // BACKEND PRECISA RETORNAR O ITEM ATUALIZADO
                // ====================================================

                const itemConfirmado =
                    resposta?.item;


                if (!itemConfirmado) {

                    throw new Error(
                        'O servidor não retornou os dados atualizados do item.'
                    );
                }


                // ====================================================
                // CONVERTER O ITEM RETORNADO
                // ====================================================

                const disponivel =
                    converterBooleano(
                        itemConfirmado.disponivel
                    );


                const itemConvertido:
                    Item = {

                    id:
                        Number(
                            itemConfirmado.id
                        ),

                    nome:
                        itemConfirmado.nome,

                    preco:
                        Number(
                            itemConfirmado.preco
                        ),

                    imagem:
                        itemConfirmado.foto || '',

                    descricao:
                        itemConfirmado.descricao || '',

                    disponivel,

                    categoriaId:
                        Number(
                            itemConfirmado.categoria_id
                        ),

                    statusVenda:
                        disponivel
                            ? 'ativo'
                            : 'pausado'
                };


                // ====================================================
                // ATUALIZAR SOMENTE O ITEM ALTERADO
                // ====================================================

                setItens(
                    (itensAtuais) =>
                        itensAtuais.map(
                            (itemAtual) =>
                                Number(itemAtual.id) ===
                                Number(itemConvertido.id)
                                    ? itemConvertido
                                    : itemAtual
                        )
                );


                return;
            }


            // ========================================================
            // MODO 2 — ALTERAÇÃO DOS ITENS SELECIONADOS
            // ========================================================

            if (
                itensSelecionados.length === 0
            ) {

                return;
            }


            // ========================================================
            // CONSULTAR NOVAMENTE O BANCO
            // ========================================================

            const itensRecebidos:
                ItemRecebidoAPI[] =
                await buscarItens();


            // ========================================================
            // PEGAR SOMENTE OS ITENS SELECIONADOS
            // ========================================================

            const itensSelecionadosBanco =
                itensRecebidos.filter(
                    (itemBanco) =>
                        itensSelecionados.includes(
                            Number(itemBanco.id)
                        )
                );


            // ========================================================
            // VERIFICAR SE TODOS FORAM ENCONTRADOS
            // ========================================================

            if (
                itensSelecionadosBanco.length !==
                itensSelecionados.length
            ) {

                throw new Error(
                    'Um ou mais itens selecionados não foram encontrados no banco de dados.'
                );
            }


            // ========================================================
            // COPIAR OS ITENS RECEBIDOS
            // ========================================================

            const itensAtualizados =
                [
                    ...itensRecebidos
                ];


            // ========================================================
            // ALTERAR SOMENTE QUEM PRECISA
            // ========================================================

            for (
                const itemBanco
                of itensSelecionadosBanco
            ) {

                const disponibilidadeAtual =
                    converterBooleano(
                        itemBanco.disponivel
                    );


                // ----------------------------------------------------
                // JÁ ESTÁ CORRETO
                // ----------------------------------------------------

                if (
                    disponibilidadeAtual ===
                    disponibilidadeSolicitada
                ) {

                    continue;
                }


                // ----------------------------------------------------
                // ALTERAR NO BANCO
                // ----------------------------------------------------

                const resposta =
                    await alterarDisponibilidadeItem(
                        Number(itemBanco.id),
                        disponibilidadeSolicitada
                    );


                // ----------------------------------------------------
                // PEGAR ITEM CONFIRMADO
                // ----------------------------------------------------

                const itemConfirmado =
                    resposta?.item;


                if (!itemConfirmado) {

                    throw new Error(
                        `O servidor não retornou os dados atualizados do item ${itemBanco.nome}.`
                    );
                }


                // ----------------------------------------------------
                // LOCALIZAR ITEM NA LISTA
                // ----------------------------------------------------

                const indice =
                    itensAtualizados.findIndex(
                        (item) =>
                            Number(item.id) ===
                            Number(itemConfirmado.id)
                    );


                // ----------------------------------------------------
                // SUBSTITUIR PELO ITEM CONFIRMADO
                // ----------------------------------------------------

                if (
                    indice !== -1
                ) {

                    itensAtualizados[
                        indice
                    ] = itemConfirmado;
                }
            }


            // ========================================================
            // CONVERTER TODOS OS ITENS PARA Item
            // ========================================================

            const itensConvertidos:
                Item[] =
                itensAtualizados.map(
                    (item) => {

                        const disponivel =
                            converterBooleano(
                                item.disponivel
                            );

                        return {

                            id:
                                Number(
                                    item.id
                                ),

                            nome:
                                item.nome,

                            preco:
                                Number(
                                    item.preco
                                ),

                            imagem:
                                item.foto || '',

                            descricao:
                                item.descricao || '',

                            disponivel,

                            categoriaId:
                                Number(
                                    item.categoria_id
                                ),

                            statusVenda:
                                disponivel
                                    ? 'ativo'
                                    : 'pausado'
                        };
                    }
                );


            // ========================================================
            // ATUALIZAR A TELA
            // ========================================================

            setItens(
                itensConvertidos
            );


            // ========================================================
            // LIMPAR SELEÇÃO
            // ========================================================

            setItensSelecionados([]);


        } catch (error) {

            console.error(
                'Erro ao alterar disponibilidade:',
                error
            );


            if (
                error instanceof Error
            ) {

                setErro(
                    error.message
                );

            } else {

                setErro(
                    'Não foi possível alterar a disponibilidade.'
                );
            }
        }
    }


    // ================================================================
    // EXCLUIR CATEGORIA
    // ================================================================

    async function handleExcluirCategoria(
        categoriaId: number
    ) {

        try {

            await excluirCategoria(
                categoriaId
            );


            const itensExcluidos =
                itens
                    .filter(
                        (item) =>
                            item.categoriaId ===
                            categoriaId
                    )
                    .map(
                        (item) =>
                            item.id
                    );


            // ========================================================
            // REMOVER CATEGORIA
            // ========================================================

            setCategorias(
                (categoriasAtuais) =>
                    categoriasAtuais.filter(
                        (categoria) =>
                            categoria.id !==
                            categoriaId
                    )
            );


            // ========================================================
            // REMOVER ITENS DA CATEGORIA
            // ========================================================

            setItens(
                (itensAtuais) =>
                    itensAtuais.filter(
                        (item) =>
                            item.categoriaId !==
                            categoriaId
                    )
            );


            // ========================================================
            // REMOVER ITENS DA SELEÇÃO
            // ========================================================

            setItensSelecionados(
                (selecionadosAtuais) =>
                    selecionadosAtuais.filter(
                        (id) =>
                            !itensExcluidos.includes(
                                id
                            )
                    )
            );


            // ========================================================
            // LIMPAR CATEGORIA SELECIONADA
            // ========================================================

            if (
                categoriaSelecionada ===
                categoriaId
            ) {

                setCategoriaSelecionada(
                    null
                );
            }


            return true;

        } catch (error) {

            console.error(
                'Erro ao excluir categoria:',
                error
            );

            setErro(
                error instanceof Error
                    ? error.message
                    : 'Erro ao excluir categoria.'
            );

            return false;
        }
    }


    // ================================================================
    // CARREGAMENTO INICIAL
    // ================================================================

    useEffect(() => {

        carregarCategorias();

        carregarItens();

        carregarDadosComercio();

    }, []);


    // ================================================================
    // RETORNO DO HOOK
    // ================================================================

    return {

        // ------------------------------------------------------------
        // DADOS
        // ------------------------------------------------------------

        categorias,
        setCategorias,

        itens,
        setItens,

        nomeComercio,
        setNomeComercio,


        // ------------------------------------------------------------
        // CATEGORIA
        // ------------------------------------------------------------

        categoriaSelecionada,
        setCategoriaSelecionada,

        categoriaAtual,


        // ------------------------------------------------------------
        // SELEÇÃO
        // ------------------------------------------------------------

        itensSelecionados,
        setItensSelecionados,

        todosSelecionados,

        alternarItem,
        alternarTodos,


        // ------------------------------------------------------------
        // FILTROS
        // ------------------------------------------------------------

        busca,
        setBusca,

        filtroStatus,
        setFiltroStatus,

        itensFiltrados,


        // ------------------------------------------------------------
        // NOVO ITEM
        // ------------------------------------------------------------

        mostrarNovoItem,
        setMostrarNovoItem,

        itemEmAlteracao,
        setItemEmAlteracao,

        handleAlterarItem,
        handleFecharNovoItem,

        handleItemCriado,
        handleItemAlterado,


        // ------------------------------------------------------------
        // VER ITEM
        // ------------------------------------------------------------

        itemEmVisualizacao,

        handleVerItem,
        handleFecharVerItem,


        // ------------------------------------------------------------
        // NOVA CATEGORIA
        // ------------------------------------------------------------

        mostrarNovaCategoria,

        setMostrarNovaCategoria,

        categoriaEmEdicao,

        setCategoriaEmEdicao,

        handleSalvarCategoria,

        handleAlterarCategoria,

        handleFecharNovaCategoria,


        // ------------------------------------------------------------
        // EXCLUSÃO
        // ------------------------------------------------------------

        handleExcluirItem,

        handleExcluirSelecionados,

        handleExcluirCategoria,

        excluindoItemId,

        excluindoSelecionados,

        setExcluindoSelecionados,


        // ------------------------------------------------------------
        // CARREGAMENTO
        // ------------------------------------------------------------

        carregandoCategorias,

        carregandoItens,

        carregarCategorias,

        carregarItens,

        carregarDadosComercio,


        // ------------------------------------------------------------
        // DISPONIBILIDADE
        // ------------------------------------------------------------

        handleAlterarDisponibilidade,


        // ------------------------------------------------------------
        // CATEGORIA
        // ------------------------------------------------------------

        salvandoCategoria,


        // ------------------------------------------------------------
        // ERROS
        // ------------------------------------------------------------

        erro,

        setErro
    };
}