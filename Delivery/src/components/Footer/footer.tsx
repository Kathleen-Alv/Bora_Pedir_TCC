import styles from './footer.module.css';

import borapedirIMG from '../../assets/footer/gpt2.png'
import appleStore from '../../assets/footer/app_store.svg'
import playStore from '../../assets/footer/play_store.svg'

type FooterProps = {
  children?: React.ReactNode;
};

export function Footer({ children }: FooterProps) {
  return (
    <div className={styles.footercontainer}>
      <div className={styles.footerCima}>
        <div className={styles.footerQuadrado}>
          <img
            src={borapedirIMG}
            alt="Logo Footer"
            className={styles.borapedirIMG} /* Usando classe própria para a imagem */
          />
        </div>
      </div>

      <div className={styles.footerBaixo}>

        <div className={styles.logoStore}>
          <h1>Disponível em: </h1>
          <img
            src={playStore}
            alt="Logo Footer"
            className={styles.logoStoreIMG} /* Usando classe própria para a imagem */
          />

          <img
            src={appleStore}
            alt="Logo Footer"
            className={styles.logoStoreIMG} /* Usando classe própria para a imagem */
          />
          
        </div>

        
        {/* conteúdo da parte inferior */}
      </div>

      {children}
    </div>
  );
}