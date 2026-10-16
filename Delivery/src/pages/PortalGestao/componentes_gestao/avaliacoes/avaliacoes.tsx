
import styles from "./avaliacoes.module.css";

import BannerAvaliacaoImg from "../../../../assets/avaliacao/avaliacao.svg";

function BannerAvaliacao() {
  return (
    <section className={styles.bannerContainer}>
      <img
        src={BannerAvaliacaoImg}
        className={styles.banner}
        alt="Banner de avaliação"
        title="Avaliação"
        draggable={false}
      />

      {/* QUADRO DE PONTUAÇÃO FICTÍCIA */}
      <div className={styles.quadroAvaliacao}>
        <span className={styles.tituloPontuacao}>
          Sua pontuação
        </span>

        <strong className={styles.nota}>
          4,8
          <span className={styles.notaMaxima}> / 5,0</span>
        </strong>

        <div
          className={styles.estrelas}
          aria-label="Cinco estrelas ilustrativas"
        >
          ★★★★★
        </div>

        <span className={styles.textoAvaliacao}>
          Avaliação fictícia
        </span>
      </div>
    </section>
  );
}

export function Avaliacoes() {
  return (
    <main className={styles.container}>
      <BannerAvaliacao />
    </main>
  );
}

export default Avaliacoes;
