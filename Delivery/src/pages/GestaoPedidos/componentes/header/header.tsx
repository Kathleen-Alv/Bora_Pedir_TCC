import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./header.module.css";

interface HeaderProps {
  nomeLoja?: string;
  cargoUsuario?: string;
  iniciaisAvatar?: string;
  qtdNotificacoes?: number;
  paginaAtual?: string;
  onToggleLoja?: (aberta: boolean) => void;
  onNavigatePortal?: () => void;
}

export function Header({
  nomeLoja = "Recanto Nordestino",
  cargoUsuario = "Administrador",
  iniciaisAvatar = "RN",
  qtdNotificacoes = 0,
  onToggleLoja,
  onNavigatePortal,
}: HeaderProps) {
  const navigate = useNavigate();
  const [lojaAberta, setLojaAberta] = useState(true);

  /* =========================================================
     CARREGAR STATUS ATUAL DA LOJA AO MONTAR
  ========================================================= */
  useEffect(() => {
    async function buscarStatusInicial() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const resposta = await fetch(
          "http://localhost:3000/api/comercios/horarios",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!resposta.ok) return;

        const dados = await resposta.json();
        if (typeof dados.aberto !== "undefined") {
          setLojaAberta(Boolean(dados.aberto));
        }
      } catch (erro) {
        console.error("Erro ao buscar status da loja:", erro);
      }
    }

    buscarStatusInicial();
  }, []);

  /* =========================================================
     ALTERNAR STATUS (ABRIR / FECHAR COMÉRCIO)
  ========================================================= */
  const handleToggleLoja = async () => {
    const novoStatus = !lojaAberta;

    // Atualiza o visual imediatamente
    setLojaAberta(novoStatus);

    if (onToggleLoja) {
      onToggleLoja(novoStatus);
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch("http://localhost:3000/api/comercios/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ aberto: novoStatus }),
      });
    } catch (erro) {
      console.error("Erro ao sincronizar status da loja com o servidor:", erro);
    }
  };

  const handlePortalClick = () => {
    if (onNavigatePortal) {
      onNavigatePortal();
    } else {
      navigate("/gestao");
    }
  };

  return (
    <header className={styles.header}>
      {/* LADO ESQUERDO: PORTAL DO COMERCIANTE + BOTÃO ABRIR/FECHAR */}
      <div className={styles.headerEsquerda}>
        <button
          type="button"
          className={styles.portalButton}
          onClick={handlePortalClick}
        >
          Portal Do Comerciante
        </button>

        {/* BOTÃO STATUS DA LOJA AO LADO DIREITO DO PORTAL */}
        <button
          type="button"
          className={`${styles.statusLoja} ${
            lojaAberta ? styles.lojaAberta : styles.lojaFechada
          }`}
          onClick={handleToggleLoja}
          title={
            lojaAberta
              ? "Clique para fechar o comércio manualmente"
              : "Clique para abrir o comércio"
          }
        >
          <span className={styles.chave}>
            <span className={styles.bolinha} />
          </span>
          <span className={styles.textoStatus}>
            {lojaAberta ? "Loja aberta" : "Loja fechada"}
          </span>
        </button>
      </div>

      {/* LADO DIREITO: NOTIFICAÇÃO E USUÁRIO */}
      <div className={styles.headerDireita}>
        {/* BOTÃO NOTIFICAÇÃO */}
        <button
          type="button"
          className={styles.botaoNotificacao}
          aria-label="Notificações"
        >
          <span>♧</span>
          {qtdNotificacoes > 0 && (
            <span className={styles.badgeNotificacao}>
              {qtdNotificacoes}
            </span>
          )}
        </button>

        {/* INFORMAÇÕES DO USUÁRIO */}
        <div className={styles.usuario}>
          <div className={styles.avatar}>{iniciaisAvatar}</div>
          <div className={styles.dadosUsuario}>
            <strong>{nomeLoja}</strong>
            <span>{cargoUsuario}</span>
          </div>
          <span className={styles.seta}>⌄</span>
        </div>
      </div>
    </header>
  );
}