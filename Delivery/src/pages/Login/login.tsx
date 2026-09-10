import styles from './login.module.css';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { Header } from '../../components/Header/header';
import { Footer } from '../../components/Footer/footer';

type LoginProps = {
  children?: ReactNode;
};

export function Login({ children }: LoginProps) {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <div className={styles.containerLogin}>

        {/* Banner */}
        <div className={styles.banner}></div>

        {/* Módulo de Login */}
        <div className={styles.moduloLogin}>

          <div className={styles.login}>

            {/* Campo E-mail */}
            <div className={styles.campo}>
              <label htmlFor="usuario">
                E-mail
              </label>

              <input
                type="email"
                id="usuario"
                placeholder="Digite seu e-mail"
              />
            </div>

            {/* Campo Senha */}
            <div className={styles.campo}>
              <label htmlFor="senha">
                Senha
              </label>

              <input
                type="password"
                id="senha"
                placeholder="Digite sua senha"
              />
            </div>

            {/* Erro + Esqueci minha senha */}
            <div className={styles.acoesLogin}>

              {/* Mensagem de erro */}
              <label className={styles.labelError}>
                E-mail ou senha inválidos
              </label>

              {/* Esqueci minha senha */}
              <a
                href="#"
                className={styles.esqueciSenha}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/esqueciMinhaSenha');
                }}
              >
                Esqueci minha senha
              </a>

            </div>

            {/* Botão Entrar */}
            <button
              type="button"
              className={styles.botaoEntrar}
            >
              Entrar
            </button>

          </div>

        </div>
      </div>

      <Footer />

      {children}
    </>
  );
}