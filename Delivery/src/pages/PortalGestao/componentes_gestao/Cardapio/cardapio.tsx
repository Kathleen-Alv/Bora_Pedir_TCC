import { useEffect, useState } from 'react';

import styles from './cardapio.module.css';

import { NovoItem } from './novoItem/novoItem';
import { NovaCategoria } from './novaCategoria/novaCategoria';
import { MenuItem } from './menuItem/menuItem';


// ================================================================
// TIPOS
// ================================================================

type Categoria = {
    id: number;
    nome: string;
    quantidade: number;
};


type Item = {
    id: number;
    nome: string;
    preco: number;
    imagem: string;
    descricao: string;
    disponivel: boolean;
    categoriaId: number;
    statusVenda: 'ativo' | 'pausado';
};


type ItemCriadoAPI = {
    id: number;
    categoria_id: number;
    nome: string;
    foto: string | null;
    preco: number;
    descricao: string | null;
    disponivel: boolean;
};


type ItemRecebidoAPI = {
    id: number;
    categoria_id: number;
    nome: string;
    foto: string | null;
    preco: number;
    descricao: string | null;
    disponivel: boolean;
};


type DadosComercio = {
    id: number;
    nome_comercio: string;
};


// ================================================================
// API
// ================================================================

const API_URL =
    'http://localhost:3000/api/cardapio';


// ================================================================
// TOKEN
// ================================================================

function obterToken(): string | null {

    return localStorage.getItem('token');

}


// ================================================================
// CONVERTER BOOLEANO
// ================================================================

function converterBooleano(
    valor: unknown
): boolean {

    return (
        valor === true ||
        valor === 1 ||
        valor === '1'
    );

}


// ================================================================
// COMPONENTE
// ================================================================

export function Cardapio() {


    // ============================================================
    // ESTADOS
    // ============================================================

    const [categorias, setCategorias] =
        useState<Categoria[]>([]);


    const [itens, setItens] =
        useState<Item[]>([]);


    const [categoriaSelecionada, setCategoriaSelecionada] =
        useState<number | null>(null);


    const [itensSelecionados, setItensSelecionados] =
        useState<number[]>([]);


    const [mostrarNovoItem, setMostrarNovoItem] =
        useState(false);


    const [mostrarNovaCategoria, setMostrarNovaCategoria] =
        useState(false);


    const [busca, setBusca] =
        useState('');


    const [filtroStatus, setFiltroStatus] =
        useState('todos');


    const [nomeComercio, setNomeComercio] =
        useState('Carregando...');


    const [carregandoCategorias, setCarregandoCategorias] =
        useState(false);


    const [carregandoItens, setCarregandoItens] =
        useState(false);


    const [salvandoCategoria, setSalvandoCategoria] =
        useState(false);


    const [excluindoItemId, setExcluindoItemId] =
        useState<number | null>(null);


    const [excluindoSelecionados, setExcluindoSelecionados] =
        useState(false);


    const [erro, setErro] =
        useState('');



    // ============================================================
    // CARREGAR CATEGORIAS
    // ============================================================

    async function carregarCategorias() {

        try {

            setCarregandoCategorias(true);

            setErro('');


            const token =
                obterToken();


            if (!token) {

                setErro(
                    'Sessão expirada. Faça login novamente.'
                );

                return;

            }


            const resposta =
                await fetch(
                    `${API_URL}/categorias`,
                    {
                        method: 'GET',

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            'Content-Type':
                                'application/json'
                        }
                    }
                );


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    dados.message ||
                    'Erro ao carregar categorias.'
                );

            }


            const categoriasRecebidas:
                Categoria[] =
                dados.categorias || [];


            setCategorias(
                categoriasRecebidas
            );


            if (
                categoriaSelecionada === null &&
                categoriasRecebidas.length > 0
            ) {

                setCategoriaSelecionada(
                    categoriasRecebidas[0].id
                );

            }


        } catch (error) {

            console.error(
                'Erro ao carregar categorias:',
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
                    'Erro ao carregar categorias.'
                );

            }


        } finally {

            setCarregandoCategorias(
                false
            );

        }

    }



    // ============================================================
    // CARREGAR ITENS
    // ============================================================

    async function carregarItens() {

        try {

            setCarregandoItens(true);

            setErro('');


            const token =
                obterToken();


            if (!token) {

                setErro(
                    'Sessão expirada. Faça login novamente.'
                );

                return;

            }


            const resposta =
                await fetch(
                    `${API_URL}/itens`,
                    {
                        method: 'GET',

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            'Content-Type':
                                'application/json'
                        }
                    }
                );


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    dados.message ||
                    'Erro ao carregar itens.'
                );

            }


            const itensRecebidos:
                ItemRecebidoAPI[] =
                dados.itens || [];


            const itensFormatados:
                Item[] =
                itensRecebidos.map(
                    (item) => ({

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

                        disponivel:
                            converterBooleano(
                                item.disponivel
                            ),

                        categoriaId:
                            Number(
                                item.categoria_id
                            ),

                        statusVenda:
                            converterBooleano(
                                item.disponivel
                            )
                                ? 'ativo'
                                : 'pausado'

                    })
                );


            setItens(
                itensFormatados
            );


        } catch (error) {

            console.error(
                'Erro ao carregar itens:',
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
                    'Erro ao carregar itens.'
                );

            }


        } finally {

            setCarregandoItens(
                false
            );

        }

    }



    // ============================================================
    // CARREGAR DADOS DO COMÉRCIO
    // ============================================================

    async function carregarDadosComercio() {

        try {

            const token =
                obterToken();


            if (!token) {

                setNomeComercio(
                    'Comércio'
                );

                return;

            }


            const resposta =
                await fetch(
                    `${API_URL}/dados`,
                    {
                        method: 'GET',

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            'Content-Type':
                                'application/json'
                        }
                    }
                );


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    dados.message ||
                    'Erro ao carregar dados do comércio.'
                );

            }


            const comercio:
                DadosComercio =
                dados.comercio;


            if (
                !comercio ||
                !comercio.nome_comercio
            ) {

                setNomeComercio(
                    'Comércio'
                );

                return;

            }


            setNomeComercio(
                comercio.nome_comercio
            );


        } catch (error) {

            console.error(
                'Erro ao carregar dados do comércio:',
                error
            );


            setNomeComercio(
                'Comércio'
            );

        }

    }



    // ============================================================
    // EFFECT
    // ============================================================

    useEffect(() => {

        carregarCategorias();

        carregarItens();

        carregarDadosComercio();

    }, []);



    // ============================================================
    // CRIAR CATEGORIA
    // ============================================================

    async function handleSalvarCategoria(
        nomeCategoria: string,
        continuarCadastrando: boolean = false
    ) {

        try {

            setSalvandoCategoria(true);

            setErro('');


            const token =
                obterToken();


            if (!token) {

                throw new Error(
                    'Sessão expirada. Faça login novamente.'
                );

            }


            const resposta =
                await fetch(
                    `${API_URL}/categorias`,
                    {
                        method: 'POST',

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify({
                                nome:
                                    nomeCategoria
                            })
                    }
                );


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    dados.message ||
                    'Erro ao criar categoria.'
                );

            }


            const novaCategoria:
                Categoria =
                dados.categoria;


            // ----------------------------------------------------
            // ADICIONA A NOVA CATEGORIA
            // ----------------------------------------------------

            setCategorias(
                (categoriasAtuais) => [
                    ...categoriasAtuais,
                    novaCategoria
                ]
            );


            // ----------------------------------------------------
            // SELECIONA A NOVA CATEGORIA
            // ----------------------------------------------------

            setCategoriaSelecionada(
                novaCategoria.id
            );


            // ----------------------------------------------------
            // FECHA SOMENTE SE NÃO FOR
            // ADICIONAR OUTRA
            // ----------------------------------------------------

            if (
                !continuarCadastrando
            ) {

                setMostrarNovaCategoria(
                    false
                );

            }


        } catch (error) {

            console.error(
                'Erro ao criar categoria:',
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
                    'Erro ao criar categoria.'
                );

            }


            // ----------------------------------------------------
            // IMPORTANTE:
            // O NovaCategoria também precisa saber
            // que ocorreu erro.
            // ----------------------------------------------------

            throw error;


        } finally {

            setSalvandoCategoria(
                false
            );

        }

    }



    // ============================================================
    // ITEM CRIADO
    // ============================================================

    function handleItemCriado(
        item: ItemCriadoAPI
    ) {

        const novoItem:
            Item = {

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

            disponivel:
                converterBooleano(
                    item.disponivel
                ),

            categoriaId:
                Number(
                    item.categoria_id
                ),

            statusVenda:
                converterBooleano(
                    item.disponivel
                )
                    ? 'ativo'
                    : 'pausado'

        };


        setItens(
            (itensAtuais) => [
                ...itensAtuais,
                novoItem
            ]
        );


        setCategoriaSelecionada(
            novoItem.categoriaId
        );


        setCategorias(
            (categoriasAtuais) =>

                categoriasAtuais.map(
                    (categoria) => {

                        if (
                            categoria.id ===
                            novoItem.categoriaId
                        ) {

                            return {

                                ...categoria,

                                quantidade:
                                    categoria.quantidade + 1

                            };

                        }


                        return categoria;

                    }
                )

        );


        setItensSelecionados([]);

    }



    // ============================================================
    // ALTERAR ITEM
    // ============================================================

    function handleAlterarItem(
        item: Item
    ) {

        console.log(
            'Item selecionado para alteração:',
            item
        );


        alert(
            `Alterar item: ${item.nome}`
        );

    }



    // ============================================================
    // EXCLUIR ITEM
    // ============================================================

    async function handleExcluirItem(
        item: Item
    ) {

        const confirmar =
            window.confirm(
                `Deseja realmente excluir o item "${item.nome}"?`
            );


        if (!confirmar) {

            return;

        }


        try {

            setExcluindoItemId(
                item.id
            );

            setErro('');


            const token =
                obterToken();


            if (!token) {

                throw new Error(
                    'Sessão expirada. Faça login novamente.'
                );

            }


            const resposta =
                await fetch(
                    `${API_URL}/itens/${item.id}`,
                    {
                        method: 'DELETE',

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            let dados: {
                message?: string;
            } = {};


            try {

                dados =
                    await resposta.json();

            } catch {

                // DELETE pode não retornar JSON.

            }


            if (!resposta.ok) {

                throw new Error(
                    dados.message ||
                    'Erro ao excluir item.'
                );

            }


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


            setCategorias(
                (categoriasAtuais) =>

                    categoriasAtuais.map(
                        (categoria) => {

                            if (
                                categoria.id ===
                                item.categoriaId
                            ) {

                                return {

                                    ...categoria,

                                    quantidade:
                                        Math.max(
                                            0,
                                            categoria.quantidade - 1
                                        )

                                };

                            }


                            return categoria;

                        }
                    )

            );


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


        } finally {

            setExcluindoItemId(
                null
            );

        }

    }



    // ============================================================
    // SELECIONAR ITEM
    // ============================================================

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



    // ============================================================
    // SELECIONAR TODOS
    // ============================================================

    function alternarTodos() {

        const idsVisiveis =
            itensFiltrados.map(
                (item) =>
                    item.id
            );


        const todosSelecionados =
            idsVisiveis.length > 0 &&
            idsVisiveis.every(
                (id) =>
                    itensSelecionados.includes(
                        id
                    )
            );


        if (todosSelecionados) {

            setItensSelecionados(
                (selecionados) =>
                    selecionados.filter(
                        (id) =>
                            !idsVisiveis.includes(
                                id
                            )
                    )
            );

        } else {

            setItensSelecionados(
                (selecionados) => [

                    ...new Set([
                        ...selecionados,
                        ...idsVisiveis
                    ])

                ]
            );

        }

    }



    // ============================================================
    // EXCLUIR ITENS SELECIONADOS
    // ============================================================

    async function handleExcluirSelecionados() {

        if (
            itensSelecionados.length === 0
        ) {

            return;

        }


        const confirmar =
            window.confirm(
                `Deseja realmente excluir ${itensSelecionados.length} item(ns) selecionado(s)?`
            );


        if (!confirmar) {

            return;

        }


        try {

            setExcluindoSelecionados(
                true
            );

            setErro('');


            const token =
                obterToken();


            if (!token) {

                throw new Error(
                    'Sessão expirada. Faça login novamente.'
                );

            }


            const idsParaExcluir = [
                ...itensSelecionados
            ];


            const itensExcluidos:
                Item[] = [];


            // ----------------------------------------------------
            // EXCLUI UM POR UM
            // ----------------------------------------------------

            for (
                const id of idsParaExcluir
            ) {

                const resposta =
                    await fetch(
                        `${API_URL}/itens/${id}`,
                        {
                            method: 'DELETE',

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                if (!resposta.ok) {

                    let dados: {
                        message?: string;
                    } = {};


                    try {

                        dados =
                            await resposta.json();

                    } catch {

                        // Sem resposta JSON.

                    }


                    throw new Error(
                        dados.message ||
                        `Erro ao excluir o item ${id}.`
                    );

                }


                const itemEncontrado =
                    itens.find(
                        (item) =>
                            item.id === id
                    );


                if (itemEncontrado) {

                    itensExcluidos.push(
                        itemEncontrado
                    );

                }

            }


            // ----------------------------------------------------
            // REMOVE DA LISTA
            // ----------------------------------------------------

            setItens(
                (itensAtuais) =>
                    itensAtuais.filter(
                        (item) =>
                            !idsParaExcluir.includes(
                                item.id
                            )
                    )
            );


            // ----------------------------------------------------
            // ATUALIZA CATEGORIAS
            // ----------------------------------------------------

            setCategorias(
                (categoriasAtuais) => {

                    const quantidadePorCategoria =
                        new Map<number, number>();


                    itensExcluidos.forEach(
                        (item) => {

                            const quantidadeAtual =
                                quantidadePorCategoria.get(
                                    item.categoriaId
                                ) || 0;


                            quantidadePorCategoria.set(
                                item.categoriaId,
                                quantidadeAtual + 1
                            );

                        }
                    );


                    return categoriasAtuais.map(
                        (categoria) => {

                            const quantidadeRemovida =
                                quantidadePorCategoria.get(
                                    categoria.id
                                ) || 0;


                            if (
                                quantidadeRemovida === 0
                            ) {

                                return categoria;

                            }


                            return {

                                ...categoria,

                                quantidade:
                                    Math.max(
                                        0,
                                        categoria.quantidade -
                                        quantidadeRemovida
                                    )

                            };

                        }
                    );

                }
            );


            // ----------------------------------------------------
            // LIMPA SELEÇÃO
            // ----------------------------------------------------

            setItensSelecionados([]);


        } catch (error) {

            console.error(
                'Erro ao excluir itens:',
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
                    'Erro ao excluir itens.'
                );

            }


            await carregarItens();

            await carregarCategorias();


        } finally {

            setExcluindoSelecionados(
                false
            );

        }

    }



    // ============================================================
    // FILTRAR ITENS
    // ============================================================

    const itensFiltrados =
        itens.filter(
            (item) => {


                // ------------------------------------------------
                // CATEGORIA
                // ------------------------------------------------

                if (
                    categoriaSelecionada !== null &&
                    item.categoriaId !==
                        categoriaSelecionada
                ) {

                    return false;

                }


                // ------------------------------------------------
                // BUSCA
                // ------------------------------------------------

                if (
                    busca.trim()
                ) {

                    const textoBusca =
                        busca
                            .trim()
                            .toLowerCase();


                    if (
                        !item.nome
                            .toLowerCase()
                            .includes(
                                textoBusca
                            )
                    ) {

                        return false;

                    }

                }


                // ------------------------------------------------
                // STATUS
                // ------------------------------------------------

                if (
                    filtroStatus !== 'todos'
                ) {

                    if (
                        filtroStatus === 'ativos' &&
                        !item.disponivel
                    ) {

                        return false;

                    }


                    if (
                        filtroStatus === 'pausados' &&
                        item.disponivel
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );



    // ============================================================
    // TODOS VISÍVEIS SELECIONADOS
    // ============================================================

    const todosSelecionados =
        itensFiltrados.length > 0 &&
        itensFiltrados.every(
            (item) =>
                itensSelecionados.includes(
                    item.id
                )
        );



    // ============================================================
    // CATEGORIA ATUAL
    // ============================================================

    const categoriaAtual =
        categorias.find(
            (categoria) =>
                categoria.id ===
                categoriaSelecionada
        );



    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div
            className={styles.container}
        >


            {/* =====================================================
                HEADER
            ===================================================== */}

            <header
                className={styles.header}
            >

                <div
                    className={
                        styles.nomeComercio
                    }
                >

                    <h1>
                        {nomeComercio}
                    </h1>


                    <button
                        type="button"
                        className={
                            styles.iconeEditar
                        }
                        title="Editar comércio"
                    >
                        ✎
                    </button>


                    <span
                        className={
                            styles.separador
                        }
                    >
                        |
                    </span>


                    <span
                        className={
                            styles.semAumento
                        }
                    >
                        Sem aumento
                    </span>

                </div>


                <div
                    className={
                        styles.acoesTopo
                    }
                >

                    <button
                        type="button"
                        className={
                            styles.botaoTopo
                        }
                    >
                        Pré-visualizar
                    </button>


                    <button
                        type="button"
                        className={
                            styles.botaoTopo
                        }
                    >
                        Ver como cliente
                    </button>

                </div>

            </header>



            {/* =====================================================
                FILTROS
            ===================================================== */}

            <div
                className={
                    styles.filtros
                }
            >

                <input
                    type="text"
                    placeholder="Buscar item"
                    value={busca}
                    onChange={(evento) =>
                        setBusca(
                            evento.target.value
                        )
                    }
                />


                <select
                    value={filtroStatus}
                    onChange={(evento) =>
                        setFiltroStatus(
                            evento.target.value
                        )
                    }
                >

                    <option value="todos">
                        Todos
                    </option>

                    <option value="ativos">
                        Ativos
                    </option>

                    <option value="pausados">
                        Pausados
                    </option>

                </select>


                {/* =================================================
                    BOTÕES DE AÇÃO
                ================================================= */}

                <div
                    className={
                        styles.botoesAcao
                    }
                >

                    {/* -------------------------------------------------
                        EXCLUIR SELEÇÃO
                    ------------------------------------------------- */}

                    {itensSelecionados.length >= 1 && (

                        <button
                            type="button"
                            className={
                                styles.ExcluirSelecao
                            }
                            onClick={
                                handleExcluirSelecionados
                            }
                            disabled={
                                excluindoSelecionados
                            }
                        >

                            {excluindoSelecionados
                                ? 'Excluindo...'
                                : 'Excluir seleção'
                            }

                        </button>

                    )}


                    {/* -------------------------------------------------
                        NOVA CATEGORIA
                    ------------------------------------------------- */}

                    <button
                        type="button"
                        className={
                            styles.novaCategoria
                        }
                        onClick={() =>
                            setMostrarNovaCategoria(
                                true
                            )
                        }
                        disabled={
                            salvandoCategoria
                        }
                    >
                        + Nova categoria
                    </button>


                    {/* -------------------------------------------------
                        NOVO ITEM
                    ------------------------------------------------- */}

                    <button
                        type="button"
                        className={
                            styles.novoItem
                        }
                        onClick={() =>
                            setMostrarNovoItem(
                                true
                            )
                        }
                        disabled={
                            categorias.length === 0
                        }
                    >
                        + Novo item
                    </button>

                </div>

            </div>



            {/* =====================================================
                ERRO
            ===================================================== */}

            {erro && (

                <div
                    className={
                        styles.mensagemErro
                    }
                >
                    {erro}
                </div>

            )}



            {/* =====================================================
                CONTEÚDO
            ===================================================== */}

            <div
                className={
                    styles.conteudo
                }
            >


                {/* =================================================
                    CATEGORIAS
                ================================================= */}

                <aside
                    className={
                        styles.categorias
                    }
                >

                    <div
                        className={
                            styles.tituloCategorias
                        }
                    >

                        <h2>
                            Categorias
                        </h2>


                        <button
                            type="button"
                            className={
                                styles.adicionarCategoria
                            }
                            onClick={() =>
                                setMostrarNovaCategoria(
                                    true
                                )
                            }
                            title="Adicionar categoria"
                        >
                            +
                        </button>

                    </div>


                    <div
                        className={
                            styles.listaCategorias
                        }
                    >

                        {carregandoCategorias ? (

                            <div
                                className={
                                    styles.mensagemLista
                                }
                            >
                                Carregando categorias...
                            </div>

                        ) : categorias.length === 0 ? (

                            <div
                                className={
                                    styles.mensagemLista
                                }
                            >
                                Nenhuma categoria cadastrada.
                            </div>

                        ) : (

                            categorias.map(
                                (categoria) => (

                                    <button
                                        key={
                                            categoria.id
                                        }
                                        type="button"
                                        className={`
                                            ${styles.categoria}
                                            ${
                                                categoriaSelecionada ===
                                                categoria.id
                                                    ? styles.categoriaSelecionada
                                                    : ''
                                            }
                                        `}
                                        onClick={() =>
                                            setCategoriaSelecionada(
                                                categoria.id
                                            )
                                        }
                                    >

                                        <span>
                                            {
                                                categoria.nome
                                            }
                                        </span>


                                        <small>
                                            {
                                                categoria.quantidade
                                            }
                                        </small>

                                    </button>

                                )
                            )

                        )}

                    </div>

                </aside>



                {/* =================================================
                    ÁREA DOS ITENS
                ================================================= */}

                <section
                    className={
                        styles.areaItens
                    }
                >


                    {/* =============================================
                        BARRA DE AÇÕES DOS ITENS
                    ============================================= */}

                    <div
                        className={
                            styles.barraItens
                        }
                    >

                        <strong>
                            {
                                categoriaAtual?.nome ||
                                'Itens'
                            }
                        </strong>


                        <label
                            className={
                                styles.selecionarTudo
                            }
                        >

                            <input
                                type="checkbox"
                                checked={
                                    todosSelecionados
                                }
                                onChange={
                                    alternarTodos
                                }
                            />


                            <span>
                                Selecionar tudo
                            </span>

                        </label>

                    </div>



                    {/* =============================================
                        CABEÇALHO DA TABELA
                    ============================================= */}

                    <div
                        className={
                            styles.cabecalhoTabela
                        }
                    >

                        <span>
                            Item
                        </span>

                        <span>
                            Preço
                        </span>

                        <span>
                            Disponibilidade
                        </span>

                    </div>



                    {/* =============================================
                        LISTA DE ITENS
                    ============================================= */}

                    <div
                        className={
                            styles.listaItens
                        }
                    >

                        {carregandoItens ? (

                            <div
                                className={
                                    styles.mensagemListaItens
                                }
                            >
                                Carregando itens...
                            </div>

                        ) : itensFiltrados.length === 0 ? (

                            <div
                                className={
                                    styles.mensagemListaItens
                                }
                            >
                                Nenhum item encontrado.
                            </div>

                        ) : (

                            itensFiltrados.map(
                                (item) => (

                                    <div
                                        key={
                                            item.id
                                        }
                                        className={
                                            styles.item
                                        }
                                    >


                                        {/* =================================
                                            NOME
                                        ================================= */}

                                        <div
                                            className={
                                                styles.itemNome
                                            }
                                        >

                                            <input
                                                type="checkbox"
                                                checked={
                                                    itensSelecionados.includes(
                                                        item.id
                                                    )
                                                }
                                                onChange={() =>
                                                    alternarItem(
                                                        item.id
                                                    )
                                                }
                                            />


                                            {item.imagem ? (

                                                <img
                                                    src={
                                                        item.imagem
                                                    }
                                                    alt={
                                                        item.nome
                                                    }
                                                />

                                            ) : (

                                                <div
                                                    className={
                                                        styles.imagemVazia
                                                    }
                                                />

                                            )}


                                            <div
                                                className={
                                                    styles.infoItem
                                                }
                                            >

                                                <span
                                                    className={
                                                        styles.nomeItem
                                                    }
                                                >
                                                    {
                                                        item.nome
                                                    }
                                                </span>


                                                <button
                                                    type="button"
                                                    className={
                                                        styles.grupoItens
                                                    }
                                                >

                                                    <span>
                                                        ≡
                                                    </span>

                                                    1 grupo

                                                </button>

                                            </div>

                                        </div>



                                        {/* =================================
                                            PREÇO
                                        ================================= */}

                                        <div
                                            className={
                                                styles.preco
                                            }
                                        >

                                            R$ {
                                                item.preco
                                                    .toFixed(2)
                                                    .replace(
                                                        '.',
                                                        ','
                                                    )
                                            }

                                        </div>



                                        {/* =================================
                                            STATUS
                                        ================================= */}

                                        <div
                                            className={
                                                styles.statusArea
                                            }
                                        >

                                            <div
                                                className={`
                                                    ${styles.status}
                                                    ${
                                                        item.disponivel
                                                            ? styles.disponivel
                                                            : styles.indisponivel
                                                    }
                                                `}
                                            >

                                                <span
                                                    className={
                                                        styles.ponto
                                                    }
                                                />


                                                {
                                                    item.disponivel
                                                        ? 'Disponível'
                                                        : 'Indisponível'
                                                }

                                            </div>


                                            {/* =================================
                                                MENU DE OPÇÕES
                                            ================================= */}

                                            <MenuItem
                                                onAlterar={() =>
                                                    handleAlterarItem(
                                                        item
                                                    )
                                                }

                                                onExcluir={() =>
                                                    handleExcluirItem(
                                                        item
                                                    )
                                                }
                                            />

                                        </div>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </section>

            </div>



            {/* =====================================================
                MODAL NOVA CATEGORIA
            ===================================================== */}

            {mostrarNovaCategoria && (

                <NovaCategoria
                    onFechar={() =>
                        setMostrarNovaCategoria(
                            false
                        )
                    }

                    onSalvar={
                        handleSalvarCategoria
                    }
                />

            )}



            {/* =====================================================
                MODAL NOVO ITEM
            ===================================================== */}

            {mostrarNovoItem && (

                <NovoItem
                    categorias={
                        categorias
                    }

                    onFechar={() =>
                        setMostrarNovoItem(
                            false
                        )
                    }

                    onItemCriado={
                        handleItemCriado
                    }
                />

            )}

        </div>

    );

}