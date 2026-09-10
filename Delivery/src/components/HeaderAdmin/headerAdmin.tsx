import styles from './headerAdmin.module.css';
import logoAdmin from '../../assets/headerAdmin/boraPedirAdmin.svg';



type HeaderAdminProps = {
  children?: React.ReactNode;
};

export function HeaderAdmin({ children }: HeaderAdminProps) {
  return (
    <header className={styles.header}>

  {/* Primeira parte - Logo */}
  <div className={styles.headerLogo}>
    <img
      src={logoAdmin}
      alt="Logo"
      className={styles.logoAdmin}
    />
  </div>

  {/* Segunda parte - Conteúdo do Header */}
  <div className={styles.headerConteudo}>
    {/* Aqui você pode colocar perfil, notificações, nome do ADM etc. */}
  </div>

</header>
  );
}
