import { Footer } from '../../components/Footer/footer';
import { Header } from '../../components/Header/header';

import styles from './home.module.css';

import imagemEntregador from '../../assets/1.svg';
import imagemRestaurante from '../../assets/2.svg';

import { useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      {/* =========================
          BANNER PRINCIPAL
      ========================= */}
      <div className={styles.bannerPrincipal}>
        {/* conteúdo do banner principal */}
      </div>

      {/* =========================
          SEJA UM PARCEIRO (CARDS)
      ========================= */}
      <section className={styles.secaoParceiros}>
        <div className={styles.headerParceiros}>
          <h2>Seja um Parceiro</h2>
          <h3>Bora começar?</h3>
          
        </div>

        <div className={styles.cardsGrid}>
          {/* CARD 1: ENTREGADOR */}
          <div className={styles.cardParceiro}>
            <div className={styles.cardInfo}>
              <span className={styles.tagParceiro}>Entregadores</span>
              <h3>Entregador Parceiro</h3>
              <p>
                Faça entregas, escolha seus horários e aumente sua renda.
              </p>
            </div>

            <div className={styles.imagemContainer}>
              <img
                src={imagemEntregador}
                alt="Cadastro de entregador"
                className={styles.imagemCard}
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>

            <button
              className={styles.btnParceiro}
              onClick={() => navigate('/cadastro-entregador')}
            >
              Cadastrar Entregador
            </button>
          </div>

          {/* CARD 2: RESTAURANTE / COMERCIAL */}
          <div className={styles.cardParceiro}>
            <div className={styles.cardInfo}>
              <span className={styles.tagParceiro}>Restaurantes & Lojas</span>
              <h3>Seu Comércio</h3>
              <p>
                Cadastre seu Comércio, alcance novos clientes e aumente suas vendas.
              </p>
            </div>

            <div className={styles.imagemContainer}>
              <img
                src={imagemRestaurante}
                alt="Cadastro comercial"
                className={styles.imagemCard}
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>

            <button
              className={styles.btnParceiro}
              onClick={() => navigate('/cadastro-comercial')}
            >
              Cadastrar Comércio
            </button>
          </div>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}
      <Footer />
    </>
  );
}