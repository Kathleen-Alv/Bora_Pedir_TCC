
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './headerGestao.module.css';
import Menu from '../../assets/logo.svg';
import perfil from '../../assets/headerGestao/admin.png';

export function HeaderGestao() {
  const navigate = useNavigate();

  const [menuAberto, setMenuAberto] = useState(false);
  const [email, setEmail] = useState('Carregando e-mail...');
  const [erroEmail, setErroEmail] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // ================================================================
  // IMAGEM DO PERFIL
  // ================================================================

  function PerfilIcon() {
    return (
      <img
        src={perfil}
        className={styles.imgDeIcone}
        alt="Foto do perfil"
        draggable={false}
      />
    );
  }

  // ================================================================
  // BUSCAR E-MAIL REAL DO COMÉRCIO LOGADO
  // ================================================================

  useEffect(() => {
    let ativo = true;

    async function buscarEmail() {
      const token = localStorage.getItem('token');

      if (!token) {
        if (ativo) {
          setEmail('Sessão não autenticada');
          setErroEmail(true);
        }

        return;
      }

      try {
        const resposta = await fetch(
          'http://localhost:3000/api/comercios/ver-email',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        const texto = await resposta.text();

        let dados: {
          sucesso?: boolean;
          email?: string;
          mensagem?: string;
        };

        try {
          dados = JSON.parse(texto);
        } catch {
          console.error(
            'A API retornou uma resposta que não é JSON.',
            {
              status: resposta.status,
              resposta: texto.slice(0, 300),
            }
          );

          throw new Error(
            'O servidor retornou uma resposta inválida.'
          );
        }

        if (!resposta.ok) {
          throw new Error(
            dados.mensagem ||
              `Erro HTTP ${resposta.status}.`
          );
        }

        if (!dados.email) {
          throw new Error(
            dados.mensagem ||
              'O servidor não retornou o e-mail.'
          );
        }

        if (ativo) {
          setEmail(dados.email);
          setErroEmail(false);

          localStorage.setItem('email', dados.email);
        }
      } catch (erro) {
        console.error(
          'Erro ao buscar e-mail do comércio:',
          erro
        );

        if (ativo) {
          setEmail('Erro ao carregar e-mail');
          setErroEmail(true);
        }
      }
    }

    buscarEmail();

    return () => {
      ativo = false;
    };
  }, []);

  // ================================================================
  // FECHAR MENU AO CLICAR FORA
  // ================================================================

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
      document.removeEventListener(
        'mousedown',
        fecharMenu
      );
    };
  }, []);

  // ================================================================
  // SAIR DA CONTA
  // ================================================================

  function sair() {
    localStorage.removeItem('email');
    localStorage.removeItem('token');
    localStorage.removeItem('tipo');
    localStorage.removeItem('comercio_id');

    setMenuAberto(false);

    navigate('/login_comercial');
  }

  // ================================================================
  // INTERFACE
  // ================================================================

  return (
    <header className={styles.header}>
      {/* ==========================================================
          LOGO BORA PEDIR
      ========================================================== */}

      <div className={styles.logoContainer}>
        <img
          src={Menu}
          alt="Bora Pedir"
          draggable={false}
        />
      </div>

      {/* ==========================================================
          CONTA DO USUÁRIO
      ========================================================== */}

      <div className={styles.accountContainer}>
        <div
          className={styles.account}
          ref={menuRef}
        >
          {/* E-MAIL NO CABEÇALHO */}

          <button
            type="button"
            className={styles.accountButton}
            onClick={() =>
              setMenuAberto((aberto) => !aberto)
            }
            aria-expanded={menuAberto}
            aria-haspopup="true"
            aria-label={`Conta: ${email}`}
          >
            <span
              className={styles.accountEmail}
              title={erroEmail ? email : undefined}
            >
              {email}
            </span>

            <span
              className={styles.arrow}
              aria-hidden="true"
            >
              {menuAberto ? '▲' : '▼'}
            </span>
          </button>

          {/* ======================================================
              MENU SUSPENSO
          ====================================================== */}

          {menuAberto && (
            <div className={styles.dropdown}>
              {/* INFORMAÇÕES DO ADMINISTRADOR */}

              <div className={styles.adminInfo}>
                {/* IMAGEM DO PERFIL */}

                <div className={styles.adminIcon}>
                  <PerfilIcon />
                </div>

                {/* NOME */}

                <div className={styles.adminText}>
                  <span className={styles.adminName}>
                    Administrador
                  </span>
                </div>
              </div>

              {/* LINHA DIVISÓRIA */}

              <div className={styles.dropdownDivider} />

              {/* BOTÃO SAIR */}

              <button
                type="button"
                className={styles.logoutButton}
                onClick={sair}
              >
                <span aria-hidden="true">
                  ⇥
                </span>

                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
