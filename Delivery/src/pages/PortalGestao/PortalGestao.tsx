
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PortalGestao.module.css";

import { HeaderGestao } from "../../components/headerGestao/headerGestao";

/* IMAGENS */
import inicio from "../../assets/portalGestao/inicio.png";
import cardapio from "../../assets/portalGestao/menu.png";
import pedidos from "../../assets/portalGestao/pedidos.png";
import avaliacao from "../../assets/portalGestao/avaliacao.png";
import financeiro from "../../assets/portalGestao/financeiro.png";
import minhasPromocoes from "../../assets/portalGestao/minhasPromocoes.png";
import participarPromocoes from "../../assets/portalGestao/promocoes.png";
import perfil from "../../assets/portalGestao/loja.png";
import horarios from "../../assets/portalGestao/horario.png";
import suporte from "../../assets/portalGestao/suporte.png";
import precificacao from "../../assets/portalGestao/precificacao.png";
import gestaoPedidos from "../../assets/portalGestao/gestaoPedidos.png";

/* PÁGINAS E COMPONENTES */
import Perfil from "./componentes_gestao/perfil/perfil";
import { Avaliacoes } from "./componentes_gestao/avaliacoes/avaliacoes";
import { Inicio } from "./componentes_gestao/Inicio/inicio";
import { Cardapio } from "./componentes_gestao/Cardapio/cardapio";
import { Precificacao } from "./componentes_gestao/Cardapio/calculadoraDePrecificação/calculadoraDePrecificação";

type Tela =
  | "inicio"
  | "cardapio"
  | "pedidos"
  | "avaliacoes"
  | "financeiro"
  | "precificacao"
  | "minhasPromocoes"
  | "participarPromocoes"
  | "perfil"
  | "horarios"
  | "suporte";

export function PortalGestao() {
  const [telaAtual, setTelaAtual] = useState<Tela>("inicio");

  const navigate = useNavigate();

  /* =====================================================
     NAVEGAÇÃO PARA GESTÃO DE PEDIDOS
  ===================================================== */

  const abrirGestaoPedidos = () => {
    navigate("/gestao_pedidos");
  };

  return (
    <>
      {/* HEADER */}
      <HeaderGestao />

      <div className={styles.portal}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          {/* INÍCIO */}
          <button
            type="button"
            className={`${styles.menuItem} ${
              telaAtual === "inicio" ? styles.active : ""
            }`}
            onClick={() => setTelaAtual("inicio")}
          >
            <img
              src={inicio}
              alt=""
              className={styles.menuIcon}
            />
            <span>Início</span>
          </button>

          {/* GESTÃO DE PEDIDOS — ABRE OUTRA ROTA */}
          <button
            type="button"
            className={styles.menuItem}
            onClick={abrirGestaoPedidos}
          >
            <img
              src={gestaoPedidos}
              alt=""
              className={styles.menuIcon}
            />
            <span>Gestão de Pedidos</span>
          </button>

          {/* GESTÃO */}
          <div className={styles.category}>
            <div className={styles.categoryTitle}>
              Gestão
            </div>

            {/* CARDÁPIO */}
            <button
              type="button"
              className={`${styles.menuItem} ${
                telaAtual === "cardapio" ? styles.active : ""
              }`}
              onClick={() => setTelaAtual("cardapio")}
            >
              <img
                src={cardapio}
                alt=""
                className={styles.menuIcon}
              />
              <span>Cardápio</span>
            </button>

            {/* PEDIDOS */}
            <button
              type="button"
              className={`${styles.menuItem} ${
                telaAtual === "pedidos" ? styles.active : ""
              }`}
              onClick={() => setTelaAtual("pedidos")}
            >
              <img
                src={pedidos}
                alt=""
                className={styles.menuIcon}
              />
              <span>Pedidos</span>
            </button>

            {/* AVALIAÇÕES */}
            <button
              type="button"
              className={`${styles.menuItem} ${
                telaAtual === "avaliacoes" ? styles.active : ""
              }`}
              onClick={() => setTelaAtual("avaliacoes")}
            >
              <img
                src={avaliacao}
                alt=""
                className={styles.menuIcon}
              />
              <span>Avaliações</span>
            </button>

            {/* FINANCEIRO */}
            <button
              type="button"
              className={`${styles.menuItem} ${
                telaAtual === "financeiro" ? styles.active : ""
              }`}
              onClick={() => setTelaAtual("financeiro")}
            >
              <img
                src={financeiro}
                alt=""
                className={styles.menuIcon}
              />
              <span>Financeiro</span>
            </button>
          </div>

          {/* PRECIFICAÇÃO */}
          <button
            type="button"
            className={`${styles.menuItem} ${
              telaAtual === "precificacao" ? styles.active : ""
            }`}
            onClick={() => setTelaAtual("precificacao")}
          >
            <img
              src={precificacao}
              alt=""
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
              type="button"
              className={`${styles.menuItem} ${
                telaAtual === "minhasPromocoes"
                  ? styles.active
                  : ""
              }`}
              onClick={() => setTelaAtual("minhasPromocoes")}
            >
              <img
                src={minhasPromocoes}
                alt=""
                className={styles.menuIcon}
              />
              <span>Minhas Promoções</span>
            </button>

            {/* PARTICIPAR DE PROMOÇÕES */}
            <button
              type="button"
              className={`${styles.menuItem} ${
                telaAtual === "participarPromocoes"
                  ? styles.active
                  : ""
              }`}
              onClick={() => setTelaAtual("participarPromocoes")}
            >
              <img
                src={participarPromocoes}
                alt=""
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
              type="button"
              className={`${styles.menuItem} ${
                telaAtual === "perfil" ? styles.active : ""
              }`}
              onClick={() => setTelaAtual("perfil")}
            >
              <img
                src={perfil}
                alt=""
                className={styles.menuIcon}
              />
              <span>Perfil</span>
            </button>

            {/* HORÁRIOS */}
            <button
              type="button"
              className={`${styles.menuItem} ${
                telaAtual === "horarios" ? styles.active : ""
              }`}
              onClick={() => setTelaAtual("horarios")}
            >
              <img
                src={horarios}
                alt=""
                className={styles.menuIcon}
              />
              <span>Horários de Funcionamento</span>
            </button>

            {/* SUPORTE */}
            <button
              type="button"
              className={`${styles.menuItem} ${
                telaAtual === "suporte" ? styles.active : ""
              }`}
              onClick={() => setTelaAtual("suporte")}
            >
              <img
                src={suporte}
                alt=""
                className={styles.menuIcon}
              />
              <span>Suporte</span>
            </button>
          </div>
        </aside>

        {/* CONTEÚDO DO PORTAL */}
        <main className={styles.content}>
          {/* INÍCIO */}
          {telaAtual === "inicio" && <Inicio />}

          {/* CARDÁPIO */}
          {telaAtual === "cardapio" && <Cardapio />}

          {/* PERFIL */}
          {telaAtual === "perfil" && <Perfil />}

          {/* PEDIDOS */}
          {telaAtual === "pedidos" && (
            <div>
              <h1>Pedidos</h1>
              <p>Aqui ficarão os pedidos do comércio.</p>
            </div>
          )}

          {/* AVALIAÇÕES */}
          {telaAtual === "avaliacoes" && <Avaliacoes />}

          {/* FINANCEIRO */}
          {telaAtual === "financeiro" && (
            <div>
              <h1>Financeiro</h1>
              <p>Aqui ficarão os dados financeiros.</p>
            </div>
          )}

          {/* PRECIFICAÇÃO */}
          {telaAtual === "precificacao" && (
            <Precificacao
              onFechar={() => setTelaAtual("inicio")}
            />
          )}

          {/* MINHAS PROMOÇÕES */}
          {telaAtual === "minhasPromocoes" && (
            <div>
              <h1>Minhas Promoções</h1>
              <p>Aqui ficarão suas promoções.</p>
            </div>
          )}

          {/* PARTICIPAR DE PROMOÇÕES */}
          {telaAtual === "participarPromocoes" && (
            <div>
              <h1>Participar de Promoções</h1>
              <p>Aqui ficarão as promoções disponíveis.</p>
            </div>
          )}

          {/* HORÁRIOS */}
          {telaAtual === "horarios" && (
            <div>
              <h1>Horários de Funcionamento</h1>
              <p>Configure os horários do comércio.</p>
            </div>
          )}

          {/* SUPORTE */}
          {telaAtual === "suporte" && (
            <div>
              <h1>Suporte</h1>
              <p>Solicitações de suporte.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
