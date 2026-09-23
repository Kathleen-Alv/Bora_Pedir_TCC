import styles from './login.module.css';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { Header } from '../../../components/Header/header';
import { Footer } from '../../../components/Footer/footer';
import telaEntrar from '../../../assets/tela_entrar.png';

type LoginProps = {
    children?: ReactNode;
};

export function Login({ children }: LoginProps) {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function handleLogin() {

        setErro('');

        if (!email || !senha) {
            setErro('Preencha o e-mail e a senha.');
            return;
        }

        try {

            setCarregando(true);

            const resposta = await fetch(
                'http://localhost:3000/api/login-comercio',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email,
                        senha
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                setErro(
                    dados.message ||
                    'Não foi possível realizar o login.'
                );

                return;
            }

            console.log('Login realizado:', dados);

            // =====================================================
            // SALVA O TOKEN
            // =====================================================

            localStorage.setItem('token', dados.token);

            // =====================================================
            // ADMIN
            // =====================================================

            if (dados.papel === 'ADMIN') {

                navigate('/adminBoraPedir');

                return;
            }

            // =====================================================
            // COMÉRCIO - PRIMEIRO ACESSO
            // =====================================================

            if (
                dados.papel === 'COMERCIO' &&
                dados.primeiro_acesso === true
            ) {

                navigate('/primeiro_acesso');

                return;
            }

            // =====================================================
            // COMÉRCIO - ACESSO NORMAL
            // =====================================================

            if (dados.papel === 'COMERCIO') {

                navigate('/gestao');

                return;
            }

            // =====================================================
            // PAPEL NÃO RECONHECIDO
            // =====================================================

            setErro(
                'Tipo de usuário não reconhecido.'
            );

        } catch (error) {

            console.error(
                'Erro ao realizar login:',
                error
            );

            setErro(
                'Não foi possível conectar ao servidor.'
            );

        } finally {

            setCarregando(false);

        }
    }

    return (
        <>
            <Header />

            <div className={styles.containerLogin}>

                {/* LOGIN */}

                <div className={styles.moduloLogin}>

                    <div className={styles.login}>

                        <h1 className={styles.tituloLogin}>
                            Entrar no Portal Gestão Comércio
                        </h1>

                        <div className={styles.campo}>

                            <label htmlFor="usuario">
                                E-mail
                            </label>

                            <input
                                type="email"
                                id="usuario"
                                placeholder="Digite seu e-mail"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                            />

                        </div>

                        <div className={styles.campo}>

                            <label htmlFor="senha">
                                Senha
                            </label>

                            <input
                                type="password"
                                id="senha"
                                placeholder="Digite sua senha"
                                value={senha}
                                onChange={(e) =>
                                    setSenha(e.target.value)
                                }
                            />

                        </div>

                        <div className={styles.acoesLogin}>

                            {erro && (
                                <label className={styles.labelError}>
                                    {erro}
                                </label>
                            )}

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

                        <button
                            type="button"
                            className={styles.botaoEntrar}
                            onClick={handleLogin}
                            disabled={carregando}
                        >
                            {carregando
                                ? 'Entrando...'
                                : 'Entrar'
                            }
                        </button>

                    </div>

                </div>

                {/* BANNER */}

                <div
                    className={styles.banner}
                    style={{
                        backgroundImage: `url(${telaEntrar})`
                    }}
                />

            </div>

            <Footer />

            {children}

        </>
    );
}