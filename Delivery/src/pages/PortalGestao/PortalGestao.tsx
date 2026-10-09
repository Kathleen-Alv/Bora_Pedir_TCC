import { useState } from 'react';
import styles from './PortalGestao.module.css';

import {Header}  from '../../components/Header/header.tsx';

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
import precificacao from '../../assets/portalGestao/precificacao.png';
import Perfil from './componentes_gestao/perfil/perfil';

import { Inicio } from './componentes_gestao/Inicio/inicio';

/* SUB PÁGINAS */
import { Cardapio } from '../PortalGestao/componentes_gestao/Cardapio/cardapio';

import { Precificacao } from './componentes_gestao/Cardapio/calculadoraDePrecificação/calculadoraDePrecificação';


type Tela =
  | 'inicio'
  | 'cardapio'
  | 'pedidos'
  | 'avaliacoes'
  | 'financeiro'
  | 'precificacao'
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
      <Header />

      <div className={styles.portal}>

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>

          {/* INÍCIO */}
          <button
            className={`${styles.menuItem} ${
              telaAtual === 'inicio' ? styles.active : ''
            }`}
            onClick={() => setTelaAtual('inicio')}
          >
            <img
              src={inicio}
              alt="Início"
              className={styles.menuIcon}
            />
            <span>Início</span>
          </button>


          {/* GESTÃO */}
          <div className={styles.category}>

            <div className={styles.categoryTitle}>
              Gestão
            </div>

            {/* CARDÁPIO */}
            <button
              className={`${styles.menuItem} ${
                telaAtual === 'cardapio' ? styles.active : ''
              }`}
              onClick={() => setTelaAtual('cardapio')}
            >
              <img
                src={cardapio}
                alt="Cardápio"
                className={styles.menuIcon}
              />
              <span>Cardápio</span>
            </button>


            {/* PEDIDOS */}
            <button
              className={`${styles.menuItem} ${
                telaAtual === 'pedidos' ? styles.active : ''
              }`}
              onClick={() => setTelaAtual('pedidos')}
            >
              <img
                src={pedidos}
                alt="Pedidos"
                className={styles.menuIcon}
              />
              <span>Pedidos</span>
            </button>


            {/* AVALIAÇÕES */}
            <button
              className={`${styles.menuItem} ${
                telaAtual === 'avaliacoes' ? styles.active : ''
              }`}
              onClick={() => setTelaAtual('avaliacoes')}
            >
              <img
                src={avaliacao}
                alt="Avaliações"
                className={styles.menuIcon}
              />
              <span>Avaliações</span>
            </button>


            {/* FINANCEIRO */}
            <button
              className={`${styles.menuItem} ${
                telaAtual === 'financeiro' ? styles.active : ''
              }`}
              onClick={() => setTelaAtual('financeiro')}
            >
              <img
                src={financeiro}
                alt="Financeiro"
                className={styles.menuIcon}
              />
              <span>Financeiro</span>
            </button>

          </div>


          {/* PRECIFICAÇÃO */}
          <button
            className={`${styles.menuItem} ${
              telaAtual === 'precificacao' ? styles.active : ''
            }`}
            onClick={() => setTelaAtual('precificacao')}
          >
            <img
              src={precificacao}
              alt="Precificação"
              className={styles.menuIcon}
            />
            <span>Precificação</span>
          </button>


          {/* PROMOÇÕES */}
          <div className={styles.category}>

            <div className={styles.categoryTitle}>
              Promoções
            </div>


            {/* MINHAS PROMOÇÕES */}
            <button
              className={`${styles.menuItem} ${
                telaAtual === 'minhasPromocoes'
                  ? styles.active
                  : ''
              }`}
              onClick={() =>
                setTelaAtual('minhasPromocoes')
              }
            >
              <img
                src={minhasPromocoes}
                alt="Minhas Promoções"
                className={styles.menuIcon}
              />
              <span>Minhas Promoções</span>
            </button>


            {/* PARTICIPAR DE PROMOÇÕES */}
            <button
              className={`${styles.menuItem} ${
                telaAtual === 'participarPromocoes'
                  ? styles.active
                  : ''
              }`}
              onClick={() =>
                setTelaAtual('participarPromocoes')
              }
            >
              <img
                src={participarPromocoes}
                alt="Participar de Promoções"
                className={styles.menuIcon}
              />
              <span>Participar de Promoções</span>
            </button>

          </div>


          {/* MINHA LOJA */}
          <div className={styles.category}>

            <div className={styles.categoryTitle}>
              Minha Loja
            </div>


            {/* PERFIL */}
            <button
              className={`${styles.menuItem} ${
                telaAtual === 'perfil' ? styles.active : ''
              }`}
              onClick={() => setTelaAtual('perfil')}
            >
              <img
                src={perfil}
                alt="Perfil"
                className={styles.menuIcon}
              />
              <span>Perfil</span>
            </button>

            












            {/* HORÁRIOS */}
            <button
              className={`${styles.menuItem} ${
                telaAtual === 'horarios' ? styles.active : ''
              }`}
              onClick={() => setTelaAtual('horarios')}
            >
              <img
                src={horarios}
                alt="Horários de Funcionamento"
                className={styles.menuIcon}
              />
              <span>Horários de Funcionamento</span>
            </button>


            {/* SUPORTE */}
            <button
              className={`${styles.menuItem} ${
                telaAtual === 'suporte' ? styles.active : ''
              }`}
              onClick={() => setTelaAtual('suporte')}
            >
              <img
                src={suporte}
                alt="Suporte"
                className={styles.menuIcon}
              />
              <span>Suporte</span>
            </button>

          </div>

        </aside>


        {/* CONTEÚDO */}
        <main className={styles.content}>

          {/* INÍCIO */}
          {telaAtual === 'inicio' && (
            <Inicio />
          )}


          {/* CARDÁPIO */}
          {telaAtual === 'cardapio' && (
            <Cardapio />
          )}


          {/* Perfil do comercio */}
          {telaAtual === 'perfil' && (
            <Perfil />
          )}


          {/* PEDIDOS */}
          {telaAtual === 'pedidos' && (
            <div>
              <h1>Pedidos</h1>
              <p>
                Aqui ficarão os pedidos do comércio.
              </p>
            </div>
          )}


          {/* AVALIAÇÕES */}
          {telaAtual === 'avaliacoes' && (
            <div>
              <h1>Avaliações</h1>
              <p>
                Aqui ficarão as avaliações dos clientes.
              </p>
            </div>
          )}


          {/* FINANCEIRO */}
          {telaAtual === 'financeiro' && (
            <div>
              <h1>Financeiro</h1>
              <p>
                Aqui ficarão os dados financeiros.
              </p>
            </div>
          )}


          {telaAtual === 'precificacao' && (
          <Precificacao
            onFechar={() => setTelaAtual('inicio')}
          />
        )}


          {/* MINHAS PROMOÇÕES */}
          {telaAtual === 'minhasPromocoes' && (
            <div>
              <h1>Minhas Promoções</h1>
              <p>
                Aqui ficarão suas promoções.
              </p>
            </div>
          )}


          {/* PARTICIPAR DE PROMOÇÕES */}
          {telaAtual === 'participarPromocoes' && (
            <div>
              <h1>Participar de Promoções</h1>
              <p>
                Aqui ficarão as promoções disponíveis.
              </p>
            </div>
          )}


          {/* PERFIL */}
          {telaAtual === 'perfil' && (
            <div>
              
            </div>
          )}


          {/* HORÁRIOS */}
          {telaAtual === 'horarios' && (
            <div>
              <h1>Horários de Funcionamento</h1>
              <p>
                Configure os horários do comércio.
              </p>
            </div>
          )}


          {/* SUPORTE */}
          {telaAtual === 'suporte' && (
            <div>
              <h1>Suporte</h1>
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