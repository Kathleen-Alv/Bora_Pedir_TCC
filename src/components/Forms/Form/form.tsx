import styles from './form.module.css';

type FormProps = {
  children?: React.ReactNode;
};

export function Form({ children }: FormProps) {
  return (
    <div className={styles.formConteiner}>
      {children}
    </div>
  );
}

