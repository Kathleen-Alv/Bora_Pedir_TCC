import { useEffect, useState } from 'react';

import {
    buscarCategorias,
    buscarItens,
    buscarDadosComercio,
    criarCategoria,
    alterarCategoria,
    alterarDisponibilidadeItem,
    excluirItem
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
                                item.id,

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
    // CRIAR CATEGORIA
    // ================================================================

   // ================================================================
// SALVAR CATEGORIA
// ================================================================

// ================================================================
// SALVAR CATEGORIA
// ================================================================

async function handleSalvarCategoria(
    nomeCategoria: string
) {

    try {

        setSalvandoCategoria(true);
        setErro('');


        // ============================================================
        // EDITAR CATEGORIA
        // ============================================================

        if (categoriaEmEdicao) {

            const categoriaAnterior =
                categoriaEmEdicao;


            const categoriaAtualizada =
                await alterarCategoria(
                    categoriaAnterior.id,
                    nomeCategoria
                );


            // ========================================================
            // MANTER A QUANTIDADE ATUAL DA CATEGORIA
            // ========================================================

            const categoriaConvertida:
                Categoria = {

                    ...categoriaAtualizada,

                    quantidade:
                        converterQuantidade(
                            categoriaAtualizada.quantidade
                        ) ||
                        categoriaAnterior.quantidade
                };


            // ========================================================
            // ATUALIZAR A CATEGORIA NA LISTA
            // ========================================================

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


            // ========================================================
            // LIMPAR MODO DE EDIÇÃO
            // ========================================================

            setCategoriaEmEdicao(null);

            setMostrarNovaCategoria(false);


            return true;
        }


        // ============================================================
        // CRIAR NOVA CATEGORIA
        // ============================================================

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


        // ============================================================
        // ADICIONAR A NOVA CATEGORIA NA LISTA
        // ============================================================

        setCategorias(
            (categoriasAtuais) => [

                ...categoriasAtuais,

                categoriaConvertida

            ]
        );


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

        const novoItem: Item = {

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

        // ============================================================
        // ATUALIZA O ITEM IMEDIATAMENTE NA TELA
        // ============================================================

        setItens(
            (itensAtuais) => [
                ...itensAtuais,
                novoItem
            ]
        );

        // ============================================================
        // ATUALIZA AS CATEGORIAS DIRETAMENTE DO BANCO
        // ============================================================
        // O banco passa a ser a fonte oficial da quantidade.
        // Isso evita divergências e elimina a necessidade de
        // calcular quantidade + 1 manualmente.
        // ============================================================

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

        const itemAtualizado: Item = {

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

        // ============================================================
        // ATUALIZA O ITEM NA TELA
        // ============================================================

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

        // ============================================================
        // RECARREGA CATEGORIAS
        // ============================================================
        // Importante caso o item tenha mudado de categoria.
        // ============================================================

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

            // ========================================================
            // REMOVE DA LISTA IMEDIATAMENTE
            // ========================================================

            setItens(
                (itensAtuais) =>
                    itensAtuais.filter(
                        (itemAtual) =>
                            itemAtual.id !==
                            item.id
                    )
            );

            // ========================================================
            // REMOVE DA SELEÇÃO
            // ========================================================

            setItensSelecionados(
                (selecionados) =>
                    selecionados.filter(
                        (id) =>
                            id !== item.id
                    )
            );

            // ========================================================
            // RECARREGA A QUANTIDADE REAL DO BANCO
            // ========================================================

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

                // Filtro por categoria.
                const pertenceCategoria =
                    categoriaSelecionada === null ||
                    item.categoriaId ===
                        categoriaSelecionada;

                // Filtro por busca.
                const correspondeBusca =
                    item.nome
                        .toLowerCase()
                        .includes(
                            busca
                                .toLowerCase()
                                .trim()
                        );

                // Filtro por status.
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

        // Se todos já estão selecionados,
        // remove somente os itens atualmente filtrados.
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

        // Caso contrário, adiciona os itens filtrados
        // sem duplicar IDs.
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
                [...itensSelecionados];

            // ========================================================
            // EXCLUIR CADA ITEM DO BANCO
            // ========================================================

            for (
                const id
                of idsParaExcluir
            ) {

                await excluirItem(
                    id
                );
            }

            // ========================================================
            // REMOVE OS ITENS DA TELA
            // ========================================================

            setItens(
                (itensAtuais) =>
                    itensAtuais.filter(
                        (item) =>
                            !idsParaExcluir.includes(
                                item.id
                            )
                    )
            );

            // ========================================================
            // RECARREGA AS CATEGORIAS DO BANCO
            // ========================================================

            await carregarCategorias();

            // ========================================================
            // LIMPA A SELEÇÃO
            // ========================================================

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
    // CARREGAMENTO INICIAL
    // ================================================================

    useEffect(() => {

        carregarCategorias();

        carregarItens();

        carregarDadosComercio();

    }, []);

// ============================================================
// ALTERAR DISPONIBILIDADE
// ============================================================

// ================================================================
// ALTERAR DISPONIBILIDADE DOS ITENS SELECIONADOS
// ================================================================

async function handleAlterarDisponibilidade(
    disponibilidadeSolicitada: boolean
) {

    // ============================================================
    // VERIFICAR SE EXISTEM ITENS SELECIONADOS
    // ============================================================

    if (
        itensSelecionados.length === 0
    ) {

        return;
    }


    try {

        setErro('');


        // ========================================================
        // 1. CONSULTAR O BANCO
        // ========================================================
        // Buscamos novamente os itens diretamente do banco.
        //
        // Dessa forma não confiamos apenas no estado que está
        // atualmente na tela.
        // ========================================================

        const itensRecebidos:
            ItemRecebidoAPI[] =
            await buscarItens();


        // ========================================================
        // 2. PEGAR SOMENTE OS ITENS SELECIONADOS
        // ========================================================

        const itensSelecionadosBanco =
            itensRecebidos.filter(
                (itemBanco) =>
                    itensSelecionados.includes(
                        Number(itemBanco.id)
                    )
            );


        // ========================================================
        // 3. VERIFICAR SE TODOS OS ITENS FORAM ENCONTRADOS
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
        // 4. ALTERAR CADA ITEM NECESSÁRIO
        // ========================================================
        //
        // Exemplo:
        //
        // Usuário selecionou 3 itens e clicou em D.
        //
        // Item 1 → banco = true
        // Item 2 → banco = false
        // Item 3 → banco = true
        //
        // Somente o Item 2 receberá PATCH.
        //
        // ========================================================

        const itensAtualizados =
            [...itensRecebidos];


        for (
            const itemBanco
            of itensSelecionadosBanco
        ) {

            const disponibilidadeAtual =
                converterBooleano(
                    itemBanco.disponivel
                );


            // ====================================================
            // SE JÁ ESTIVER NA DISPONIBILIDADE SOLICITADA,
            // NÃO PRECISA ALTERAR O BANCO.
            // ====================================================

            if (
                disponibilidadeAtual ===
                disponibilidadeSolicitada
            ) {

                continue;
            }


            // ====================================================
            // ALTERAR NO BANCO
            // ====================================================

            const resposta =
                await alterarDisponibilidadeItem(
                    Number(itemBanco.id),
                    disponibilidadeSolicitada
                );


            // ====================================================
            // PEGAR O ITEM CONFIRMADO PELO BACKEND
            // ====================================================

            const itemConfirmado =
                resposta?.item;


            if (!itemConfirmado) {

                throw new Error(
                    `O servidor não retornou os dados atualizados do item ${itemBanco.nome}.`
                );
            }


            // ====================================================
            // SUBSTITUIR A VERSÃO ANTIGA PELA CONFIRMADA
            // ====================================================

            const indice =
                itensAtualizados.findIndex(
                    (item) =>
                        Number(item.id) ===
                        Number(itemConfirmado.id)
                );


            if (
                indice !== -1
            ) {

                itensAtualizados[
                    indice
                ] = itemConfirmado;

            }

        }


        // ========================================================
        // 5. CONVERTER NOVAMENTE OS ITENS PARA O TIPO Item
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
        // 6. ATUALIZAR A TELA
        // ========================================================
        //
        // Só atualizamos a interface depois das alterações
        // confirmadas pelo banco.
        // ========================================================

        setItens(
            itensConvertidos
        );


        // ========================================================
        // 7. LIMPAR A SELEÇÃO
        // ========================================================
        //
        // Depois de alterar a disponibilidade, os checkboxes
        // deixam de ficar selecionados.
        // ========================================================

        setItensSelecionados([]);


    } catch (error) {

        console.error(
            'Erro ao alterar disponibilidade:',
            error
        );


        // ========================================================
        // IMPORTANTE:
        //
        // Se ocorrer erro, não limpamos a seleção.
        //
        // Assim o usuário pode tentar novamente.
        // ========================================================

        if (
            error instanceof Error
        ) {

            setErro(
                error.message
            );

        } else {

            setErro(
                'Não foi possível alterar a disponibilidade dos itens selecionados.'
            );

        }

    }

}


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
// ------------------------------------------------------------
// NOVA CATEGORIA
// ------------------------------------------------------------

    mostrarNovaCategoria,

    setMostrarNovaCategoria,

    categoriaEmEdicao,

    setCategoriaEmEdicao,

    handleSalvarCategoria,

        // ------------------------------------------------------------
        // EXCLUSÃO
        // ------------------------------------------------------------

        handleExcluirItem,
        handleExcluirSelecionados,

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

        handleAlterarDisponibilidade,

        handleAlterarCategoria,
        handleFecharNovaCategoria,

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

