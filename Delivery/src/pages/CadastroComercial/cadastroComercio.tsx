import { useState } from 'react';
import styles from './cadastroComercio.module.css';
import { Header } from '../../components/Header/header';
import lojaIMG from '../../assets/cadastroComercio/loja.png';
import emailIcon from '../../assets/email.png';
import cozinheira from '../../assets/telacadastro.png';
import saibaMaisImg from "../../assets/cadastroComercio/saibaMais.svg";

type CadastroComercioProps = {
  children?: React.ReactNode;
};

export function CadastroComercial({ children }: CadastroComercioProps) {
  const [etapa, setEtapa] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erroApi, setErroApi] = useState('');

  const [formData, setFormData] = useState({
    nome: '', // Nome do Responsável
    cnpj: '',
    telefone: '',
    email: '',
    senha: '',
    senhaConfirmar: '',
  });

  // Função para formatar CNPJ (00.000.000/0000-00)
  const formatarCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  // Função para formatar Telefone ((00) 00000-0000)
  const formatarTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErroApi(''); // Limpa mensagens de erro ao digitar

    if (name === 'cnpj') {
      setFormData({ ...formData, cnpj: formatarCNPJ(value) });
    } else if (name === 'telefone') {
      setFormData({ ...formData, telefone: formatarTelefone(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const proximaEtapa = () => {
    if (!formData.nome.trim()) {
      alert('Por favor, preencha o Nome do Responsável.');
      return;
    }
    if (formData.cnpj.length < 18) {
      alert('Por favor, digite um CNPJ válido e completo.');
      return;
    }
    if (formData.telefone.length < 14) {
      alert('Por favor, digite um Telefone válido.');
      return;
    }

    setEtapa((prev) => prev + 1);
  };

  const etapaAnterior = () => {
    setErroApi('');
    setEtapa((prev) => prev - 1);
  };

  // ================================================================
  // INTEGRAÇÃO COM O BACKEND (SUBMIT)
  // ================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroApi('');

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
      // Ajuste a URL de acordo com a porta/rota do seu servidor Node.js
      const resposta = await fetch('http://localhost:3000/api/comercios/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome_responsavel: formData.nome,
          cnpj: formData.cnpj,
          telefone: formData.telefone,
          email: formData.email,
          senha: formData.senha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.message || dados.error || 'Erro ao realizar cadastro.');
      }

      // Sucesso: Avança para a Etapa 3 (Agradecimento)
      setEtapa(3);

    } catch (error: any) {
      setErroApi(error.message || 'Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  const primeiroNome = formData.nome.trim().split(' ')[0];

  return (
    <div className={styles.paginaWrapper}>
      <Header />

      {/* 1. CONTAINER DAS COLUNAS (LADO A LADO) */}
      <div className={styles.loginContainer}>

        {/* LADO ESQUERDO DA TELA */}
        <div className={styles.loginContainerEsquerda}>
          <img
            src={cozinheira}
            alt="Cozinheira"
            className={styles.cozinheira}
          />

          <a href="#planos" className={styles.saibaMaisContainer}>
            <img
              src={saibaMaisImg}
              alt="Saiba Mais"
              className={styles.saibaMaisImg}
            />
          </a>
        </div>

        {/* LADO DIREITO DA TELA */}
        <div className={styles.loginContainerDireita}>
          <div className={styles.login}>
            <div className={styles.loginTopo}>
              <img
                src={lojaIMG}
                alt="Loja"
                className={styles.lojaIMG}
              />
              <h1>Cadastro De Comércio</h1>
            </div>

            <div className={styles.loginConteudo}>

              {/* MENSAGEM DE ERRO DO BACKEND */}
              {erroApi && (
                <div style={{ color: '#d32f2f', backgroundColor: '#fde8e8', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>
                  {erroApi}
                </div>
              )}

              {/* ETAPA 1 */}
              {etapa === 1 && (
                <form className={styles.formCadastro}>
                  <div className={styles.campo}>
                    <label htmlFor="nome">Nome do Proprietário/Responsável</label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      placeholder="Digite seu nome completo"
                      value={formData.nome}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.campo}>
                    <label htmlFor="cnpj">CNPJ</label>
                    <input
                      type="text"
                      id="cnpj"
                      name="cnpj"
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      value={formData.cnpj}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.campo}>
                    <label htmlFor="telefone">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      id="telefone"
                      name="telefone"
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      value={formData.telefone}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={proximaEtapa}
                    className={styles.botaoCadastrar}
                  >
                    Próximo
                  </button>
                </form>
              )}

              {/* ETAPA 2 */}
              {etapa === 2 && (
                <form className={styles.formCadastro} onSubmit={handleSubmit}>
                  <div className={styles.campo}>
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="seuemail@comercio.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.campo}>
                    <label htmlFor="senha">Senha</label>
                    <input
                      type="password"
                      id="senha"
                      name="senha"
                      placeholder="Digite sua senha"
                      value={formData.senha}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.campo}>
                    <label htmlFor="senhaConfirmar">Confirme sua Senha</label>
                    <input
                      type="password"
                      id="senhaConfirmar"
                      name="senhaConfirmar"
                      placeholder="Confirme sua senha"
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
                      {carregando ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                  </div>
                </form>
              )}

              {/* ETAPA 3: MENSAGEM DE AGRADECIMENTO */}
              {etapa === 3 && (
                <div className={styles.sucessoContainer}>
                  <h2 className={styles.sucessoTitulo}>
                    Obrigado, {primeiroNome}!
                  </h2>
                  <p className={styles.sucessoTexto}>
                    Por mostrar interesse em cadastrar seu comércio em nossa plataforma.
                  </p>
                  <p className={styles.sucessoSubtexto}>
                    Seu cadastro está sendo analisado. Verifique o seu e-mail para acompanhar o retorno.
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

      </div> 
      {/* FECHAMENTO DA DIV loginContainer */}

      {/* 2. CONTAINER INDEPENDENTE (Abaixo do bloco principal) */}
      <div id="planos" className={styles.informacaoConteiner}>
        <h2>Informações e Planos</h2>
        <p>Conteúdo da nova seção que aparece ao rolar a página para baixo.</p>
      </div>

      {children}
    </div>
  );
}