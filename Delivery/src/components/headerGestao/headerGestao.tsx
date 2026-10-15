
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


import styles from './headerGestao.module.css';
import Menu from '../../assets/logo.svg';

export function HeaderGestao() {
  const navigate = useNavigate();

  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Exemplo: substitua pelo e-mail real da conta logada
  const email = localStorage.getItem('email') || 'usuario@email.com';

  useEffect(() => {
    function fecharMenu(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuAberto(false);
      }
    }

    document.addEventListener('mousedown', fecharMenu);

    return () => {
      document.removeEventListener('mousedown', fecharMenu);
    };
  }, []);

  function sair() {
    localStorage.removeItem('email');
    localStorage.removeItem('token');

    setMenuAberto(false);
    navigate('/login_comercial');
  }

  return (
    <header className={styles.header}>
      {/* esquerda */}
      <div>
        <img src={Menu} alt="Menu" />
      </div>


      {/* direita */}
      <div>
        <div className={styles.account} ref={menuRef}>
          <button
            type="button"
            className={styles.accountButton}
            onClick={() => setMenuAberto(!menuAberto)}
            aria-expanded={menuAberto}
            aria-haspopup="true"
          >
            <span className={styles.accountEmail}>{email}</span>
            <span className={styles.arrow}>
              {menuAberto ? '▲' : '▼'}
            </span>
          </button>

          {menuAberto && (
            <div className={styles.dropdown}>
              <div className={styles.emailInfo}>
                {email}
              </div>

              <button
                type="button"
                className={styles.logoutButton}
                onClick={sair}
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}