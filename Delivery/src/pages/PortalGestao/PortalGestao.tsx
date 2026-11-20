import { useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./PortalGestao.module.css";

import { HeaderGestao } from "../../components/headerGestao/headerGestao";

/* =====================================================
   IMAGENS
===================================================== */

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

/* =====================================================
   PÁGINAS E COMPONENTES
===================================================== */

import { InicioComerciante } from "./componentes_gestao/Inicio/InicioComerciante";
import { Perfil } from "./componentes_gestao/perfil/perfil";
import { Avaliacoes } from "./componentes_gestao/avaliacoes/avaliacoes";
import { Cardapio } from "./componentes_gestao/Cardapio/cardapio";
import { Precificacao } from "./componentes_gestao/Cardapio/calculadoraDePrecificação/calculadoraDePrecificação";
import { Pedidos } from "./componentes_gestao/pedidos_detalhes/pedidos_detalhes";
import { Horarios } from "./componentes_gestao/horarios/horarios";

/* =====================================================
   TELAS DO PORTAL
===================================================== */

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

/* =====================================================
   PORTAL DE GESTÃO
===================================================== */

export function PortalGestao() {
  const [telaAtual, setTelaAtual] = useState<Tela>("inicio");

  // Estado da sidebar
  const [sidebarAberta, setSidebarAberta] = useState(true);

  const navigate = useNavigate();

  /* =====================================================
     ALTERNAR SIDEBAR
  ===================================================== */

  const alternarSidebar = () => {
    setSidebarAberta((estadoAtual) => !estadoAtual);
  };

  /* =====================================================
     NAVEGAÇÃO PARA GESTÃO DE PEDIDOS
  ===================================================== */

  const abrirGestaoPedidos = () => {
    navigate("/gestao_pedidos");
  };

  /* =====================================================
     CLASSE DOS ITENS
  ===================================================== */

  const classeMenu = (tela: Tela) =>
    `${styles.menuItem} ${
      telaAtual === tela ? styles.active : ""
    }`;

  /* =====================================================
     RENDERIZAÇÃO
  ===================================================== */

  return (
    <>
      {/* HEADER */}

      <HeaderGestao />

      <div
        className={`${styles.portal} ${
          sidebarAberta
            ? styles.sidebarAberta
            : styles.sidebarFechada
        }`}
      >
        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside className={styles.sidebar}>
          {/* INÍCIO */}

          <button
            type="button"
            className={classeMenu("inicio")}
            onClick={() => setTelaAtual("inicio")}
            title={!sidebarAberta ? "Início" : ""}
          >
            <img
              src={inicio}
              alt=""
              className={styles.menuIcon}
            />

            <span>Início</span>
          </button>

          {/* =====================================================
              GESTÃO DE PEDIDOS
          ===================================================== */}

          <button
            type="button"
            className={styles.menuItem}
            onClick={abrirGestaoPedidos}
            title={!sidebarAberta ? "Gestão de Pedidos" : ""}
          >
            <img
              src={gestaoPedidos}
              alt=""
              className={styles.menuIcon}
            />

            <span>Gestão de Pedidos</span>
          </button>

          {/* =====================================================
              GESTÃO
          ===================================================== */}

          <div className={styles.category}>
            <div className={styles.categoryTitle}>
              Gestão
            </div>

            {/* CARDÁPIO */}

            <button
              type="button"
              className={classeMenu("cardapio")}
              onClick={() => setTelaAtual("cardapio")}
              title={!sidebarAberta ? "Cardápio" : ""}
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
              className={classeMenu("pedidos")}
              onClick={() => setTelaAtual("pedidos")}
              title={!sidebarAberta ? "Pedidos" : ""}
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
              className={classeMenu("avaliacoes")}
              onClick={() => setTelaAtual("avaliacoes")}
              title={!sidebarAberta ? "Avaliações" : ""}
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
              className={classeMenu("financeiro")}
              onClick={() => setTelaAtual("financeiro")}
              title={!sidebarAberta ? "Financeiro" : ""}
            >
              <img
                src={financeiro}
                alt=""
                className={styles.menuIcon}
              />

              <span>Financeiro</span>
            </button>
          </div>

          {/* =====================================================
              PRECIFICAÇÃO
          ===================================================== */}

          <button
            type="button"
            className={classeMenu("precificacao")}
            onClick={() => setTelaAtual("precificacao")}
            title={!sidebarAberta ? "Precificação" : ""}
          >
            <img
              src={precificacao}
              alt=""
              className={styles.menuIcon}
            />

            <span>Precificação</span>
          </button>

          {/* =====================================================
              PROMOÇÕES
          ===================================================== */}

          <div className={styles.category}>
            <div className={styles.categoryTitle}>
              Promoções
            </div>

            {/* MINHAS PROMOÇÕES */}

            <button
              type="button"
              className={classeMenu("minhasPromocoes")}
              onClick={() => setTelaAtual("minhasPromocoes")}
              title={!sidebarAberta ? "Minhas Promoções" : ""}
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
              className={classeMenu("participarPromocoes")}
              onClick={() => setTelaAtual("participarPromocoes")}
              title={!sidebarAberta ? "Participar de Promoções" : ""}
            >
              <img
                src={participarPromocoes}
                alt=""
                className={styles.menuIcon}
              />

              <span>Participar de Promoções</span>
            </button>
          </div>

          {/* =====================================================
              MINHA LOJA
          ===================================================== */}

          <div className={styles.category}>
            <div className={styles.categoryTitle}>
              Minha Loja
            </div>

            {/* PERFIL */}

            <button
              type="button"
              className={classeMenu("perfil")}
              onClick={() => setTelaAtual("perfil")}
              title={!sidebarAberta ? "Perfil" : ""}
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
              className={classeMenu("horarios")}
              onClick={() => setTelaAtual("horarios")}
              title={!sidebarAberta ? "Horários de Funcionamento" : ""}
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
              className={classeMenu("suporte")}
              onClick={() => setTelaAtual("suporte")}
              title={!sidebarAberta ? "Suporte" : ""}
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

        {/* =====================================================
            BOTÃO LATERAL ABRIR / FECHAR
        ===================================================== */}

        <button
          type="button"
          className={styles.sidebarToggle}
          onClick={alternarSidebar}
          aria-label={
            sidebarAberta
              ? "Recolher menu lateral"
              : "Expandir menu lateral"
          }
          title={
            sidebarAberta
              ? "Recolher menu"
              : "Expandir menu"
          }
        >
          <span className={styles.toggleIcon}>
            {sidebarAberta ? "‹" : "›"}
          </span>
        </button>

        {/* =====================================================
            CONTEÚDO DO PORTAL
        ===================================================== */}

        <main className={styles.content}>
          {/* INÍCIO */}

          {telaAtual === "inicio" && <InicioComerciante />}

          {/* CARDÁPIO */}

          {telaAtual === "cardapio" && <Cardapio />}

          {/* PERFIL */}

          {telaAtual === "perfil" && <Perfil />}

          {/* PEDIDOS */}

          {telaAtual === "pedidos" && <Pedidos />}

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

          {telaAtual === "horarios" && <Horarios />}

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