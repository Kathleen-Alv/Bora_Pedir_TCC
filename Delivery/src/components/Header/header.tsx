import { useNavigate } from 'react-router-dom';

import styles from './header.module.css';
import logo from '../../assets/BPedir.svg';


export function Header() {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>

      {/* esquerda */}
      <div>
        
      </div>

      {/* meio */}
      <div>
        <img
          src={logo}
          alt="Logo"
          className={styles.logo}
          onClick={() => navigate('/')}
        />
      </div>

      {/* direita */}
      <div>
        <button
          className={styles.button}
          onClick={() => navigate('/login_comercial')}
        >
          Portal Do Comerciante
        </button>
      </div>

    </header>
  );
}