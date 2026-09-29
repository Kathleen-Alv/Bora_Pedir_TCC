
import { useState } from 'react';

import styles from './gestaoPedidos.module.css';


/* =========================================================
   IMAGENS
========================================================= */

import pedidos from '../../assets/gestao_pedidos/delivery-man.png';

import entrega from '../../assets/gestao_pedidos/delivery-bike.png';

import pedidosConcluidos from '../../assets/gestao_pedidos/paper-bag.png';

import duvidas from '../../assets/gestao_pedidos/question-mark.png';

import cardapio from '../../assets/gestao_pedidos/book.png';


/* =========================================================
   LOGO DO COMÉRCIO
========================================================= */

import logoComercio from '../../assets/portalGestao/suporte.png';


/* =========================================================
   TIPOS
========================================================= */

type Pagina =
    | 'pedidos'
    | 'entrega'
    | 'pedidosConcluidos'
    | 'cardapio'
    | 'duvidas'
    | 'configuracoes';


/* =========================================================
   COMPONENTE
========================================================= */

export function GestaoPedidos() {

    /* =====================================================
       ESTADO DA LOJA
    ===================================================== */

    const [lojaAberta, setLojaAberta] =
        useState(true);


    /* =====================================================
       PÁGINA ATIVA
    ===================================================== */

    const [paginaAtiva, setPaginaAtiva] =
        useState<Pagina>('pedidos');


    /* =====================================================
       SIDEBAR ABERTO / FECHADO
    ===================================================== */

    const [sidebarAberto, setSidebarAberto] =
        useState(true);


    /* =====================================================
       MENU
    ===================================================== */

    const menus: {
        id: Pagina;
        imagem: string;
        nome: string;
        alt: string;
    }[] = [

        /* =================================================
           PEDIDOS
        ================================================= */

        {
            id: 'pedidos',
            imagem: pedidos,
            nome: 'Pedidos',
            alt: 'Pedidos',
        },


        /* =================================================
           PEDIDOS EM ENTREGA
        ================================================= */

        {
            id: 'entrega',
            imagem: entrega,
            nome: 'Pedidos em entrega',
            alt: 'Pedidos em entrega',
        },


        /* =================================================
           PEDIDOS CONCLUÍDOS
        ================================================= */

        {
            id: 'pedidosConcluidos',
            imagem: pedidosConcluidos,
            nome: 'Pedidos concluídos',
            alt: 'Pedidos concluídos',
        },


        /* =================================================
           CARDÁPIO
        ================================================= */

        {
            id: 'cardapio',
            imagem: cardapio,
            nome: 'Cardápio',
            alt: 'Cardápio',
        },


        /* =================================================
           DÚVIDAS
        ================================================= */

        {
            id: 'duvidas',
            imagem: duvidas,
            nome: 'Dúvidas',
            alt: 'Dúvidas',
        },

    ];


    /* =====================================================
       TÍTULOS
    ===================================================== */

    const titulos: Record<Pagina, string> = {

        pedidos:
            'Pedidos',

        entrega:
            'Pedidos em entrega',

        pedidosConcluidos:
            'Pedidos concluídos',

        cardapio:
            'Cardápio',

        duvidas:
            'Dúvidas',

        configuracoes:
            'Configurações',

    };


    /* =====================================================
       ABRIR PÁGINA
    ===================================================== */

    function abrirPagina(pagina: Pagina) {

        setPaginaAtiva(pagina);

    }


    /* =====================================================
       CONTEÚDO DA PÁGINA
    ===================================================== */

    function renderizarPagina() {

        switch (paginaAtiva) {


            /* =============================================
               PEDIDOS
            ============================================= */

            case 'pedidos':

                return (

                    <div
                        className={
                            styles.paginaInterna
                        }
                    >

                        <h1>
                            Pedidos
                        </h1>

                        <p>
                            Aqui ficarão os pedidos
                            recebidos pelo comércio.
                        </p>

                    </div>

                );


            /* =============================================
               PEDIDOS EM ENTREGA
            ============================================= */

            case 'entrega':

                return (

                    <div
                        className={
                            styles.paginaInterna
                        }
                    >

                        <h1>
                            Pedidos em entrega
                        </h1>

                        <p>
                            Aqui serão exibidos os pedidos
                            que estão em processo de entrega.
                        </p>

                    </div>

                );


            /* =============================================
               PEDIDOS CONCLUÍDOS
            ============================================= */

            case 'pedidosConcluidos':

                return (

                    <div
                        className={
                            styles.paginaInterna
                        }
                    >

                        <h1>
                            Pedidos concluídos
                        </h1>

                        <p>
                            Aqui serão exibidos os pedidos
                            que já foram finalizados.
                        </p>

                    </div>

                );


            /* =============================================
               CARDÁPIO
            ============================================= */

            case 'cardapio':

                return (

                    <div
                        className={
                            styles.paginaInterna
                        }
                    >

                        <h1>
                            Cardápio
                        </h1>

                        <p>
                            Gerencie as categorias e os itens
                            disponíveis no cardápio do comércio.
                        </p>

                    </div>

                );


            /* =============================================
               DÚVIDAS
            ============================================= */

            case 'duvidas':

                return (

                    <div
                        className={
                            styles.paginaInterna
                        }
                    >

                        <h1>
                            Dúvidas
                        </h1>

                        <p>
                            Encontre respostas para suas
                            dúvidas sobre a gestão dos pedidos.
                        </p>

                    </div>

                );


            /* =============================================
               CONFIGURAÇÕES
            ============================================= */

            case 'configuracoes':

                return (

                    <div
                        className={
                            styles.paginaInterna
                        }
                    >

                        <h1>
                            Configurações
                        </h1>

                        <p>
                            Configurações da sua conta
                            e do sistema.
                        </p>

                    </div>

                );


            default:

                return null;

        }

    }


    /* =====================================================
       RETURN
    ===================================================== */

    return (

        <main
            className={`
                ${styles.container}
                ${
                    sidebarAberto
                        ? styles.sidebarExpandido
                        : styles.sidebarRecolhido
                }
            `}
        >


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside
                className={`
                    ${styles.sidebar}
                    ${
                        sidebarAberto
                            ? styles.sidebarAberto
                            : styles.sidebarFechado
                    }
                `}
            >


                {/* =================================================
                    TOPO DO SIDEBAR
                ================================================= */}

                <div
                    className={
                        styles.sidebarTopo
                    }
                >


                    {/* =============================================
                        LOGO
                    ============================================= */}

                    <div
                        className={
                            styles.logoSidebar
                        }
                    >

                        <img
                            src={logoComercio}
                            alt="Logo do comércio"
                            className={
                                styles.logoSidebarImagem
                            }
                        />

                    </div>


                    {/* =============================================
                        INFORMAÇÕES DO COMÉRCIO
                    ============================================= */}

                    {sidebarAberto && (

                        <div
                            className={
                                styles.infoSidebar
                            }
                        >

                            <strong>
                                Gestão de pedidos
                            </strong>

                           

                        </div>

                    )}

                </div>


                {/* =================================================
                    BOTÃO RECOLHER / EXPANDIR
                ================================================= */}

                <button
                    type="button"
                    className={
                        styles.botaoToggleSidebar
                    }
                    onClick={() =>
                        setSidebarAberto(
                            !sidebarAberto
                        )
                    }
                    title={
                        sidebarAberto
                            ? 'Recolher menu'
                            : 'Expandir menu'
                    }
                    aria-label={
                        sidebarAberto
                            ? 'Recolher menu'
                            : 'Expandir menu'
                    }
                >

                    <span>
                        {sidebarAberto
                            ? '‹'
                            : '›'
                        }
                    </span>

                </button>


                {/* =================================================
                    MENU
                ================================================= */}

                <nav
                    className={
                        styles.menu
                    }
                >

                    {menus.map((menu) => (

                        <button
                            key={menu.id}
                            type="button"

                            title={
                                sidebarAberto
                                    ? ''
                                    : menu.alt
                            }

                            className={`
                                ${styles.menuItem}
                                ${
                                    paginaAtiva === menu.id
                                        ? styles.menuItemAtivo
                                        : ''
                                }
                            `}

                            onClick={() =>
                                abrirPagina(
                                    menu.id
                                )
                            }
                        >


                            {/* =====================================
                                ÍCONE
                            ===================================== */}

                            <span
                                className={
                                    styles.menuIcone
                                }
                            >

                                <img
                                    src={menu.imagem}
                                    alt=""
                                />

                            </span>


                            {/* =====================================
                                TEXTO
                            ===================================== */}

                            {sidebarAberto && (

                                <span
                                    className={
                                        styles.menuTexto
                                    }
                                >
                                    {menu.nome}
                                </span>

                            )}

                        </button>

                    ))}

                </nav>


                {/* =================================================
                    CONFIGURAÇÕES
                ================================================= */}

                <div
                    className={
                        styles.menuInferior
                    }
                >

                    <button
                        type="button"

                        title={
                            sidebarAberto
                                ? ''
                                : 'Configurações'
                        }

                        className={`
                            ${styles.menuItem}
                            ${
                                paginaAtiva ===
                                'configuracoes'
                                    ? styles.menuItemAtivo
                                    : ''
                            }
                        `}

                        onClick={() =>
                            abrirPagina(
                                'configuracoes'
                            )
                        }
                    >


                        {/* =========================================
                            ÍCONE CONFIGURAÇÃO
                        ========================================= */}

                        <span
                            className={
                                styles.menuIcone
                            }
                        >

                            <span
                                className={
                                    styles.iconeConfiguracao
                                }
                            >
                                ⚙
                            </span>

                        </span>


                        {/* =========================================
                            TEXTO CONFIGURAÇÃO
                        ========================================= */}

                        {sidebarAberto && (

                            <span
                                className={
                                    styles.menuTexto
                                }
                            >
                                Configurações
                            </span>

                        )}

                    </button>

                </div>

            </aside>


            {/* =================================================
                ÁREA PRINCIPAL
            ================================================= */}

            <div
                className={
                    styles.areaPrincipal
                }
            >


                {/* =================================================
                    HEADER
                ================================================= */}

                <header
                    className={
                        styles.header
                    }
                >


                    {/* =============================================
                        HEADER ESQUERDA
                    ============================================= */}

                    <div
                        className={
                            styles.headerEsquerda
                        }
                    >


                        {/* =========================================
                            STATUS DA LOJA
                        ========================================= */}

                        <button
                            type="button"

                            className={`
                                ${styles.statusLoja}

                                ${
                                    lojaAberta
                                        ? styles.lojaAberta
                                        : styles.lojaFechada
                                }
                            `}

                            onClick={() =>
                                setLojaAberta(
                                    !lojaAberta
                                )
                            }
                        >

                            <span
                                className={
                                    styles.chave
                                }
                            >

                                <span
                                    className={
                                        styles.bolinha
                                    }
                                />

                            </span>


                            <span
                                className={
                                    styles.textoStatus
                                }
                            >

                                {lojaAberta
                                    ? 'Loja aberta'
                                    : 'Loja fechada'
                                }

                            </span>

                        </button>

                    </div>


                    {/* =============================================
                        HEADER DIREITA
                    ============================================= */}

                    <div
                        className={
                            styles.headerDireita
                        }
                    >


                        {/* =========================================
                            NOTIFICAÇÃO
                        ========================================= */}

                        <button
                            type="button"

                            className={
                                styles.botaoNotificacao
                            }

                            aria-label="Notificações"
                        >

                            <span
                                className={
                                    styles.iconeSino
                                }
                            >
                                ♧
                            </span>


                            <span
                                className={
                                    styles.badgeNotificacao
                                }
                            >
                                4
                            </span>

                        </button>


                        {/* =========================================
                            USUÁRIO
                        ========================================= */}

                        <div
                            className={
                                styles.usuario
                            }
                        >

                            <div
                                className={
                                    styles.avatar
                                }
                            >
                                RN
                            </div>


                            <div
                                className={
                                    styles.dadosUsuario
                                }
                            >

                                <strong>
                                    Recanto Nordestino
                                </strong>

                                <span>
                                    Administrador
                                </span>

                            </div>


                            <span
                                className={
                                    styles.seta
                                }
                            >
                                ⌄
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    CONTEÚDO
                ================================================= */}

                <section
                    className={
                        styles.conteudo
                    }
                >


                    {/* =============================================
                        TÍTULO DA PÁGINA
                    ============================================= */}

                    <div
                        className={
                            styles.tituloPagina
                        }
                    >

                        <div>

                            <h1>
                                {titulos[paginaAtiva]}
                            </h1>

                        </div>

                    </div>


                    {/* =============================================
                        PÁGINA ATIVA
                    ============================================= */}

                    {renderizarPagina()}

                </section>

            </div>

        </main>
    );
}
