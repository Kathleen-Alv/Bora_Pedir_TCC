import styles from './cardapio.module.css';
import { useEffect, useState } from 'react';

import { NovoItem } from './novoItem/novoItem.tsx';
import { NovaCategoria } from './novaCategoria/novaCategoria.tsx';
import { MenuItem } from './menuItem/menuItem.tsx';
import { VerItem } from './verItem/verItem.tsx';

import { useCardapio } from './hooks/useCardapio.tsx';


// ================================================================
// MONTAR URL DA IMAGEM
// ================================================================

function montarUrlImagem(
    imagem: string | null | undefined
): string | null {

    if (!imagem) {
        return null;
    }

    if (
        imagem.startsWith('http://') ||
        imagem.startsWith('https://') ||
        imagem.startsWith('blob:') ||
        imagem.startsWith('data:')
    ) {
        return imagem;
    }

    return `http://localhost:3000${
        imagem.startsWith('/')
            ? imagem
            : `/${imagem}`
    }`;
}


// ================================================================
// COMPONENTE
// ================================================================

export function Cardapio() {

    // ============================================================
    // ESTADOS DO MENU DA CATEGORIA
    // ============================================================

    const [categoriaMenuAberto, setCategoriaMenuAberto] =
        useState<number | null>(null);

    const [posicaoMenuCategoria, setPosicaoMenuCategoria] =
        useState({
            top: 0,
            left: 0
        });


    // ============================================================
    // ESTADO DA CATEGORIA QUE SERÁ EXCLUÍDA
    // ============================================================

    const [categoriaParaExcluir, setCategoriaParaExcluir] =
        useState<{
            id: number;
            nome: string;
            quantidade: number;
        } | null>(null);


    const [excluindoCategoria, setExcluindoCategoria] =
        useState(false);


    // ============================================================
    // FECHAR MENU DA CATEGORIA AO CLICAR FORA
    // ============================================================

    useEffect(() => {

        function fecharMenuCategoria() {
            setCategoriaMenuAberto(null);
        }

        document.addEventListener(
            'click',
            fecharMenuCategoria
        );

        return () => {

            document.removeEventListener(
                'click',
                fecharMenuCategoria
            );

        };

    }, []);


    // ============================================================
    // ABRIR MENU DA CATEGORIA
    // ============================================================

    function abrirMenuCategoria(
        event: React.MouseEvent<HTMLButtonElement>,
        categoriaId: number
    ) {

        event.stopPropagation();

        if (categoriaMenuAberto === categoriaId) {

            setCategoriaMenuAberto(null);

            return;
        }

        const botao =
            event.currentTarget;

        const rect =
            botao.getBoundingClientRect();

        const larguraMenu =
            170;

        setPosicaoMenuCategoria({
            top: rect.bottom + 4,
            left: rect.right - larguraMenu
        });

        setCategoriaMenuAberto(
            categoriaId
        );
    }


    // ============================================================
    // HOOK DO CARDÁPIO
    // ============================================================

    const {

        // --------------------------------------------------------
        // DADOS
        // --------------------------------------------------------

        categorias,

        itens,

        nomeComercio,


        // --------------------------------------------------------
        // CATEGORIA
        // --------------------------------------------------------

        categoriaSelecionada,

        setCategoriaSelecionada,

        categoriaAtual,


        // --------------------------------------------------------
        // SELEÇÃO
        // --------------------------------------------------------

        itensSelecionados,

        todosSelecionados,

        alternarItem,

        alternarTodos,


        // --------------------------------------------------------
        // FILTROS
        // --------------------------------------------------------

        busca,

        setBusca,

        filtroStatus,

        setFiltroStatus,

        itensFiltrados,


        // --------------------------------------------------------
        // NOVO ITEM
        // --------------------------------------------------------

        mostrarNovoItem,

        setMostrarNovoItem,

        itemEmAlteracao,

        setItemEmAlteracao,

        handleAlterarItem,

        handleFecharNovoItem,

        handleItemCriado,

        handleItemAlterado,


        // --------------------------------------------------------
        // VER ITEM
        // --------------------------------------------------------

        itemEmVisualizacao,

        handleVerItem,

        handleFecharVerItem,


        // --------------------------------------------------------
        // NOVA CATEGORIA
        // --------------------------------------------------------

        mostrarNovaCategoria,

        setMostrarNovaCategoria,

        categoriaEmEdicao,

        setCategoriaEmEdicao,

        handleSalvarCategoria,
        handleExcluirCategoria,

        handleAlterarCategoria,

        handleFecharNovaCategoria,


        // --------------------------------------------------------
        // EXCLUSÃO
        // --------------------------------------------------------

        handleExcluirItem,

        handleExcluirSelecionados,

        excluindoSelecionados,


        // --------------------------------------------------------
        // DISPONIBILIDADE
        // --------------------------------------------------------

        handleAlterarDisponibilidade,


        // --------------------------------------------------------
        // CARREGAMENTO
        // --------------------------------------------------------

        carregandoCategorias,

        carregandoItens,

        salvandoCategoria,


        // --------------------------------------------------------
        // ERROS
        // --------------------------------------------------------

        erro

    } = useCardapio();


    // ============================================================
    // ABRIR CONFIRMAÇÃO DE EXCLUSÃO DA CATEGORIA
    // ============================================================

    function abrirConfirmacaoExcluirCategoria(
        categoriaId: number
    ) {

        const categoria =
            categorias.find(
                (item) =>
                    item.id === categoriaId
            );

        if (!categoria) {
            return;
        }

        setCategoriaParaExcluir({
            id: categoria.id,
            nome: categoria.nome,
            quantidade: categoria.quantidade
        });

        setCategoriaMenuAberto(null);
    }


    // ============================================================
    // CONFIRMAR EXCLUSÃO
    // ============================================================
    //
    // POR ENQUANTO NÃO EXCLUI DO BANCO.
    //
    // O próximo passo será ligar esta função ao:
    //
    // DELETE /api/cardapio/categorias/:id
    //
    // e excluir também todos os itens da categoria.
    //
    // ============================================================

async function confirmarExclusaoCategoria() {
    if (!categoriaParaExcluir) {
        return;
    }

    setExcluindoCategoria(true);

    const sucesso = await handleExcluirCategoria(
        categoriaParaExcluir.id
    );

    setExcluindoCategoria(false);

    if (sucesso) {
        setCategoriaParaExcluir(null);
    }
}

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
                        🏬
                    </button>


                    <span
                        className={
                            styles.separador
                        }
                    >
                        |
                    </span>

                </div>


                <div
                    className={
                        styles.acoesTopo
                    }
                >

                    


                    

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
                    placeholder="Buscar item                  🔍"
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


                <div
                    className={
                        styles.botoesAcao
                    }
                >

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


                    {/* =================================================
                        CADASTRAR NOVA CATEGORIA
                    ================================================= */}

                    <button
                        type="button"
                        className={
                            styles.novaCategoria
                        }
                        onClick={() => {

                            setCategoriaEmEdicao(
                                null
                            );

                            setMostrarNovaCategoria(
                                true
                            );

                        }}
                        disabled={
                            salvandoCategoria
                        }
                    >
                        + Nova categoria
                    </button>


                    {/* =================================================
                        NOVO ITEM
                    ================================================= */}

                    <button
                        type="button"
                        className={
                            styles.novoItem
                        }
                        onClick={() => {

                            setItemEmAlteracao(
                                null
                            );

                            setMostrarNovoItem(
                                true
                            );

                        }}
                        disabled={
                            categorias.length === 0
                        }
                    >
                        + Novo item
                    </button>

                </div>

            </div>


            {/* =====================================================
                MENSAGEM DE ERRO
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
                            onClick={() => {

                                setCategoriaEmEdicao(
                                    null
                                );

                                setMostrarNovaCategoria(
                                    true
                                );

                            }}
                            title="Adicionar categoria"
                        >
                            +
                        </button>

                    </div>


                    {/* =================================================
                        LISTA DE CATEGORIAS
                    ================================================= */}

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

                                    <div
                                        key={
                                            categoria.id
                                        }
                                        className={`
                                            ${styles.categoria}
                                            ${
                                                categoriaSelecionada ===
                                                categoria.id
                                                    ? styles.categoriaSelecionada
                                                    : ''
                                            }
                                            ${
                                                categoriaMenuAberto ===
                                                categoria.id
                                                    ? styles.categoriaMenuAberto
                                                    : ''
                                            }
                                        `}
                                    >

                                        {/* =================================
                                            BOTÃO DA CATEGORIA
                                        ================================= */}

                                        <button
                                            type="button"
                                            className={
                                                styles.botaoCategoria
                                            }
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


                                        {/* =================================
                                            TRÊS PONTINHOS
                                        ================================= */}

                                        <div
                                            className={
                                                styles.containerMenuCategoria
                                            }
                                        >

                                            <button
                                                type="button"
                                                className={
                                                    styles.menuCategoria
                                                }
                                                onClick={(event) =>
                                                    abrirMenuCategoria(
                                                        event,
                                                        categoria.id
                                                    )
                                                }
                                                title="Opções da categoria"
                                            >
                                                ⋮
                                            </button>

                                        </div>

                                    </div>

                                )
                            )

                        )}

                    </div>


                    {/* =================================================
                        MENU FLUTUANTE DA CATEGORIA
                    ================================================= */}

                    {categoriaMenuAberto !== null && (

                        <div
                            className={
                                styles.opcoesCategoria
                            }
                            style={{
                                top:
                                    posicaoMenuCategoria.top,
                                left:
                                    posicaoMenuCategoria.left
                            }}
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >

                            {/* =========================================
                                EDITAR CATEGORIA
                            ========================================= */}

                            <button
                                type="button"
                                className={
                                    styles.opcaoCategoria
                                }
                                onClick={() => {

                                    const categoria =
                                        categorias.find(
                                            (item) =>
                                                item.id ===
                                                categoriaMenuAberto
                                        );

                                    if (!categoria) {
                                        return;
                                    }

                                    handleAlterarCategoria(
                                        categoria
                                    );

                                    setCategoriaMenuAberto(
                                        null
                                    );

                                }}
                            >

                                <span>
                                    ✏
                                </span>

                                Editar categoria

                            </button>


                            {/* =========================================
                                EXCLUIR CATEGORIA
                            ========================================= */}

                            <button
                                type="button"
                                className={`
                                    ${styles.opcaoCategoria}
                                    ${styles.opcaoExcluirCategoria}
                                `}
                                onClick={() => {

                                    abrirConfirmacaoExcluirCategoria(
                                        categoriaMenuAberto
                                    );

                                }}
                            >

                                <span>
                                    🗑
                                </span>

                                Excluir categoria

                            </button>

                        </div>

                    )}

                </aside>


                {/* =================================================
                    ÁREA DOS ITENS
                ================================================= */}

                <section
                    className={
                        styles.areaItens
                    }
                >

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


                        <div
                            className={
                                styles.acoesDisponibilidade
                            }
                        >

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


                            {itensSelecionados.length > 0 && (

                                <div
                                    className={
                                        styles.alterarDisponibilidade
                                    }
                                >

                                    <span
                                        className={
                                            styles.textoDisponibilidade
                                        }
                                    >
                                        Alterar disponibilidade
                                    </span>


                                    <button
                                        type="button"
                                        className={
                                            styles.botaoDisponibilidade
                                        }
                                        onClick={() =>
                                            handleAlterarDisponibilidade(
                                                true
                                            )
                                        }
                                        title="Marcar selecionados como disponíveis"
                                    >
                                        D
                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            styles.botaoDisponibilidade
                                        }
                                        onClick={() =>
                                            handleAlterarDisponibilidade(
                                                false
                                            )
                                        }
                                        title="Marcar selecionados como indisponíveis"
                                    >
                                        I
                                    </button>

                                </div>

                            )}

                        </div>

                    </div>


                    {/* =================================================
                        CABEÇALHO DA TABELA
                    ================================================= */}

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


                    {/* =================================================
                        LISTA DE ITENS
                    ================================================= */}

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
                                                        montarUrlImagem(
                                                            item.imagem
                                                        ) || ''
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


                                        <div
                                            className={
                                                styles.statusArea
                                            }
                                        >

                                            <button
    type="button"
    className={`
        ${styles.status}
        ${
            item.disponivel
                ? styles.disponivel
                : styles.indisponivel
        }
    `}
    onClick={() =>
        handleAlterarDisponibilidade(
            !item.disponivel,
            item.id
        )
    }
>
    <span className={styles.ponto} />

    {item.disponivel
        ? 'Disponível'
        : 'Indisponível'}
</button>


                                            <MenuItem

                                                onVerItem={() =>
                                                    handleVerItem(
                                                        item
                                                    )
                                                }

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
                MODAL NOVA / EDITAR CATEGORIA
            ===================================================== */}

            {mostrarNovaCategoria && (

                <NovaCategoria

                    categoriaEmEdicao={
                        categoriaEmEdicao
                    }

                    mostrarSalvarOutraCategoria={
                        false
                    }

                    onFechar={() => {

                        handleFecharNovaCategoria();

                    }}

                    onSalvar={async (
                        nomeCategoria,
                        continuarCadastrando
                    ) => {

                        const sucesso =
                            await handleSalvarCategoria(
                                nomeCategoria
                            );

                        if (
                            sucesso &&
                            !continuarCadastrando
                        ) {

                            handleFecharNovaCategoria();

                        }

                    }}

                />

            )}


            {/* =====================================================
                MODAL NOVO / ALTERAR ITEM
            ===================================================== */}

            {mostrarNovoItem && (

                <NovoItem

                    categorias={
                        categorias
                    }

                    itemParaAlterar={
                        itemEmAlteracao || undefined
                    }

                    modoAlteracao={
                        itemEmAlteracao !== null
                    }

                    onFechar={
                        handleFecharNovoItem
                    }

                    onItemCriado={
                        handleItemCriado
                    }

                    onItemAlterado={
                        (item) => {

                            handleItemAlterado(
                                item
                            );

                            handleFecharNovoItem();

                        }
                    }

                />

            )}


            {/* =====================================================
                MODAL VER ITEM
            ===================================================== */}

            {itemEmVisualizacao && (

                <VerItem

                    item={
                        itemEmVisualizacao
                    }

                    categorias={
                        categorias
                    }

                    onFechar={
                        handleFecharVerItem
                    }

                    montarUrlImagem={
                        montarUrlImagem
                    }

                />

            )}


            {/* =====================================================
                MODAL CONFIRMAÇÃO DE EXCLUSÃO DA CATEGORIA
            ===================================================== */}

            {categoriaParaExcluir && (

                <div
                    className={
                        styles.modalExcluirOverlay
                    }
                    onMouseDown={(evento) => {

                        if (
                            evento.target ===
                            evento.currentTarget &&
                            !excluindoCategoria
                        ) {

                            setCategoriaParaExcluir(
                                null
                            );

                        }

                    }}
                >

                    <div
                        className={
                            styles.modalExcluir
                        }
                        onMouseDown={(evento) =>
                            evento.stopPropagation()
                        }
                    >

                        <div
                            className={
                                styles.modalExcluirIcone
                            }
                        >
                            ⚠️
                        </div>


                        <h2>
                            Excluir categoria
                        </h2>


                        <p>
                            Tem certeza que deseja excluir
                            a categoria{' '}

                            <strong>
                                "{categoriaParaExcluir.nome}"
                            </strong>
                            ?
                        </p>


                        <p
                            className={
                                styles.avisoExclusao
                            }
                        >
                            Todos os itens pertencentes a esta
                            categoria também serão excluídos.
                        </p>


                        <div
                            className={
                                styles.modalExcluirAcoes
                            }
                        >

                            <button
                                type="button"
                                className={
                                    styles.btnCancelarExclusao
                                }
                                onClick={() =>
                                    setCategoriaParaExcluir(
                                        null
                                    )
                                }
                                disabled={
                                    excluindoCategoria
                                }
                            >
                                Cancelar
                            </button>


                            <button
                                type="button"
                                className={
                                    styles.btnConfirmarExclusao
                                }
                                onClick={
                                    confirmarExclusaoCategoria
                                }
                                disabled={
                                    excluindoCategoria
                                }
                            >

                                {excluindoCategoria
                                    ? 'Excluindo...'
                                    : 'Excluir categoria'
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

