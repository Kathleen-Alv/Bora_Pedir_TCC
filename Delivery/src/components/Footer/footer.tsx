import styles from './footer.module.css';
import iconeFooter from '../../assets/footer/footerImg.png';

type FooterProps = {
  children?: React.ReactNode;
};

export function Footer({ children }: FooterProps) {
  return (
    <div className={styles.footercontainer}>
      <div className={styles.footerCima}>
        <div className={styles.footerQuadrado}>
          <img
            src={iconeFooter}
            alt="Logo Footer"
            className={styles.iconeLogo} /* Usando classe própria para a imagem */
          />
        </div>
      </div>

      <div className={styles.footerBaixo}>
        {/* conteúdo da parte inferior */}
      </div>

      {children}
    </div>
  );
}