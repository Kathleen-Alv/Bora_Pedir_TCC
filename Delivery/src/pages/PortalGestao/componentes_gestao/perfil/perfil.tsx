import { useEffect, useState } from "react";
import styles from "./perfil.module.css";

import categoria from "../../../../assets/perfil/categoria.png";
import editar from "../../../../assets/perfil/editar.png";
import editar_foto from "../../../../assets/perfil/editar_foto.png";
import endereco from "../../../../assets/perfil/endereco.png";
import estrelas from "../../../../assets/perfil/estrelas.png";
import horario from "../../../../assets/perfil/horario.png";
import bannerDadosBancarios from "../../../../assets/perfil/bannerDadosBancarios.png";
import imagemInformacaoConta from "../../../../assets/perfil/informaçãoDaConta.png";

// ========================================================
// CONFIGURAÇÃO DA API
// ========================================================

const API_URL = "http://localhost:3000";

// ========================================================
// TIPAGENS
// ========================================================

interface PerfilComercio {
  comercio_id: number;
  nome_comercio: string | null;
  nome_responsavel: string;
  email: string;
  telefone: string;
  cnpj: string;
  situacao_cadastral: string;
  criado_em: string;
  categoria: string | null;
  logo: string | null;
  banner: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  banco: string | null;
  agencia: string | null;
  conta: string | null;
  tipo_conta: string | null;
}

interface RespostaPerfil {
  sucesso?: boolean;
  mensagem?: string;
  perfil?: PerfilComercio;
}

// ========================================================
// FUNÇÕES AUXILIARES
// ========================================================

function obterUrlImagem(caminho: string | null): string | null {
  if (!caminho?.trim()) {
    return null;
  }

  if (/^https?:\/\//i.test(caminho)) {
    return caminho;
  }

  return `${API_URL}/${caminho.replace(/^\/+/, "")}`;
}

function formatarData(
  data: string | null | undefined
): string {
  if (!data) {
    return "Não informada";
  }

  const dataValida = new Date(data);

  if (Number.isNaN(dataValida.getTime())) {
    return "Não informada";
  }

  return dataValida.toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
}

function obterSituacao(situacao: string): string {
  const situacoes: Record<string, string> = {
    APROVADO: "Aprovada",
    PENDENTE: "Pendente",
    SUSPENSO: "Suspensa",
    INATIVO: "Inativa",
  };

  return situacoes[situacao] || situacao || "Não informada";
}

// ========================================================
// COMPONENTES DE ÍCONES
// ========================================================

function EditarImg() {
  return (
    <img
      src={editar}
      className={styles.imgDeIcone}
      alt="Editar"
      title="Editar"
      draggable={false}
    />
  );
}

function EnderecoIcon() {
  return (
    <img
      src={endereco}
      className={styles.imgDeIcone}
      alt="Endereço"
      draggable={false}
    />
  );
}

function HorarioIcon() {
  return (
    <img
      src={horario}
      className={styles.imgDeIcone}
      alt="Horário"
      draggable={false}
    />
  );
}

function CategoriaIcon() {
  return (
    <img
      src={categoria}
      className={styles.imgDeIcone}
      alt="Categoria"
      draggable={false}
    />
  );
}

function EstrelasIcon() {
  return (
    <img
      src={estrelas}
      className={styles.imgDeIcone}
      alt="Avaliação"
      draggable={false}
    />
  );
}

function EditarFotoIcon() {
  return (
    <img
      src={editar_foto}
      className={styles.imgDeIcone}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}

// ========================================================
// BANNERS ESTÁTICOS
// ========================================================

function BannerDadosBancarios() {
  return (
    <img
      src={bannerDadosBancarios}
      className={styles.bannerDadosBancarios}
      alt="Banner de dados bancários"
      draggable={false}
    />
  );
}

function ImagemInformacaoConta() {
  return (
    <img
      src={imagemInformacaoConta}
      className={styles.imagemInformacaoConta}
      alt="Banner de informações da conta"
      draggable={false}
    />
  );
}

// ========================================================
// PERFIL DO COMÉRCIO
// ========================================================

export function Perfil() {
  const [perfil, setPerfil] = useState<PerfilComercio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // ======================================================
  // BUSCAR DADOS DO PERFIL
  // ======================================================

  useEffect(() => {
    const controller = new AbortController();

    async function buscarPerfil() {
      try {
        setCarregando(true);
        setErro("");

        const token = localStorage.getItem("token");

        if (!token) {
          setErro("Sua sessão expirou. Faça login novamente.");
          return;
        }

        const resposta = await fetch(`${API_URL}/api/perfil`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        const dados = (await resposta.json()) as RespostaPerfil;

        if (!resposta.ok) {
          throw new Error(
            dados.mensagem ||
              "Não foi possível carregar o perfil."
          );
        }

        if (!dados.perfil) {
          throw new Error(
            "A API não retornou os dados do perfil."
          );
        }

        setPerfil(dados.perfil);
      } catch (erro: unknown) {
        if (
          erro instanceof Error &&
          erro.name === "AbortError"
        ) {
          return;
        }

        setErro(
          erro instanceof Error
            ? erro.message
            : "Erro inesperado ao carregar o perfil."
        );
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    void buscarPerfil();

    return () => controller.abort();
  }, []);

  // ======================================================
  // AÇÕES DOS BOTÕES
  // ======================================================

  function handleAlterarInformacoes() {
    // O formulário de alteração será implementado
    // separadamente.
  }

  function handleAlterarLogo() {
    // A seleção e o envio da nova logo serão implementados
    // separadamente.
  }

  function handleAlterarBanner() {
    // A seleção e o envio do novo banner serão implementados
    // separadamente.
  }

  function handleExcluirConta() {
    const confirmar = window.confirm(
      "Deseja realmente solicitar a exclusão da sua conta?"
    );

    if (!confirmar) {
      return;
    }

    window.alert(
      "A exclusão ainda não está implementada. Nenhum dado foi excluído."
    );
  }

  // ======================================================
  // ESTADO DE CARREGAMENTO
  // ======================================================

  if (carregando) {
    return (
      <main className={styles.page} aria-live="polite">
        Carregando perfil...
      </main>
    );
  }

  if (erro) {
    return (
      <main className={styles.page}>
        <p role="alert">{erro}</p>

        <button
          type="button"
          className={styles.botaoAlterarInformacoes}
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </main>
    );
  }

  if (!perfil) {
    return (
      <main className={styles.page}>
        Perfil não encontrado.
      </main>
    );
  }

  // ======================================================
  // DADOS FORMATADOS
  // ======================================================

  const logoUrl = obterUrlImagem(perfil.logo);
  const bannerUrl = obterUrlImagem(perfil.banner);

  const enderecoCompleto = [
    perfil.endereco,
    perfil.numero,
    perfil.complemento,
    perfil.bairro,
    perfil.cidade,
    perfil.estado,
  ]
    .filter(Boolean)
    .join(", ");

  const nomeComercio =
    perfil.nome_comercio || "Estabelecimento";

  const situacao = obterSituacao(
    perfil.situacao_cadastral
  );

  // ======================================================
  // INTERFACE
  // ======================================================

  return (
    <main className={styles.page}>
      <div className={styles.profileContainer}>
        {/* BANNER E LOGO DO COMÉRCIO */}

        <section className={styles.header}>
          {bannerUrl ? (
            <img
              src={bannerUrl}
              className={styles.bannerPerfil}
              alt={`Banner de ${nomeComercio}`}
              draggable={false}
              onError={(evento) => {
                evento.currentTarget.style.visibility = "hidden";
              }}
            />
          ) : null}

          {/* LOGO DO COMÉRCIO */}

          <div className={styles.profileCircle}>
            {logoUrl ? (
              <img
                src={logoUrl}
                className={styles.logoPerfil}
                alt={`Logo de ${nomeComercio}`}
                draggable={false}
                onError={(evento) => {
                  evento.currentTarget.style.visibility = "hidden";
                }}
              />
            ) : null}

            {/* ÍCONE SOBRE A LOGO */}

            <button
              type="button"
              className={styles.circleEdit}
              title="Alterar logo do comércio"
              aria-label="Alterar logo do comércio"
              onClick={handleAlterarLogo}
            >
              <EditarFotoIcon />
            </button>
          </div>

          {/* ÍCONE SOBRE O BANNER */}

          <button
            type="button"
            className={styles.headerEdit}
            title="Alterar banner do comércio"
            aria-label="Alterar banner do comércio"
            onClick={handleAlterarBanner}
          >
            <EditarFotoIcon />
          </button>
        </section>

        {/* INFORMAÇÕES DO ESTABELECIMENTO */}

        <section className={styles.infoBar}>
          <div className={styles.infoItem}>
            <EnderecoIcon />

            <div className={styles.infoContent}>
              <span className={styles.label}>
                Endereço
              </span>

              <strong>
                {enderecoCompleto ||
                  "Endereço não cadastrado"}
              </strong>
            </div>

            <EditarImg />
          </div>

          <div className={styles.divider} />

          <div className={styles.infoItem}>
            <HorarioIcon />

            <div className={styles.infoContent}>
              <span className={styles.label}>
                Horário
              </span>

              <strong>
                Consulte os horários cadastrados
              </strong>
            </div>

            <EditarImg />
          </div>

          <div className={styles.divider} />

          <div className={styles.infoItem}>
            <CategoriaIcon />

            <div className={styles.infoContent}>
              <span className={styles.label}>
                Categoria
              </span>

              <strong>
                {perfil.categoria || "Não informada"}
              </strong>
            </div>

            <EditarImg />
          </div>

          <div className={styles.rating}>
            <EstrelasIcon />

            <div>
              <span className={styles.label}>
                Avaliação
              </span>

              <strong>—</strong>
            </div>
          </div>
        </section>

        {/* SOBRE O ESTABELECIMENTO */}

        <section className={styles.content}>
          <div className={styles.descriptionCard}>
            <div className={styles.cardHeader}>
              <h2>Sobre o estabelecimento</h2>
              <EditarImg />
            </div>

            <div className={styles.cardBody}>
              <span>
                Descrição não cadastrada.
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* INFORMAÇÕES DA CONTA */}

      <section className={styles.informacaoContaContainer}>
        <ImagemInformacaoConta />

        <div className={styles.cardInformacaoConta}>
          <h2>Informações da Conta</h2>

          <div className={styles.dadosConta}>
            <div>
              <span>Nome do responsável</span>
              <strong>
                {perfil.nome_responsavel || "Não informado"}
              </strong>
            </div>

            <div>
              <span>E-mail cadastrado</span>
              <strong>
                {perfil.email || "Não informado"}
              </strong>
            </div>

            <div>
              <span>Telefone</span>
              <strong>
                {perfil.telefone || "Não informado"}
              </strong>
            </div>

            <div>
              <span>CNPJ</span>
              <strong>
                {perfil.cnpj || "Não informado"}
              </strong>
            </div>

            <div>
              <span>Data de cadastro</span>
              <strong>
                {formatarData(perfil.criado_em)}
              </strong>
            </div>

            <div>
              <span>Situação da conta</span>
              <strong className={styles.statusConta}>
                {situacao}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className={styles.botaoAlterarInformacoes}
            onClick={handleAlterarInformacoes}
          >
            Alterar informações
          </button>
        </div>
      </section>

      {/* DADOS BANCÁRIOS */}

      <section className={styles.bannerContainer}>
        <BannerDadosBancarios />

        <div className={styles.informacoesSobreConta}>
          <h2>Dados Bancários</h2>

          <div className={styles.dadosConta}>
            <div>
              <span>Banco</span>
              <strong>
                {perfil.banco || "Não informado"}
              </strong>
            </div>

            <div>
              <span>Agência</span>
              <strong>
                {perfil.agencia || "Não informada"}
              </strong>
            </div>

            <div>
              <span>Conta</span>
              <strong>
                {perfil.conta || "Não informada"}
              </strong>
            </div>

            <div>
              <span>Tipo de conta</span>
              <strong>
                {perfil.tipo_conta === "CORRENTE"
                  ? "Corrente"
                  : perfil.tipo_conta === "POUPANCA"
                    ? "Poupança"
                    : perfil.tipo_conta || "Não informado"}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className={styles.botaoAlterarInformacoes}
            onClick={handleAlterarInformacoes}
          >
            Alterar informações
          </button>
        </div>
      </section>

      {/* EXCLUSÃO DA CONTA */}

      <section className={styles.excluirContaContainer}>
        <button
          type="button"
          className={styles.botaoExcluirConta}
          onClick={handleExcluirConta}
        >
          Excluir conta
        </button>
      </section>
    </main>
  );
}

export default Perfil;
