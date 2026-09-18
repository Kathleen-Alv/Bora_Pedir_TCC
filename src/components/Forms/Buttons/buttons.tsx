import styles from './buttons.module.css';

type ButtonsProps = {
  children: React.ReactNode;
};

export function Buttons({ children }: ButtonsProps) {
  return (


    <div className={styles.footercontainer}>
      {children}
    </div>



  );
}

