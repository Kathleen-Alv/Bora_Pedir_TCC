import { useState } from 'react';

import styles from './PortalGestao.module.css';

import { HeaderAdmin } from '../../components/HeaderAdmin/headerAdmin';

/* IMAGENS */
import inicio from '../../assets/portalGestao/inicio.png';
import cardapio from '../../assets/portalGestao/menu.png';
import pedidos from '../../assets/portalGestao/pedidos.png';
import avaliacao from '../../assets/portalGestao/avaliacao.png';
import financeiro from '../../assets/portalGestao/financeiro.png';
import minhasPromocoes from '../../assets/portalGestao/minhasPromocoes.png';
import participarPromocoes from '../../assets/portalGestao/promocoes.png';
import perfil from '../../assets/portalGestao/loja.png';
import horarios from '../../assets/portalGestao/horario.png';
import suporte from '../../assets/portalGestao/suporte.png';


/* =========================
   SUB PÁGINAS
========================= */

import { Cardapio } from '../PortalGestao/componentes_gestao/Cardapio/cardapio';


type Tela =
    | 'inicio'
    | 'cardapio'
    | 'pedidos'
    | 'avaliacoes'
    | 'financeiro'
    | 'minhasPromocoes'
    | 'participarPromocoes'
    | 'perfil'
    | 'horarios'
    | 'suporte';


export function PortalGestao() {

    const [telaAtual, setTelaAtual] = useState<Tela>('inicio');


    return (
        <>

            {/* HEADER */}

            <HeaderAdmin />


            <div className={styles.portal}>


                {/* =========================
                    SIDEBAR
                ========================= */}

                <aside className={styles.sidebar}>


                    {/* =========================
                        INÍCIO
                    ========================= */}

                    <button
                        className={styles.menuItem}
                        onClick={() => setTelaAtual('inicio')}
                    >

                        <img
                            src={inicio}
                            alt="Início"
                            className={styles.menuIcon}
                        />

                        <span>
                            Início
                        </span>

                    </button>


                    {/* =========================
                        GESTÃO
                    ========================= */}

                    <div className={styles.category}>

                        <div className={styles.categoryTitle}>
                            Gestão
                        </div>


                        {/* CARDÁPIO */}

                        <button
                            className={styles.menuItem}
                            onClick={() => setTelaAtual('cardapio')}
                        >

                            <img
                                src={cardapio}
                                alt="Cardápio"
                                className={styles.menuIcon}
                            />

                            <span>
                                Cardápio
                            </span>

                        </button>


                        {/* PEDIDOS */}

                        <button
                            className={styles.menuItem}
                            onClick={() => setTelaAtual('pedidos')}
                        >

                            <img
                                src={pedidos}
                                alt="Pedidos"
                                className={styles.menuIcon}
                            />

                            <span>
                                Pedidos
                            </span>

                        </button>


                        {/* AVALIAÇÕES */}

                        <button
                            className={styles.menuItem}
                            onClick={() => setTelaAtual('avaliacoes')}
                        >

                            <img
                                src={avaliacao}
                                alt="Avaliações"
                                className={styles.menuIcon}
                            />

                            <span>
                                Avaliações
                            </span>

                        </button>


                        {/* FINANCEIRO */}

                        <button
                            className={styles.menuItem}
                            onClick={() => setTelaAtual('financeiro')}
                        >

                            <img
                                src={financeiro}
                                alt="Financeiro"
                                className={styles.menuIcon}
                            />

                            <span>
                                Financeiro
                            </span>

                        </button>

                    </div>


                    {/* =========================
                        PROMOÇÕES
                    ========================= */}

                    <div className={styles.category}>

                        <div className={styles.categoryTitle}>
                            Promoções
                        </div>


                        {/* MINHAS PROMOÇÕES */}

                        <button
                            className={styles.menuItem}
                            onClick={() =>
                                setTelaAtual('minhasPromocoes')
                            }
                        >

                            <img
                                src={minhasPromocoes}
                                alt="Minhas Promoções"
                                className={styles.menuIcon}
                            />

                            <span>
                                Minhas Promoções
                            </span>

                        </button>


                        {/* PARTICIPAR DE PROMOÇÕES */}

                        <button
                            className={styles.menuItem}
                            onClick={() =>
                                setTelaAtual('participarPromocoes')
                            }
                        >

                            <img
                                src={participarPromocoes}
                                alt="Participar de Promoções"
                                className={styles.menuIcon}
                            />

                            <span>
                                Participar de Promoções
                            </span>

                        </button>


                        {/* =========================
                            MINHA LOJA
                        ========================= */}

                        <div className={styles.categoryTitle}>
                            Minha Loja
                        </div>


                        {/* PERFIL */}

                        <button
                            className={styles.menuItem}
                            onClick={() => setTelaAtual('perfil')}
                        >

                            <img
                                src={perfil}
                                alt="Perfil"
                                className={styles.menuIcon}
                            />

                            <span>
                                Perfil
                            </span>

                        </button>


                        {/* HORÁRIOS */}

                        <button
                            className={styles.menuItem}
                            onClick={() =>
                                setTelaAtual('horarios')
                            }
                        >

                            <img
                                src={horarios}
                                alt="Horários de Funcionamento"
                                className={styles.menuIcon}
                            />

                            <span>
                                Horários de Funcionamento
                            </span>

                        </button>


                        {/* SUPORTE */}

                        <button
                            className={styles.menuItem}
                            onClick={() =>
                                setTelaAtual('suporte')
                            }
                        >

                            <img
                                src={suporte}
                                alt="Suporte"
                                className={styles.menuIcon}
                            />

                            <span>
                                Suporte
                            </span>

                        </button>

                    </div>

                </aside>


                {/* =========================
                    CONTEÚDO
                ========================= */}

                <main className={styles.content}>


                    {/* INÍCIO */}

                    {telaAtual === 'inicio' && (

                        <div>
                            <h1>
                                Início
                            </h1>

                            <p>
                                Bem-vindo ao painel de gestão do seu comércio.
                            </p>
                        </div>

                    )}


                    {/* CARDÁPIO */}

                    {telaAtual === 'cardapio' && (
                        <Cardapio />
                    )}


                    {/* PEDIDOS */}

                    {telaAtual === 'pedidos' && (

                        <div>
                            <h1>
                                Pedidos
                            </h1>

                            <p>
                                Aqui ficarão os pedidos do comércio.
                            </p>
                        </div>

                    )}


                    {/* AVALIAÇÕES */}

                    {telaAtual === 'avaliacoes' && (

                        <div>
                            <h1>
                                Avaliações
                            </h1>

                            <p>
                                Aqui ficarão as avaliações dos clientes.
                            </p>
                        </div>

                    )}


                    {/* FINANCEIRO */}

                    {telaAtual === 'financeiro' && (

                        <div>
                            <h1>
                                Financeiro
                            </h1>

                            <p>
                                Aqui ficarão os dados financeiros.
                            </p>
                        </div>

                    )}


                    {/* MINHAS PROMOÇÕES */}

                    {telaAtual === 'minhasPromocoes' && (

                        <div>
                            <h1>
                                Minhas Promoções
                            </h1>

                            <p>
                                Aqui ficarão suas promoções.
                            </p>
                        </div>

                    )}


                    {/* PARTICIPAR DE PROMOÇÕES */}

                    {telaAtual === 'participarPromocoes' && (

                        <div>
                            <h1>
                                Participar de Promoções
                            </h1>

                            <p>
                                Aqui ficarão as promoções disponíveis.
                            </p>
                        </div>

                    )}


                    {/* PERFIL */}

                    {telaAtual === 'perfil' && (

                        <div>
                            <h1>
                                Perfil
                            </h1>

                            <p>
                                Dados do comércio.
                            </p>
                        </div>

                    )}


                    {/* HORÁRIOS */}

                    {telaAtual === 'horarios' && (

                        <div>
                            <h1>
                                Horários de Funcionamento
                            </h1>

                            <p>
                                Configure os horários do comércio.
                            </p>
                        </div>

                    )}


                    {/* SUPORTE */}

                    {telaAtual === 'suporte' && (

                        <div>
                            <h1>
                                Suporte
                            </h1>

                            <p>
                                Solicitações de suporte.
                            </p>
                        </div>

                    )}

                </main>

            </div>

        </>
    );
}