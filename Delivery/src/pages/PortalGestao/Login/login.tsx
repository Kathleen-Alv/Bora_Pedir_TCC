import styles from './login.module.css';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { Header } from '../../../components/Header/header';
import { Footer } from '../../../components/Footer/footer';

type LoginProps = {
    children?: ReactNode;
};


export function Login({ children }: LoginProps) {

    const navigate = useNavigate();


    // ============================================================
    // ESTADOS
    // ============================================================

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);


    // ============================================================
    // LOGIN
    // ============================================================

    async function handleLogin() {

        // Limpa erro anterior
        setErro('');


        // Validação simples
        if (!email || !senha) {

            setErro('Preencha o e-mail e a senha.');

            return;

        }


        try {

            setCarregando(true);


            // ====================================================
            // ENVIA LOGIN PARA O BACKEND
            // ====================================================

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


            // ====================================================
            // VERIFICA SE DEU ERRO
            // ====================================================

            if (!resposta.ok) {

                setErro(
                    dados.message ||
                    'Não foi possível realizar o login.'
                );

                return;

            }


            // ====================================================
            // LOGIN REALIZADO
            // ====================================================

            console.log('Login realizado:', dados);

            localStorage.setItem('token', dados.token);


            // ====================================================
            // PRIMEIRO ACESSO
            // ====================================================

            if (dados.primeiro_acesso === true) {

                navigate('/primeiro_acesso');

                return;

            }


            // ====================================================
            // COMÉRCIO JÁ CONFIGURADO
            // ====================================================

            navigate('/gestao');


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
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
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
                                value={senha}
                                onChange={(e) =>
                                    setSenha(e.target.value)
                                }
                            />

                        </div>


                        {/* Erro + Esqueci minha senha */}

                        <div className={styles.acoesLogin}>


                            {/* Mensagem de erro */}

                            {erro && (

                                <label className={styles.labelError}>
                                    {erro}
                                </label>

                            )}


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

            </div>


            <Footer />

            {children}

        </>
    );
}