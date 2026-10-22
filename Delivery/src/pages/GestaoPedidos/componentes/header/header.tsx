import { useState } from "react";
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
  paginaAtual = "Central de pedidos",
  onToggleLoja,
  onNavigatePortal,
}: HeaderProps) {
  const navigate = useNavigate();
  const [lojaAberta, setLojaAberta] = useState(true);

  const handleToggleLoja = () => {
    const novoStatus = !lojaAberta;
    setLojaAberta(novoStatus);
    if (onToggleLoja) {
      onToggleLoja(novoStatus);
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
      {/* LADO ESQUERDO: BOTÃO PORTAL DO COMERCIANTE E BREADCRUMB */}
      <div className={styles.headerEsquerda}>
        <div>
          <button
            type="button"
            className={styles.portalButton}
            onClick={handlePortalClick}
          >
            Portal Do Comerciante
          </button>
        </div>
      </div>

      {/* LADO DIREITO: STATUS, NOTIFICAÇÃO E USUÁRIO */}
      <div className={styles.headerDireita}>
        {/* BOTÃO STATUS DA LOJA */}
        <button
          type="button"
          className={`${styles.statusLoja} ${
            lojaAberta ? styles.lojaAberta : styles.lojaFechada
          }`}
          onClick={handleToggleLoja}
        >
          <span className={styles.chave}>
            <span className={styles.bolinha} />
          </span>
          <span className={styles.textoStatus}>
            {lojaAberta ? "Loja aberta" : "Loja fechada"}
          </span>
        </button>

        {/* DIVISOR */}
        <span className={styles.divisorHeader} />

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