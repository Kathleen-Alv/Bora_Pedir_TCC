import styles from './avaliacoes.module.css';

import BannerAvaliacaoImg from '../../../../assets/avaliacao/avaliacao.svg';

function BannerAvaliacao() {
  return (
    <img
      src={BannerAvaliacaoImg}
      className={styles.banner}
      alt="Banner de avaliação"
      title="Avaliação"
      draggable={false}
    />
  );
}

export function Avaliacoes() {
  return (
    <main className={styles.container}>
      {/* Banner no início da página */}
      <BannerAvaliacao />

      <header className={styles.header}>
        <h1>Página de Avaliação</h1>
      </header>

      <section className={styles.conteudo}>
        <h2>Avalie nosso atendimento</h2>
        <p>Deixe sua avaliação abaixo.</p>

        <textarea
          className={styles.textarea}
          placeholder="Escreva sua avaliação..."
        />

        <button type="button" className={styles.button}>
          Enviar avaliação
        </button>
      </section>
    </main>
  );
}