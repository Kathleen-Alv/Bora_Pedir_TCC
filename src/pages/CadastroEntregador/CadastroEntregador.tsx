import { useState } from 'react';
import styles from './CadastroEntregador.module.css';
import { Header } from '../../components/Header/header';
import capaceteIcon from '../../assets/capacete.svg';
import emailIcon from '../../assets/email.png';

type CadastroEntregadorProps = {
  children?: React.ReactNode;
};

export function CadastroEntregador({ children }: CadastroEntregadorProps) {
  const [etapa, setEtapa] = useState(1);
  const [carregando, setCarregando] = useState(false);

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

  // =========================
  // FORMATAÇÕES
  // =========================

  const formatarCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatarCelular = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatarCNH = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 11);
  };

  const formatarPlaca = (value: string) => {
    return value
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 7);
  };

  // =========================
  // VALIDAÇÃO DE IDADE
  // =========================

  const validarMaioridade = (dataNascimentoStr: string): boolean => {
    const dataNasc = new Date(dataNascimentoStr);
    const hoje = new Date();

    let idade = hoje.getFullYear() - dataNasc.getFullYear();

    const mes = hoje.getMonth() - dataNasc.getMonth();

    if (
      mes < 0 ||
      (mes === 0 && hoje.getDate() < dataNasc.getDate())
    ) {
      idade--;
    }

    return idade >= 18;
  };

  // =========================
  // ALTERAÇÃO DOS CAMPOS
  // =========================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'cpf') {
      setFormData({
        ...formData,
        cpf: formatarCPF(value),
      });

    } else if (name === 'celular') {
      setFormData({
        ...formData,
        celular: formatarCelular(value),
      });

    } else if (name === 'cnh') {
      setFormData({
        ...formData,
        cnh: formatarCNH(value),
      });

    } else if (name === 'placa') {
      setFormData({
        ...formData,
        placa: formatarPlaca(value),
      });

    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // =========================
  // PRÓXIMA ETAPA
  // =========================

  const proximaEtapa = () => {
    if (!formData.nome.trim()) {
      alert('Por favor, preencha o seu Nome.');
      return;
    }

    if (formData.cpf.length < 14) {
      alert('Por favor, digite um CPF válido.');
      return;
    }

    if (formData.celular.length < 15) {
      alert(
        'Por favor, digite um número de Celular/WhatsApp válido.'
      );
      return;
    }

    if (!formData.dataNascimento) {
      alert('Por favor, informe sua Data de Nascimento.');
      return;
    }

    if (!validarMaioridade(formData.dataNascimento)) {
      alert(
        'É necessário ter pelo menos 18 anos para se cadastrar como entregador.'
      );
      return;
    }

    if (formData.cnh.length < 11) {
      alert('A CNH deve conter 11 dígitos.');
      return;
    }

    setEtapa((prev) => prev + 1);
  };

  // =========================
  // ETAPA ANTERIOR
  // =========================

  const etapaAnterior = () => {
    setEtapa((prev) => prev - 1);
  };

  // =========================
  // ENVIO DO CADASTRO
  // =========================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    // Validação da placa
    if (!formData.placa.trim()) {
      alert('Por favor, informe a Placa da Moto.');
      return;
    }

    if (formData.placa.length !== 7) {
      alert('A placa deve conter exatamente 7 caracteres.');
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

    if (formData.senha !== formData.senhaConfirmar) {
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

            // A placa já chega aqui com no máximo 7 caracteres
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

  // =========================
  // PRIMEIRO NOME
  // =========================

  const primeiroNome =
    formData.nome.trim().split(' ')[0];

  // =========================
  // HTML
  // =========================

  return (
    <>
      <Header />

      <div className={styles.loginContainer}>

        {/* LADO ESQUERDO */}
        <div
          className={styles.loginContainerEsquerda}
        >
        </div>

        {/* LADO DIREITO */}
        <div
          className={styles.loginContainerDireita}
        >
          <div className={styles.login}>

            {/* TOPO */}
            <div className={styles.loginTopo}>

              <img
                src={capaceteIcon}
                alt="Capacete"
                className={styles.capacete}
              />

              <h1>
                Cadastro de Entregador
              </h1>

            </div>

            {/* CONTEÚDO */}
            <div className={styles.loginConteudo}>

              {/* =========================
                  ETAPA 1
              ========================= */}

              {etapa === 1 && (
                <form
                  className={styles.formCadastro}
                >

                  {/* NOME */}
                  <div className={styles.campo}>
                    <label htmlFor="nome">
                      Digite seu Nome
                    </label>

                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                    />
                  </div>

                  {/* CPF */}
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
                      value={formData.cpf}
                      onChange={handleChange}
                    />
                  </div>

                  {/* CELULAR */}
                  <div className={styles.campo}>
                    <label htmlFor="celular">
                      Celular / WhatsApp
                    </label>

                    <input
                      type="text"
                      id="celular"
                      name="celular"
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      value={formData.celular}
                      onChange={handleChange}
                    />
                  </div>

                  {/* DATA DE NASCIMENTO */}
                  <div className={styles.campo}>
                    <label htmlFor="dataNascimento">
                      Data de nascimento
                    </label>

                    <input
                      type="date"
                      id="dataNascimento"
                      name="dataNascimento"
                      value={
                        formData.dataNascimento
                      }
                      onChange={handleChange}
                    />
                  </div>

                  {/* CNH */}
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
                      value={formData.cnh}
                      onChange={handleChange}
                    />
                  </div>

                  {/* BOTÃO */}
                  <button
                    type="button"
                    onClick={proximaEtapa}
                    className={
                      styles.botaoCadastrar
                    }
                  >
                    Próximo
                  </button>

                </form>
              )}

              {/* =========================
                  ETAPA 2
              ========================= */}

              {etapa === 2 && (
                <form
                  className={styles.formCadastro}
                  onSubmit={handleSubmit}
                >

                  {/* PLACA */}
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
                      value={formData.placa}
                      onChange={handleChange}
                    />

                  </div>

                  {/* EMAIL */}
                  <div className={styles.campo}>

                    <label htmlFor="email">
                      Email
                    </label>

                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="seuemail@exemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                    />

                  </div>

                  {/* SENHA */}
                  <div className={styles.campo}>

                    <label htmlFor="senha">
                      Senha
                    </label>

                    <input
                      type="password"
                      id="senha"
                      name="senha"
                      placeholder="Digite sua senha"
                      value={formData.senha}
                      onChange={handleChange}
                    />

                  </div>

                  {/* CONFIRMAR SENHA */}
                  <div className={styles.campo}>

                    <label htmlFor="senhaConfirmar">
                      Confirme sua Senha
                    </label>

                    <input
                      type="password"
                      id="senhaConfirmar"
                      name="senhaConfirmar"
                      placeholder="Confirme sua senha"
                      value={
                        formData.senhaConfirmar
                      }
                      onChange={handleChange}
                    />

                  </div>

                  {/* AÇÕES */}
                  <div className={styles.acoes}>

                    <button
                      type="button"
                      onClick={etapaAnterior}
                      className={
                        styles.botaoVoltar
                      }
                      disabled={carregando}
                    >
                      Voltar
                    </button>

                    <button
                      type="submit"
                      className={
                        styles.botaoCadastrar
                      }
                      disabled={carregando}
                    >
                      {carregando
                        ? 'Cadastrando...'
                        : 'Cadastrar'}
                    </button>

                  </div>

                </form>
              )}

              {/* =========================
                  ETAPA 3
              ========================= */}

              {etapa === 3 && (
                <div
                  className={
                    styles.sucessoContainer
                  }
                >

                  <h2
                    className={
                      styles.sucessoTitulo
                    }
                  >
                    Obrigado, {primeiroNome}!
                  </h2>

                  <p
                    className={
                      styles.sucessoTexto
                    }
                  >
                    Por mostrar interesse em
                    operar por nossa plataforma.
                  </p>

                  <p
                    className={
                      styles.sucessoSubtexto
                    }
                  >
                    Seu cadastro está sendo
                    analisado. Verifique o seu
                    e-mail para acompanhar o
                    retorno.
                  </p>

                  <img
                    src={emailIcon}
                    alt="E-mail"
                    className={styles.emailImg}
                  />

                </div>
              )}

            </div>
          </div>
        </div>

        {children}

      </div>
    </>
  );
}