import { HeaderAdmin } from '../../components/HeaderAdmin/headerAdmin';

import styles from './AdminBoraPedir.module.css';

type AdminBoraPedirProps = {
  children?: React.ReactNode;
};

export function AdminBoraPedir({ children }: AdminBoraPedirProps) {

  return (
    <>
      <HeaderAdmin />

      <div className={styles.portal}>

        <aside className={styles.sidebar}>

          <button className={styles.menuItem}>
            <span>Início</span>
          </button>

          <div className={styles.category}>

            <div className={styles.categoryTitle}>
              Análise Cadastral
            </div>

            <button className={styles.menuItem}>
              <span>Comércios</span>
            </button>

            <button className={styles.menuItem}>
              <span>Entregadores</span>
            </button>

          </div>

          <div className={styles.category}>

            <div className={styles.categoryTitle}>
              Suporte
            </div>

            <button className={styles.menuItem}>
              <span>Solicitações em Aberto</span>
            </button>

            <button className={styles.menuItem}>
              <span>Solicitações Encerradas</span>
            </button>

          </div>

        </aside>

        <main className={styles.content}>
          {children}
        </main>

      </div>
    </>
  );
}