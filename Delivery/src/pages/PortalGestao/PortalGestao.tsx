import styles from './PortalGestao.module.css';

import { HeaderAdmin } from '../../components/HeaderAdmin/headerAdmin';

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

type PortalGestaoProps = {
  children?: React.ReactNode;
};

export function PortalGestao({ children }: PortalGestaoProps) {
  return (
    <>
      <HeaderAdmin />

      <div className={styles.portal}>

        <aside className={styles.sidebar}>

          {/* INÍCIO */}
          <button className={styles.menuItem}>
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

            <button className={styles.menuItem}>
              <img
                src={cardapio}
                alt="Cardápio"
                className={styles.menuIcon}
              />

              <span>Cardápio</span>
            </button>

            <button className={styles.menuItem}>
              <img
                src={pedidos}
                alt="Pedidos"
                className={styles.menuIcon}
              />

              <span>Pedidos</span>
            </button>

            <button className={styles.menuItem}>
              <img
                src={avaliacao}
                alt="Avaliações"
                className={styles.menuIcon}
              />

              <span>Avaliações</span>
            </button>

            <button className={styles.menuItem}>
              <img
                src={financeiro}
                alt="Financeiro"
                className={styles.menuIcon}
              />

              <span>Financeiro</span>
            </button>

          </div>


          {/* PROMOÇÕES */}
          <div className={styles.category}>

            <div className={styles.categoryTitle}>
              Promoções
            </div>

            <button className={styles.menuItem}>
              <img
                src={minhasPromocoes}
                alt="Minhas Promoções"
                className={styles.menuIcon}
              />

              

              <span>Minhas Promoções</span>
            </button>

            <button className={styles.menuItem}>
              <img
                src={participarPromocoes}
                alt="Participar de Promoções"
                className={styles.menuIcon}
              />

              <span>Participar de Promoções</span>
            </button>


            {/* MINHA LOJA */}
            <div className={styles.categoryTitle}>
              Minha Loja
            </div>

            <button className={styles.menuItem}>
              <img
                src={perfil}
                alt="Perfil"
                className={styles.menuIcon}
              />

              <span>Perfil</span>
            </button>

            <button className={styles.menuItem}>
              <img
                src={horarios}
                alt="Horários de Funcionamento"
                className={styles.menuIcon}
              />

              <span>Horários de Funcionamento</span>
            </button>

            <button className={styles.menuItem}>
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
          {children}
        </main>

      </div>
    </>
  );
}