
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Header } from '../../components/Header/header';
import { Footer } from '../../components/Footer/footer';

import styles from './EsqueciMinhaSenha.module.css';

type Etapa = 1 | 2 | 3 | 4;

export function EsqueciMinhaSenha() {

    const navigate = useNavigate();

    const [etapa, setEtapa] = useState<Etapa>(1);

    // =========================
    // E-MAIL
    // =========================

    const [email, setEmail] = useState('');
    const [erroEmail, setErroEmail] = useState('');
    const [carregandoEmail, setCarregandoEmail] = useState(false);


    // =========================
    // CÓDIGO
    // =========================

    const [codigo, setCodigo] = useState<string[]>([
        '',
        '',
        '',
        '',
        '',
        ''
    ]);

    const [erroCodigo, setErroCodigo] = useState('');
    const [carregandoCodigo, setCarregandoCodigo] = useState(false);

    const [tempo, setTempo] = useState(60);

    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);


    // =========================
    // NOVA SENHA
    // =========================

    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [erroSenha, setErroSenha] = useState('');
    const [carregandoSenha, setCarregandoSenha] = useState(false);


    // =========================
    // TIMER
    // =========================

    useEffect(() => {

        if (etapa !== 2 || tempo <= 0) {
            return;
        }

        const intervalo = setInterval(() => {

            setTempo((tempoAtual) => tempoAtual - 1);

        }, 1000);

        return () => clearInterval(intervalo);

    }, [etapa, tempo]);


    // =========================
    // ENVIAR CÓDIGO
    // =========================

    async function handleEnviarCodigo(
        event: React.FormEvent
    ) {

        event.preventDefault();

        setErroEmail('');

        if (!email.trim()) {

            setErroEmail(
                'Digite seu e-mail.'
            );

            return;
        }

        setCarregandoEmail(true);

        try {

            const resposta = await fetch(
                'http://localhost:3000/api/recuperacao-senha/enviar-codigo',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email: email.trim()
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                setErroEmail(
                    dados.message ||
                    'Não foi possível enviar o código.'
                );

                return;
            }

            setCodigo([
                '',
                '',
                '',
                '',
                '',
                ''
            ]);

            setTempo(60);

            setEtapa(2);

            setTimeout(() => {

                inputsRef.current[0]?.focus();

            }, 100);

        } catch (error) {

            console.error(
                'Erro ao enviar código:',
                error
            );

            setErroEmail(
                'Não foi possível conectar ao servidor.'
            );

        } finally {

            setCarregandoEmail(false);

        }
    }


    // =========================
    // ALTERAR E-MAIL
    // =========================

    function editarEmail() {

        setEtapa(1);

        setErroCodigo('');

    }


    // =========================
    // ALTERAR CÓDIGO
    // =========================

    function handleCodigoChange(
        valor: string,
        index: number
    ) {

        const numero = valor.replace(/\D/g, '');

        if (!numero) {

            const novoCodigo = [...codigo];

            novoCodigo[index] = '';

            setCodigo(novoCodigo);

            return;
        }

        const novoCodigo = [...codigo];

        novoCodigo[index] = numero.slice(-1);

        setCodigo(novoCodigo);

        if (index < 5) {

            inputsRef.current[index + 1]?.focus();

        }
    }


    // =========================
    // BACKSPACE
    // =========================

    function handleCodigoKeyDown(
        event: React.KeyboardEvent<HTMLInputElement>,
        index: number
    ) {

        if (
            event.key === 'Backspace' &&
            codigo[index] === '' &&
            index > 0
        ) {

            inputsRef.current[index - 1]?.focus();

        }
    }


    // =========================
    // COLAR CÓDIGO
    // =========================

    function handleCodigoPaste(
        event: React.ClipboardEvent<HTMLInputElement>
    ) {

        event.preventDefault();

        const texto = event.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, 6);

        if (!texto) {
            return;
        }

        const novoCodigo = [
            '',
            '',
            '',
            '',
            '',
            ''
        ];

        texto.split('').forEach((numero, index) => {

            novoCodigo[index] = numero;

        });

        setCodigo(novoCodigo);

        const proximoCampo = Math.min(
            texto.length,
            5
        );

        inputsRef.current[proximoCampo]?.focus();
    }


    // =========================
    // VERIFICAR CÓDIGO
    // =========================

    async function handleVerificarCodigo(
        event: React.FormEvent
    ) {

        event.preventDefault();

        setErroCodigo('');

        const codigoCompleto = codigo.join('');

        if (codigoCompleto.length !== 6) {

            setErroCodigo(
                'Digite o código completo de 6 dígitos.'
            );

            return;
        }

        setCarregandoCodigo(true);

        try {

            const resposta = await fetch(
                'http://localhost:3000/api/recuperacao-senha/verificar-codigo',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                        codigo: codigoCompleto
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                setErroCodigo(
                    dados.message ||
                    'Código inválido.'
                );

                return;
            }

            setEtapa(3);

        } catch (error) {

            console.error(
                'Erro ao verificar código:',
                error
            );

            setErroCodigo(
                'Não foi possível conectar ao servidor.'
            );

        } finally {

            setCarregandoCodigo(false);

        }
    }


    // =========================
    // REENVIAR CÓDIGO
    // =========================

    async function handleReenviarCodigo() {

        if (tempo > 0) {
            return;
        }

        setErroCodigo('');

        try {

            const resposta = await fetch(
                'http://localhost:3000/api/recuperacao-senha/enviar-codigo',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email: email.trim()
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                setErroCodigo(
                    dados.message ||
                    'Não foi possível reenviar o código.'
                );

                return;
            }

            setCodigo([
                '',
                '',
                '',
                '',
                '',
                ''
            ]);

            setTempo(60);

            setTimeout(() => {

                inputsRef.current[0]?.focus();

            }, 100);

        } catch (error) {

            console.error(
                'Erro ao reenviar código:',
                error
            );

            setErroCodigo(
                'Não foi possível conectar ao servidor.'
            );
        }
    }


    // =========================
    // ALTERAR SENHA
    // =========================

    async function handleNovaSenha(
        event: React.FormEvent
    ) {

        event.preventDefault();

        setErroSenha('');

        // -------------------------
        // VALIDAÇÃO
        // -------------------------

        if (!novaSenha) {

            setErroSenha(
                'Digite uma nova senha.'
            );

            return;
        }

        if (novaSenha.length < 6) {

            setErroSenha(
                'A senha deve possuir pelo menos 6 caracteres.'
            );

            return;
        }

        if (!confirmarSenha) {

            setErroSenha(
                'Confirme sua nova senha.'
            );

            return;
        }

        if (novaSenha !== confirmarSenha) {

            setErroSenha(
                'As senhas não coincidem.'
            );

            return;
        }


        // -------------------------
        // CÓDIGO
        // -------------------------

        const codigoCompleto = codigo.join('');

        if (codigoCompleto.length !== 6) {

            setErroSenha(
                'Código de recuperação inválido.'
            );

            return;
        }


        setCarregandoSenha(true);


        try {

            // -------------------------
            // ENVIA PARA O BACKEND
            // -------------------------

            const resposta = await fetch(
                'http://localhost:3000/api/recuperacao-senha/nova-senha',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                        codigo: codigoCompleto,
                        novaSenha: novaSenha
                    })
                }
            );


            const dados = await resposta.json();


            // -------------------------
            // ERRO DO BACKEND
            // -------------------------

            if (!resposta.ok) {

                setErroSenha(
                    dados.message ||
                    'Não foi possível alterar a senha.'
                );

                return;
            }


            // -------------------------
            // SUCESSO
            // -------------------------

            setNovaSenha('');
            setConfirmarSenha('');

            setEtapa(4);

        } catch (error) {

            console.error(
                'Erro ao alterar senha:',
                error
            );

            setErroSenha(
                'Não foi possível conectar ao servidor.'
            );

        } finally {

            setCarregandoSenha(false);

        }
    }


    // =========================
    // RENDER
    // =========================

    return (
        <>
            <Header />

            <main className={styles.conteinerSenha}>

                <section className={styles.senha}>

                    {/* =========================
                        ETAPA 1
                    ========================= */}

                    {etapa === 1 && (

                        <>
                            <h2>
                                Esqueci minha senha
                            </h2>

                            <p className={styles.descricao}>
                                Digite o e-mail cadastrado na sua conta.
                                Enviaremos um código para você recuperar
                                sua senha.
                            </p>


                            <form
                                className={styles.formulario}
                                onSubmit={handleEnviarCodigo}
                            >

                                <div className={styles.campo}>

                                    <label htmlFor="email">
                                        E-mail
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Digite seu e-mail"
                                        autoComplete="email"
                                    />

                                </div>


                                {erroEmail && (

                                    <p className={styles.erro}>
                                        {erroEmail}
                                    </p>

                                )}


                                <button
                                    type="submit"
                                    className={styles.botaoAvancar}
                                    disabled={carregandoEmail}
                                >
                                    {carregandoEmail
                                        ? 'Enviando...'
                                        : 'Enviar código'
                                    }
                                </button>

                            </form>
                        </>
                    )}


                    {/* =========================
                        ETAPA 2
                    ========================= */}

                    {etapa === 2 && (

                        <>
                            <h2>
                                Verifique seu e-mail
                            </h2>


                            <p className={styles.descricao}>
                                Enviamos um código de 6 dígitos para:

                                <strong
                                    className={styles.emailUsuario}
                                >
                                    {email}
                                </strong>

                                <button
                                    type="button"
                                    className={styles.btnEditarEmail}
                                    onClick={editarEmail}
                                >
                                    Alterar e-mail
                                </button>
                            </p>


                            <form
                                className={styles.formulario}
                                onSubmit={handleVerificarCodigo}
                            >

                                <div
                                    className={
                                        styles.containerInputsOtp
                                    }
                                >

                                    {codigo.map(
                                        (valor, index) => (

                                            <input
                                                key={index}

                                                ref={(elemento) => {
                                                    inputsRef.current[index] =
                                                        elemento;
                                                }}

                                                className={
                                                    styles.inputQuadrado
                                                }

                                                type="text"

                                                inputMode="numeric"

                                                maxLength={1}

                                                value={valor}

                                                onChange={(event) =>
                                                    handleCodigoChange(
                                                        event.target.value,
                                                        index
                                                    )
                                                }

                                                onKeyDown={(event) =>
                                                    handleCodigoKeyDown(
                                                        event,
                                                        index
                                                    )
                                                }

                                                onPaste={
                                                    handleCodigoPaste
                                                }

                                                autoComplete={
                                                    index === 0
                                                        ? 'one-time-code'
                                                        : 'off'
                                                }
                                            />

                                        )
                                    )}

                                </div>


                                {erroCodigo && (

                                    <p className={styles.erro}>
                                        {erroCodigo}
                                    </p>

                                )}


                                <button
                                    type="submit"
                                    className={styles.botaoAvancar}
                                    disabled={carregandoCodigo}
                                >
                                    {carregandoCodigo
                                        ? 'Verificando...'
                                        : 'Verificar código'
                                    }
                                </button>


                                <div
                                    className={
                                        styles.containerReenviar
                                    }
                                >

                                    {tempo > 0 ? (

                                        <span
                                            className={
                                                styles.textoTimer
                                            }
                                        >
                                            Reenviar código em {tempo}s
                                        </span>

                                    ) : (

                                        <button
                                            type="button"
                                            className={
                                                styles.btnReenviarAtivo
                                            }
                                            onClick={
                                                handleReenviarCodigo
                                            }
                                        >
                                            Reenviar código
                                        </button>

                                    )}

                                </div>

                            </form>
                        </>
                    )}


                    {/* =========================
                        ETAPA 3
                    ========================= */}

                    {etapa === 3 && (

                        <>
                            <h2>
                                Crie uma nova senha
                            </h2>


                            <p className={styles.descricao}>
                                Digite sua nova senha abaixo.
                            </p>


                            <form
                                className={styles.formulario}
                                onSubmit={handleNovaSenha}
                            >

                                <div className={styles.campo}>

                                    <label htmlFor="novaSenha">
                                        Nova senha
                                    </label>

                                    <input
                                        id="novaSenha"
                                        type="password"
                                        value={novaSenha}
                                        onChange={(event) =>
                                            setNovaSenha(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Digite sua nova senha"
                                        autoComplete="new-password"
                                    />

                                </div>


                                <div className={styles.campo}>

                                    <label htmlFor="confirmarSenha">
                                        Confirmar nova senha
                                    </label>

                                    <input
                                        id="confirmarSenha"
                                        type="password"
                                        value={confirmarSenha}
                                        onChange={(event) =>
                                            setConfirmarSenha(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Digite novamente sua senha"
                                        autoComplete="new-password"
                                    />

                                </div>


                                {erroSenha && (

                                    <p className={styles.erro}>
                                        {erroSenha}
                                    </p>

                                )}


                                <button
                                    type="submit"
                                    className={styles.botaoAvancar}
                                    disabled={carregandoSenha}
                                >
                                    {carregandoSenha
                                        ? 'Alterando...'
                                        : 'Alterar senha'
                                    }
                                </button>

                            </form>
                        </>
                    )}


                    {/* =========================
                        ETAPA 4
                    ========================= */}

                    {etapa === 4 && (

                        <div className={styles.sucessoSenha}>

                            <div className={styles.iconeSucesso}>
                                ✓
                            </div>


                            <h2>
                                Senha alterada com sucesso!
                            </h2>


                            <p className={styles.descricao}>
                                Sua senha foi alterada com sucesso.
                                Agora você já pode acessar sua conta
                                utilizando sua nova senha.
                            </p>


                            <button
                                type="button"
                                className={styles.botaoAvancar}
                                onClick={() =>
                                    navigate('/login_comercial')
                                }
                            >
                                Ir para o login
                            </button>

                        </div>
                    )}

                </section>

            </main>

            <Footer />
        </>
    );
}
