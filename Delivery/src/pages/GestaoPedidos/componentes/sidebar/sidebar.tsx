import { useState } from "react";
import logoComercio from "../../../../assets/BPedir.svg";
import styles from "./sidebar.module.css";

export interface MenuItemData {
  id: string;
  nome: string;
  imagem?: string;
  alt: string;
}

interface SidebarProps {
  menus: MenuItemData[];
  paginaAtiva: string;
  onSelectMenu: (id: string) => void;
  onSelectConfiguracoes?: () => void;
}

export function Sidebar({
  menus,
  paginaAtiva,
  onSelectMenu,
  onSelectConfiguracoes,
}: SidebarProps) {
  const [sidebarAberto, setSidebarAberto] = useState(true);

  return (
    <aside
      className={`${styles.sidebar} ${
        sidebarAberto ? styles.sidebarAberto : styles.sidebarFechado
      }`}
    >
      {/* TOPO */}
      <div className={styles.sidebarTopo}>
        <div className={styles.logoSidebar}>
          <img
            src={logoComercio}
            alt="Logo do comércio"
            className={styles.logoSidebarImagem}
          />
        </div>
        {sidebarAberto && (
          <div className={styles.infoSidebar}>
            <strong>Bora Pedir</strong>
            <span>Gestão de Pedidos</span>
          </div>
        )}
      </div>

      {/* BOTÃO TOGGLE */}
      <button
        type="button"
        className={styles.botaoToggleSidebar}
        onClick={() => setSidebarAberto(!sidebarAberto)}
        aria-label={sidebarAberto ? "Recolher menu" : "Expandir menu"}
      >
        {sidebarAberto ? "‹" : "›"}
      </button>

      {/* NAVEGAÇÃO PRINCIPAL */}
      <div className={styles.menuContainer}>
        <nav className={styles.menu}>
          {sidebarAberto && (
            <span className={styles.menuLegenda}>MENU PRINCIPAL</span>
          )}
          {menus.map((menu) => (
            <button
              key={menu.id}
              type="button"
              title={menu.alt}
              className={`${styles.menuItem} ${
                paginaAtiva === menu.id ? styles.menuItemAtivo : ""
              }`}
              onClick={() => onSelectMenu(menu.id)}
            >
              <span className={styles.menuIcone}>
                {menu.imagem && <img src={menu.imagem} alt={menu.alt} />}
              </span>
              {sidebarAberto && (
                <span className={styles.menuTexto}>{menu.nome}</span>
              )}
            </button>
          ))}
        </nav>

        {/* MENU INFERIOR (CONFIGURAÇÕES) */}
        <div className={styles.menuInferior}>
          <button
            type="button"
            title="Configurações"
            className={`${styles.menuItem} ${
              paginaAtiva === "configuracoes" ? styles.menuItemAtivo : ""
            }`}
            onClick={() => onSelectConfiguracoes && onSelectConfiguracoes()}
          >
            <span className={styles.menuIcone}>
              <span className={styles.iconeConfiguracao}>⚙</span>
            </span>
            {sidebarAberto && (
              <span className={styles.menuTexto}>Configurações</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}