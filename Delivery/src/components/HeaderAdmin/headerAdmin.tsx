
import { useState } from 'react';
import styles from './headerAdmin.module.css';
import logoAdmin from '../../assets/logoAdmin.svg';

type HeaderAdminProps = {
  children?: React.ReactNode;
};

export function HeaderAdmin({ children }: HeaderAdminProps) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className={styles.header}>

      {/* =================================================
          LOGO
      ================================================= */}

      <div className={styles.headerLogo}>

        <img
          src={logoAdmin}
          alt="Bora Pedir"
          className={styles.logoAdmin}
        />
       

      </div>


      {/* =================================================
          CONTEÚDO
      ================================================= */}

      <div className={styles.headerConteudo}>

        <div className={styles.headerCentro}>
          {children}
        </div>


        {/* =================================================
            PERFIL ADMIN
        ================================================= */}

        <div className={styles.areaPerfil}>

          <button
            type="button"
            className={`${styles.botaoPerfil} ${
              menuAberto ? styles.perfilAtivo : ''
            }`}
            onClick={() => setMenuAberto(!menuAberto)}
            aria-expanded={menuAberto}
            aria-haspopup="menu"
          >

            {/* Avatar */}

            <div className={styles.avatar}>

              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >

                <path
                  d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />

                <path
                  d="M3.5 21C4.4 16.9 7.35 14.5 12 14.5C16.65 14.5 19.6 16.9 20.5 21"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

              </svg>

            </div>


            {/* Informações */}

            <div className={styles.dadosPerfil}>

              <span className={styles.nomeAdmin}>
                Admin
              </span>

              <span className={styles.tipoAdmin}>
                Administrador
              </span>

            </div>


            {/* Seta */}

            <svg
              className={`${styles.seta} ${
                menuAberto ? styles.setaAberta : ''
              }`}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >

              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

            </svg>

          </button>


          {/* =================================================
              MENU
          ================================================= */}

          {menuAberto && (

            <div
              className={styles.menuPerfil}
              role="menu"
            >

              {/* Topo */}

              <div className={styles.menuTopo}>

                <div className={styles.avatarMenu}>

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >

                    <path
                      d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <path
                      d="M3.5 21C4.4 16.9 7.35 14.5 12 14.5C16.65 14.5 19.6 16.9 20.5 21"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                  </svg>

                </div>


                <div className={styles.infoMenu}>

                  <strong>
                    Admin
                  </strong>

                  <span>
                    Administrador
                  </span>

                </div>

              </div>


              <div className={styles.linha} />


              {/* Sair */}

              <button
                type="button"
                className={styles.itemMenu}
                role="menuitem"
                onClick={() => {
                  console.log('Sair da conta');
                }}
              >

                <div className={styles.iconeMenu}>

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >

                    <path
                      d="M10 17L15 12L10 7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M15 12H3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                    <path
                      d="M14 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                  </svg>

                </div>

                <span>
                  Sair da conta
                </span>

              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}
