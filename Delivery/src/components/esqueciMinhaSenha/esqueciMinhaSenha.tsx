import { useState, useEffect, useRef } from 'react';
import styles from './esqueciMinhaSenha.module.css';

import { Header } from '../../components/Header/header';
import { Footer } from '../../components/Footer/footer';

export function EsqueciMinhaSenha() {
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');

  // Estado para os 4 dígitos do código OTP
  const [codigo, setCodigo] = useState(['', '', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Estado do Temporizador (60 segundos)
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Efeito do Cronômetro quando está na Etapa 2
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (etapa === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [etapa, timer]);

  // Avançar da Etapa 1 para a Etapa 2
  const handleAvancarEtapa1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEtapa(2);
    setTimer(60);
    setCanResend(false);
  };

  // Lógica dos inputs numéricos (pulo automático + backspace)
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Aceita apenas números

    const newCodigo = [...codigo];
    newCodigo[index] = value.slice(-1); // Pega apenas o último caractere
    setCodigo(newCodigo);

    // Pula para o próximo input se preenchido
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Volta para o input anterior ao apertar Backspace em campo vazio
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Reenviar o código de e-mail
  const handleResendEmail = () => {
    if (!canResend) return;
    console.log('Reenviando código para:', email);
    setCodigo(['', '', '', '']);
    setTimer(60);
    setCanResend(false);
    inputRefs[0].current?.focus();
  };

  // Submeter verificação na Etapa 2
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const codigoCompleto = codigo.join('');
    if (codigoCompleto.length < 4) {
      alert('Por favor, preencha o código completo de 4 dígitos.');
      return;
    }
    console.log('Código verificado com sucesso:', codigoCompleto);
    // Próximo passo: Redirecionar para criação de nova senha ou salvar
  };

  return (
    <>
      <Header />

      <div className={styles.conteinerSenha}>
        <div className={styles.senha}>
          
          {/* =========================================
              ETAPA 1: DIGITAR E-MAIL
          ========================================= */}
          {etapa === 1 ? (
            <>
              <h2>Recuperação de Senha</h2>
              <p className={styles.descricao}>
                Digite seu e-mail cadastrado para receber o código de verificação.
              </p>

              <form onSubmit={handleAvancarEtapa1} className={styles.formulario}>
                <div className={styles.campo}>
                  <label htmlFor="email">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className={styles.botaoAvancar}>
                  Avançar
                </button>
              </form>
            </>
          ) : (
            
            /* =========================================
               ETAPA 2: DIGITAR CÓDIGO DE 4 DÍGITOS
            ========================================= */
            <>
              <h2>Digite o Código</h2>
              <p className={styles.descricao}>
                Código enviado por e-mail para: <br />
                <strong>{email}</strong>{' '}
                <button
                  type="button"
                  className={styles.btnEditarEmail}
                  onClick={() => setEtapa(1)}
                >
                  (Editar)
                </button>
              </p>

              <form onSubmit={handleVerifyCode} className={styles.formulario}>
                {/* 4 Quadrados para os Dígitos */}
                <div className={styles.containerInputsOtp}>
                  {codigo.map((digit, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={styles.inputQuadrado}
                    />
                  ))}
                </div>

                {/* Botão de Verificar */}
                <button type="submit" className={styles.botaoAvancar}>
                  Verificar Código
                </button>

                {/* Temporizador / Reenviar */}
                <div className={styles.containerReenviar}>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendEmail}
                      className={styles.btnReenviarAtivo}
                    >
                      Reenviar e-mail
                    </button>
                  ) : (
                    <span className={styles.textoTimer}>
                      Reenviar e-mail em <strong>{timer}s</strong>
                    </span>
                  )}
                </div>
              </form>
            </>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}