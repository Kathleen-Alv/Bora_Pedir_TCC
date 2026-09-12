import { useState } from 'react';

import styles from './gestaoPedidos.module.css';


/* =========================
   IMAGENS
========================= */

import inicio from '../../assets/portalGestao/inicio.png';
import pedidos from '../../assets/portalGestao/pedidos.png';
import cardapio from '../../assets/portalGestao/menu.png';
import avaliacao from '../../assets/portalGestao/avaliacao.png';
import financeiro from '../../assets/portalGestao/financeiro.png';
import promocoes from '../../assets/portalGestao/promocoes.png';
import loja from '../../assets/portalGestao/loja.png';
import horario from '../../assets/portalGestao/horario.png';
import suporte from '../../assets/portalGestao/suporte.png';


/* =========================
   LOGO DO COMÉRCIO
========================= */

// Troque pelo caminho da sua imagem
import logoComercio from '../../assets/portalGestao/suporte.png';


export function GestaoPedidos() {

    /* =========================
       ESTADO DA LOJA
    ========================= */

    const [lojaAberta, setLojaAberta] = useState(true);


    return (

        <main className={styles.container}>


            {/* =========================
                HEADER
            ========================= */}

            <header className={styles.header}>


                {/* HEADER ESQUERDA */}

                <div className={styles.headerEsquerda}>


                    {/* LOGO */}

                    <img
                        src={logoComercio}
                        alt="Logo do comércio"
                        className={styles.logoComercio}
                    />


                    {/* NOME */}

                    <div className={styles.nomeComercio}>

                        <strong>
                            Recanto Nordestino
                        </strong>

                        <span>
                            Comércio
                        </span>

                    </div>


                    {/* STATUS DA LOJA */}

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
                            setLojaAberta(!lojaAberta)
                        }
                    >

                        <span className={styles.chave}>

                            <span className={styles.bolinha}></span>

                        </span>


                        <span className={styles.textoStatus}>

                            {lojaAberta
                                ? 'Loja aberta'
                                : 'Loja fechada'
                            }

                        </span>

                    </button>

                </div>


                {/* =========================
                    HEADER DIREITA
                ========================= */}

                <div className={styles.headerDireita}>


                    {/* NOTIFICAÇÃO */}

                    <button
                        type="button"
                        className={styles.botaoNotificacao}
                    >

                        🔔

                    </button>


                    {/* USUÁRIO */}

                    <div className={styles.usuario}>


                        <div className={styles.avatar}>
                            RN
                        </div>


                        <div className={styles.dadosUsuario}>

                            <strong>
                                Recanto Nordestino
                            </strong>

                            <span>
                                Administrador
                            </span>

                        </div>


                        <span className={styles.seta}>
                            ⌄
                        </span>

                    </div>

                </div>

            </header>


            {/* =========================
                CORPO
            ========================= */}

            <div className={styles.corpo}>


                {/* =========================
                    SIDEBAR
                ========================= */}

                <aside className={styles.sidebar}>


                    <nav className={styles.menu}>


                        {/* INÍCIO */}

                        <button
                            type="button"
                            className={styles.menuItem}
                        >

                            <img
                                src={inicio}
                                alt="Início"
                            />

                        </button>


                        {/* PEDIDOS */}

                        <button
                            type="button"
                            className={styles.menuItem}
                        >

                            <img
                                src={pedidos}
                                alt="Pedidos"
                            />

                        </button>


                        {/* CARDÁPIO */}

                        <button
                            type="button"
                            className={styles.menuItem}
                        >

                            <img
                                src={cardapio}
                                alt="Cardápio"
                            />

                        </button>


                        {/* AVALIAÇÕES */}

                        <button
                            type="button"
                            className={styles.menuItem}
                        >

                            <img
                                src={avaliacao}
                                alt="Avaliações"
                            />

                        </button>


                        {/* FINANCEIRO */}

                        <button
                            type="button"
                            className={styles.menuItem}
                        >

                            <img
                                src={financeiro}
                                alt="Financeiro"
                            />

                        </button>


                        {/* PROMOÇÕES */}

                        <button
                            type="button"
                            className={styles.menuItem}
                        >

                            <img
                                src={promocoes}
                                alt="Promoções"
                            />

                        </button>


                        {/* MINHA LOJA */}

                        <button
                            type="button"
                            className={styles.menuItem}
                        >

                            <img
                                src={loja}
                                alt="Minha loja"
                            />

                        </button>


                        {/* HORÁRIOS */}

                        <button
                            type="button"
                            className={styles.menuItem}
                        >

                            <img
                                src={horario}
                                alt="Horários"
                            />

                        </button>


                        {/* SUPORTE */}

                        <button
                            type="button"
                            className={styles.menuItem}
                        >

                            <img
                                src={suporte}
                                alt="Suporte"
                            />

                        </button>

                    </nav>


                    {/* =========================
                        CONFIGURAÇÕES
                    ========================= */}

                    <div className={styles.menuInferior}>

                        <button
                            type="button"
                            className={styles.menuItem}
                        >

                            <span className={styles.iconeConfiguracao}>
                                ⚙
                            </span>

                        </button>

                    </div>

                </aside>


                {/* =========================
                    ÁREA PRINCIPAL
                ========================= */}

                <section className={styles.conteudo}>

                    {/* VAZIO POR ENQUANTO */}

                </section>

            </div>

        </main>
    );
}