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

                            // ----------------------------------------
                            // Garante que não estamos editando
                            // uma categoria existente.
                            // ----------------------------------------

                            setCategoriaEmEdicao(
                                null
                            );

                            // ----------------------------------------
                            // Abre o modal de cadastro.
                            // ----------------------------------------

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


                        {/* =============================================
                            ADICIONAR CATEGORIA
                        ============================================= */}

                        <button
                            type="button"
                            className={
                                styles.adicionarCategoria
                            }
                            onClick={() => {

                                // ----------------------------------------
                                // Abre como NOVA categoria.
                                // ----------------------------------------

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

                                    // ------------------------------------
                                    // Coloca a categoria no estado
                                    // de edição e abre o mesmo modal.
                                    // ------------------------------------

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

                                    console.log(
                                        'Excluir categoria:',
                                        categoriaMenuAberto
                                    );

                                    setCategoriaMenuAberto(
                                        null
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


                    {/* =================================================
                        BARRA DOS ITENS
                    ================================================= */}

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


                            {/* =========================================
                                SELECIONAR TUDO
                            ========================================= */}

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


                            {/* =========================================
                                ALTERAR DISPONIBILIDADE
                            ========================================= */}

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


                                    {/* ---------------------------------
                                        BOTÃO D
                                    --------------------------------- */}

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


                                    {/* ---------------------------------
                                        BOTÃO I
                                    --------------------------------- */}

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


                                        {/* =================================
                                            NOME / IMAGEM / SELEÇÃO
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
                                            DISPONIBILIDADE / MENU
                                        ================================= */}

                                        <div
                                            className={
                                                styles.statusArea
                                            }
                                        >


                                            {/* ---------------------------------
                                                STATUS VISUAL
                                            --------------------------------- */}

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


                                            {/* ---------------------------------
                                                MENU DOS TRÊS PONTOS
                                            --------------------------------- */}

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

        /*
         * No Cardápio não queremos mostrar:
         *
         * "Salvar e adicionar outra Categoria"
         *
         * Esse botão continua disponível em outros
         * lugares que utilizarem o componente NovaCategoria.
         */
        mostrarSalvarOutraCategoria={
            false
        }

        onFechar={() => {

            /*
             * Fecha o modal e limpa a categoria
             * que estava sendo editada.
             */
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

        </div>

    );

} 