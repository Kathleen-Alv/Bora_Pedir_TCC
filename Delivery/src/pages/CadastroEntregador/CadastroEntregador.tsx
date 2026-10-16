
import { useState, useEffect } from 'react';

import styles from './CadastroEntregador.module.css';

import { Header } from '../../components/Header/header';

import capaceteIcon from '../../assets/capacete.svg';
import emailIcon from '../../assets/email.png';
import entregadorCadastro from '../../assets/cadastroEntregador/entregador.png';

type CadastroEntregadorProps = {
  children?: React.ReactNode;
};

export function CadastroEntregador({
  children,
}: CadastroEntregadorProps) {
  // ================================================================
  // CONTROLE DAS ETAPAS
  // ================================================================

  const [etapa, setEtapa] = useState(1);
  const [carregando, setCarregando] = useState(false);

  // ================================================================
  // DADOS DO FORMULÁRIO
  // ================================================================

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    celular: '',
    cnh: '',
    dataNascimento: '',
    placa: '',
    email: '',
    senha: '',
    senhaConfirmar: '',
  });

  // ================================================================
  // FORMATAÇÃO DO CPF
  // ================================================================

  const formatarCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // ================================================================
  // FORMATAÇÃO DO CELULAR
  // ================================================================

  const formatarCelular = (value: string) => {
    const numeros = value.replace(/\D/g, '').slice(0, 11);

    if (numeros.length <= 2) {
      return numeros.length ? `(${numeros}` : '';
    }

    if (numeros.length <= 7) {
      return numeros.replace(/^(\d{2})(\d+)/, '($1) $2');
    }

    return numeros
      .replace(
        /^(\d{2})(\d{5})(\d{1,4})$/,
        '($1) $2-$3'
      )
      .replace(
        /^(\d{2})(\d{4})(\d+)$/,
        '($1) $2-$3'
      );
  };

  // ================================================================
  // FORMATAÇÃO DA CNH
  // ================================================================

  const formatarCNH = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 11);
  };

  // ================================================================
  // FORMATAÇÃO DA PLACA
  // ================================================================

  const formatarPlaca = (value: string) => {
    return value
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 7);
  };

  // ================================================================
  // VALIDAÇÃO DE IDADE
  // ================================================================

  const validarMaioridade = (
    dataNascimentoStr: string
  ): boolean => {
    const dataNasc = new Date(
      `${dataNascimentoStr}T00:00:00`
    );

    const hoje = new Date();

    if (
      Number.isNaN(dataNasc.getTime()) ||
      dataNasc > hoje
    ) {
      return false;
    }

    let idade =
      hoje.getFullYear() - dataNasc.getFullYear();

    const mes =
      hoje.getMonth() - dataNasc.getMonth();

    if (
      mes < 0 ||
      (mes === 0 &&
        hoje.getDate() < dataNasc.getDate())
    ) {
      idade--;
    }

    return idade >= 18;
  };

  // ================================================================
  // ALTERAÇÃO DOS CAMPOS
  // ================================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    let valorFormatado = value;

    if (name === 'cpf') {
      valorFormatado = formatarCPF(value);
    } else if (name === 'celular') {
      valorFormatado = formatarCelular(value);
    } else if (name === 'cnh') {
      valorFormatado = formatarCNH(value);
    } else if (name === 'placa') {
      valorFormatado = formatarPlaca(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: valorFormatado,
    }));
  };

  // ================================================================
  // PRÓXIMA ETAPA
  // ================================================================

  const proximaEtapa = () => {
    if (!formData.nome.trim()) {
      alert('Por favor, preencha o seu Nome.');
      return;
    }

    if (formData.cpf.length !== 14) {
      alert('Por favor, digite um CPF válido.');
      return;
    }

    if (
      formData.celular.replace(/\D/g, '').length < 10
    ) {
      alert(
        'Por favor, digite um número de Celular/WhatsApp válido.'
      );
      return;
    }

    if (!formData.dataNascimento) {
      alert(
        'Por favor, informe sua Data de Nascimento.'
      );
      return;
    }

    if (!validarMaioridade(formData.dataNascimento)) {
      alert(
        'É necessário ter pelo menos 18 anos para se cadastrar como entregador.'
      );
      return;
    }

    if (formData.cnh.length !== 11) {
      alert('A CNH deve conter 11 dígitos.');
      return;
    }

    setEtapa((prev) => prev + 1);
  };

  // ================================================================
  // ETAPA ANTERIOR
  // ================================================================

  const etapaAnterior = () => {
    setEtapa((prev) => prev - 1);
  };

  // ================================================================
  // ENVIO DO CADASTRO
  // ================================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!formData.placa.trim()) {
      alert('Por favor, informe a Placa da Moto.');
      return;
    }

    if (formData.placa.length !== 7) {
      alert(
        'A placa deve conter exatamente 7 caracteres.'
      );
      return;
    }

    if (!formData.email.trim()) {
      alert('Por favor, informe o seu Email.');
      return;
    }

    if (!formData.senha) {
      alert('Por favor, digite uma Senha.');
      return;
    }

    if (
      formData.senha !== formData.senhaConfirmar
    ) {
      alert('As senhas não coincidem!');
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch(
        'http://localhost:3000/api/entregadores/cadastro',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: formData.nome,
            cpf: formData.cpf,
            celular: formData.celular,
            cnh: formData.cnh,
            dataNascimento: formData.dataNascimento,
            placa: formData.placa,
            email: formData.email,
            senha: formData.senha,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            'Erro ao realizar o cadastro.'
        );
        return;
      }

      setEtapa(3);
    } catch (error) {
      console.error(
        'Erro ao comunicar com o servidor:',
        error
      );

      alert(
        'Não foi possível conectar ao servidor backend.'
      );
    } finally {
      setCarregando(false);
    }
  };

  // ================================================================
  // PRIMEIRO NOME
  // ================================================================

  const primeiroNome =
    formData.nome.trim().split(' ')[0];

  // ================================================================
  // JSX
  // ================================================================

  return (
    <div className={styles.paginaWrapper}>
      <Header />

      {/* CONTAINER PRINCIPAL */}

      <div className={styles.loginContainer}>
        {/* ========================================================
            FUNDO COM A IMAGEM DO ENTREGADOR
        ======================================================== */}

        <div
          className={styles.loginContainerEsquerda}
          style={{
            backgroundImage: `url("${entregadorCadastro}")`,
          }}
          aria-hidden="true"
        />

        {/* ========================================================
            TEXTO PROMOCIONAL
        ======================================================== */}

        <div className={styles.textoPromocional}>
          <div className={styles.mensagensPromocionais}>
            <div className={styles.mensagemPromocional}>
              <h2>Faça parte da Bora Pedir</h2>

              <p>
                Entregue pedidos, conquiste clientes e tenha
                uma nova oportunidade de renda.
              </p>
            </div>

            <div className={styles.mensagemPromocional}>
              <h2>Sua moto. Seus horários.</h2>

              <p>
                Cadastre-se como entregador e faça parte da
                nossa rede de parceiros.
              </p>
            </div>
          </div>

          <a
            href="#cadastroEntregador"
            className={styles.saibaMais}
          >
            <span>Saiba mais</span>

            <span className={styles.setaSaibaMais}>
              ↓
            </span>
          </a>
        </div>

        {/* ========================================================
            LADO DIREITO — CADASTRO
        ======================================================== */}

        <div
          id="cadastroEntregador"
          className={styles.loginContainerDireita}
        >
          <div className={styles.login}>
            {/* TOPO */}

            <div className={styles.loginTopo}>
              <img
                src={capaceteIcon}
                alt="Capacete"
                className={styles.lojaIMG}
                draggable={false}
              />

              <h1>Cadastro de Entregador</h1>
            </div>

            {/* CONTEÚDO */}

            <div className={styles.loginConteudo}>
              {/* ==================================================
                  ETAPA 1
              ================================================== */}

              {etapa === 1 && (
                <form
                  className={styles.formCadastro}
                  onSubmit={(e) => {
                    e.preventDefault();
                    proximaEtapa();
                  }}
                >
                  <div className={styles.campo}>
                    <label htmlFor="nome">
                      Digite seu Nome
                    </label>

                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      autoComplete="name"
                      value={formData.nome}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.campo}>
                    <label htmlFor="cpf">
                      Digite seu CPF
                    </label>

                    <input
                      type="text"
                      id="cpf"
                      name="cpf"
                      placeholder="000.000.000-00"
                      maxLength={14}
                      inputMode="numeric"
                      value={formData.cpf}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.campo}>
                    <label htmlFor="celular">
                      Celular / WhatsApp
                    </label>

                    <input
                      type="tel"
                      id="celular"
                      name="celular"
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      autoComplete="tel"
                      value={formData.celular}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.campo}>
                    <label htmlFor="dataNascimento">
                      Data de nascimento
                    </label>

                    <input
                      type="date"
                      id="dataNascimento"
                      name="dataNascimento"
                      autoComplete="bday"
                      value={formData.dataNascimento}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.campo}>
                    <label htmlFor="cnh">
                      Digite sua CNH
                    </label>

                    <input
                      type="text"
                      id="cnh"
                      name="cnh"
                      placeholder="Digite os 11 números"
                      maxLength={11}
                      inputMode="numeric"
                      value={formData.cnh}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.botaoCadastrar}
                  >
                    Próximo
                  </button>
                </form>
              )}

              {/* ==================================================
                  ETAPA 2
              ================================================== */}

              {etapa === 2 && (
                <form
                  className={styles.formCadastro}
                  onSubmit={handleSubmit}
                >
                  <div className={styles.campo}>
                    <label htmlFor="placa">
                      Placa da Moto
                    </label>

                    <input
                      type="text"
                      id="placa"
                      name="placa"
                      placeholder="Ex: ABC1D23"
                      maxLength={7}
                      autoCapitalize="characters"
                      value={formData.placa}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.campo}>
                    <label htmlFor="email">
                      Email
                    </label>

                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="seuemail@exemplo.com"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.campo}>
                    <label htmlFor="senha">
                      Senha
                    </label>

                    <input
                      type="password"
                      id="senha"
                      name="senha"
                      placeholder="Digite sua senha"
                      autoComplete="new-password"
                      value={formData.senha}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.campo}>
                    <label htmlFor="senhaConfirmar">
                      Confirme sua Senha
                    </label>

                    <input
                      type="password"
                      id="senhaConfirmar"
                      name="senhaConfirmar"
                      placeholder="Confirme sua senha"
                      autoComplete="new-password"
                      value={formData.senhaConfirmar}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.acoes}>
                    <button
                      type="button"
                      onClick={etapaAnterior}
                      className={styles.botaoVoltar}
                      disabled={carregando}
                    >
                      Voltar
                    </button>

                    <button
                      type="submit"
                      className={styles.botaoCadastrar}
                      disabled={carregando}
                    >
                      {carregando
                        ? 'Cadastrando...'
                        : 'Cadastrar'}
                    </button>
                  </div>
                </form>
              )}

              {/* ==================================================
                  ETAPA 3 — SUCESSO
              ================================================== */}

              {etapa === 3 && (
                <div className={styles.sucessoContainer}>
                  <h2 className={styles.sucessoTitulo}>
                    Obrigado, {primeiroNome}!
                  </h2>

                  <p className={styles.sucessoTexto}>
                    Por mostrar interesse em operar por nossa
                    plataforma.
                  </p>

                  <p className={styles.sucessoSubtexto}>
                    Seu cadastro está sendo analisado.
                    Verifique o seu e-mail para acompanhar
                    o retorno.
                  </p>

                  <img
                    src={emailIcon}
                    alt="E-mail"
                    className={styles.emailImg}
                    draggable={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
