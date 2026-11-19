import { useState } from 'react';

import { InicioAdmin } from '../../componentes_admin/inicio/inicioAdmin';
import { ComerciosAdmin } from '../../componentes_admin/comercios/comercioAdmin';
import { EntregadorAdmin } from '../../componentes_admin/entregadores/entregadorAdmin';
import { ComercioDados } from '../../componentes_admin/dados_sistema/comercioDados/comercioDados';
import { EntregadorDados } from '../../componentes_admin/dados_sistema/entregadorDados/entregadorDados';
import styles from './adminBoraPedir.module.css';

type TelaAdmin =
  | 'inicio'
  | 'comercios'
  | 'entregadores'
  | 'Dados de Comércios'
  | 'Dados de Entregadores'
  | 'abertas'
  | 'encerradas';

interface PageMeta {
  categoria: string;
  titulo: string;
  subtitulo: string;
}

const PAGE_METADATA: Record<TelaAdmin, PageMeta> = {
  inicio: {
    categoria: 'Visão Geral',
    titulo: 'Dashboard',
    subtitulo: 'Resumo operacional, aprovações pendentes e métricas da plataforma.',
  },
  comercios: {
    categoria: 'Análise Cadastral',
    titulo: 'Comércios',
    subtitulo: 'Avalie e aprove o cadastro de novos estabelecimentos parceiros.',
  },
  entregadores: {
    categoria: 'Análise Cadastral',
    titulo: 'Entregadores',
    subtitulo: 'Valide documentação, CNH e veículos dos entregadores cadastrados.',
  },
  'Dados de Comércios': {
    categoria: 'Dados do Sistema',
    titulo: 'Dados de Comércios',
    subtitulo: 'Consulte informações completas e status dos comércios registrados.',
  },
  'Dados de Entregadores': {
    categoria: 'Dados do Sistema',
    titulo: 'Dados de Entregadores',
    subtitulo: 'Gerencie os registros e dados cadastrais da frota de entregadores.',
  },
  abertas: {
    categoria: 'Suporte',
    titulo: 'Solicitações em Aberto',
    subtitulo: 'Chamados e ocorrências aguardando resposta da equipe administrativa.',
  },
  encerradas: {
    categoria: 'Suporte',
    titulo: 'Solicitações Encerradas',
    subtitulo: 'Histórico de atendimentos concluídos na plataforma.',
  },
};

export function AdminBoraPedir() {
  const [telaAtual, setTelaAtual] = useState<TelaAdmin>('inicio');
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  const metaAtual = PAGE_METADATA[telaAtual];

  const handleNavegar = (tela: TelaAdmin) => {
    setTelaAtual(tela);
    setMenuMobileAberto(false);
  };

  const handleSair = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <>
      {/* HEADER SUPERIOR INTEGRADO */}
      <header className={styles.topHeader}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.mobileMenuBtn}
            aria-label="Abrir menu"
            onClick={() => setMenuMobileAberto((prev) => !prev)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>

          <div className={styles.brandGroup}>
            <div className={styles.brandLogo}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>

            <div className={styles.brandText}>
              <span className={styles.brandName}>Bora Pedir</span>
              <span className={styles.brandTag}>Admin</span>
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.statusPill}>
            <span className={styles.statusDot} />
            <span>Operacional</span>
          </div>

          <div className={styles.headerDivider} />

          <div className={styles.adminProfile}>
            <div className={styles.adminAvatar}>AD</div>
            <div className={styles.adminInfo}>
              <span className={styles.adminName}>Administrador</span>
              <span className={styles.adminRole}>Gestão Geral</span>
            </div>
          </div>

          <button type="button" className={styles.logoutBtn} onClick={handleSair}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* PORTAL */}
      <div className={styles.portal}>
        {menuMobileAberto && (
          <div
            className={styles.backdrop}
            onClick={() => setMenuMobileAberto(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`${styles.sidebar} ${
            menuMobileAberto ? styles.sidebarOpen : ''
          }`}
        >
          <div className={styles.sidebarTop}>
            {/* INÍCIO */}
            <button
              type="button"
              className={`${styles.menuItem} ${
                telaAtual === 'inicio' ? styles.active : ''
              }`}
              onClick={() => handleNavegar('inicio')}
            >
              <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
              <span>Início</span>
            </button>

            {/* ANÁLISE CADASTRAL */}
            <div className={styles.category}>
              <div className={styles.categoryTitle}>Análise Cadastral</div>

              <button
                type="button"
                className={`${styles.menuItem} ${
                  telaAtual === 'comercios' ? styles.active : ''
                }`}
                onClick={() => handleNavegar('comercios')}
              >
                <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Comércios</span>
              </button>

              <button
                type="button"
                className={`${styles.menuItem} ${
                  telaAtual === 'entregadores' ? styles.active : ''
                }`}
                onClick={() => handleNavegar('entregadores')}
              >
                <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="15" cy="5" r="1" />
                  <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
                </svg>
                <span>Entregadores</span>
              </button>
            </div>

            {/* DADOS DO SISTEMA */}
            <div className={styles.category}>
              <div className={styles.categoryTitle}>Dados do Sistema</div>

              <button
                type="button"
                className={`${styles.menuItem} ${
                  telaAtual === 'Dados de Comércios' ? styles.active : ''
                }`}
                onClick={() => handleNavegar('Dados de Comércios')}
              >
                <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
                <span>Dados de Comércios</span>
              </button>

              <button
                type="button"
                className={`${styles.menuItem} ${
                  telaAtual === 'Dados de Entregadores' ? styles.active : ''
                }`}
                onClick={() => handleNavegar('Dados de Entregadores')}
              >
                <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Dados de Entregadores</span>
              </button>
            </div>

            {/* SUPORTE */}
            <div className={styles.category}>
              <div className={styles.categoryTitle}>Suporte</div>

              <button
                type="button"
                className={`${styles.menuItem} ${
                  telaAtual === 'abertas' ? styles.active : ''
                }`}
                onClick={() => handleNavegar('abertas')}
              >
                <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Solicitações em Aberto</span>
              </button>

              <button
                type="button"
                className={`${styles.menuItem} ${
                  telaAtual === 'encerradas' ? styles.active : ''
                }`}
                onClick={() => handleNavegar('encerradas')}
              >
                <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Solicitações Encerradas</span>
              </button>
            </div>
          </div>

          <div className={styles.sidebarFooter}>
            <span>Bora Pedir Delivery</span>
            <span className={styles.versionPill}>v1.0</span>
          </div>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <div className={styles.contentWrapper}>
          <header className={styles.pageHeader}>
            <div className={styles.pageHeaderLeft}>
              <nav className={styles.breadcrumb} aria-label="Navegação">
                <span>{metaAtual.categoria}</span>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>{metaAtual.titulo}</span>
              </nav>

              <h1 className={styles.pageTitle}>{metaAtual.titulo}</h1>
              <p className={styles.pageSubtitle}>{metaAtual.subtitulo}</p>
            </div>
          </header>

          <main className={styles.content}>
            <div className={styles.surfaceCard} key={telaAtual}>
              {telaAtual === 'inicio' && <InicioAdmin />}

              {telaAtual === 'comercios' && <ComerciosAdmin />}

              {telaAtual === 'entregadores' && <EntregadorAdmin />}

              {telaAtual === 'Dados de Comércios' && <ComercioDados />}

              {telaAtual === 'Dados de Entregadores' && <EntregadorDados />}

              {telaAtual === 'abertas' && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <h2 className={styles.emptyStateTitle}>Nenhuma solicitação em aberto</h2>
                  <p className={styles.emptyStateDesc}>
                    Quando comércios ou entregadores abrirem um chamado de suporte, eles aparecerão listados aqui.
                  </p>
                </div>
              )}

              {telaAtual === 'encerradas' && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h2 className={styles.emptyStateTitle}>Nenhum histórico encerrado</h2>
                  <p className={styles.emptyStateDesc}>
                    Os atendimentos finalizados pela equipe administrativa ficarão registrados nesta seção.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}