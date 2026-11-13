
import { useEffect, useRef, useState } from "react";
import styles from "./perfil.module.css";

import categoria from "../../../../assets/perfil/categoria.png";
import editar_foto from "../../../../assets/perfil/editar_foto.png";
import endereco from "../../../../assets/perfil/endereco.png";
import estrelas from "../../../../assets/perfil/estrelas.png";
import horario from "../../../../assets/perfil/horario.png";
import bannerDadosBancarios from "../../../../assets/perfil/bannerDadosBancarios.png";
import imagemInformacaoConta from "../../../../assets/perfil/informaçãoDaConta.png";

import ModalEditarInformacoes, {
    type PerfilEditavel,
} from "./editar_conta/ModalEditarInformacoes";

// ========================================================
// CONFIGURAÇÃO DA API
// ========================================================

const API_URL = "http://localhost:3000";

// ========================================================
// TIPAGENS
// ========================================================

interface PerfilComercio extends PerfilEditavel {
    comercio_id: number;
    cnpj: string;
    situacao_cadastral: string;
    criado_em: string;
    logo: string | null;
    banner: string | null;
}

interface RespostaPerfil {
    sucesso?: boolean;
    mensagem?: string;
    message?: string;
    perfil?: PerfilComercio;
    logo?: string;
    banner?: string;
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

function formatarCNPJ(valor: string | null | undefined): string {
    const cnpj = (valor || "").replace(/\D/g, "");

    if (cnpj.length !== 14) {
        return valor || "Não informado";
    }

    return cnpj.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
    );
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
    const [modalAberto, setModalAberto] = useState(false);

    // Referências dos campos de imagem.
    const inputLogoRef = useRef<HTMLInputElement>(null);
    const inputBannerRef = useRef<HTMLInputElement>(null);

    // Estados independentes de envio.
    const [enviandoLogo, setEnviandoLogo] = useState(false);
    const [enviandoBanner, setEnviandoBanner] = useState(false);

    // Identificador para atualizar o cache das imagens.
    const [versaoLogo, setVersaoLogo] = useState(Date.now());
    const [versaoBanner, setVersaoBanner] = useState(Date.now());

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

                const tipoConteudo = resposta.headers.get("content-type");

                if (!tipoConteudo?.includes("application/json")) {
                    throw new Error(
                        "A API não retornou JSON. Verifique a rota /api/perfil no servidor."
                    );
                }

                const dados = await resposta.json() as RespostaPerfil;

                if (!resposta.ok) {
                    throw new Error(
                        dados.mensagem ||
                        dados.message ||
                        "Não foi possível carregar o perfil."
                    );
                }

                if (!dados.perfil) {
                    throw new Error(
                        "A API não retornou os dados do perfil."
                    );
                }

                const perfilRecebido: PerfilComercio = {
                    ...dados.perfil,

                    cnpj: dados.perfil.cnpj || "",
                    descricao: dados.perfil.descricao || null,
                    categoria: dados.perfil.categoria || null,

                    horarios: Array.isArray(dados.perfil.horarios)
                        ? dados.perfil.horarios
                        : [],

                    logo: dados.perfil.logo || null,
                    banner: dados.perfil.banner || null,
                };

                setPerfil(perfilRecebido);

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
        setModalAberto(true);
    }

    function handleAlterarLogo() {
        if (!enviandoLogo) {
            inputLogoRef.current?.click();
        }
    }

    function handleAlterarBanner() {
        if (!enviandoBanner) {
            inputBannerRef.current?.click();
        }
    }

    // ======================================================
    // ENVIAR LOGO OU BANNER
    // ======================================================

    async function enviarImagem(
        arquivo: File,
        tipo: "logo" | "banner"
    ) {
        if (!arquivo.type.startsWith("image/")) {
            window.alert("Selecione um arquivo de imagem válido.");
            return;
        }

        if (arquivo.size > 5 * 1024 * 1024) {
            window.alert("A imagem deve ter no máximo 5 MB.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            window.alert("Sua sessão expirou. Faça login novamente.");
            return;
        }

        const formData = new FormData();

        formData.append(tipo, arquivo);

        const setEnviando =
            tipo === "logo"
                ? setEnviandoLogo
                : setEnviandoBanner;

        try {
            setEnviando(true);

            const resposta = await fetch(
                `${API_URL}/api/perfil/imagem`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                    body: formData,
                }
            );

            const contentType = resposta.headers.get("content-type");

            if (!contentType?.includes("application/json")) {
                throw new Error(
                    "A API não retornou uma resposta válida."
                );
            }

            const dados = await resposta.json() as RespostaPerfil;

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    dados.message ||
                    "Não foi possível atualizar a imagem."
                );
            }

            const caminhoImagem =
                dados[tipo] ||
                dados.perfil?.[tipo];

            if (!caminhoImagem) {
                throw new Error(
                    "O servidor não retornou o caminho da imagem atualizada."
                );
            }

            // Atualiza somente a imagem selecionada.
            setPerfil((atual) => {
                if (!atual) {
                    return atual;
                }

                return {
                    ...atual,
                    [tipo]: caminhoImagem,
                };
            });

            // Atualiza o endereço visual para evitar cache antigo.
            if (tipo === "logo") {
                setVersaoLogo(Date.now());
            } else {
                setVersaoBanner(Date.now());
            }

            window.alert(
                tipo === "logo"
                    ? "Logo atualizada com sucesso!"
                    : "Banner atualizado com sucesso!"
            );

        } catch (erro: unknown) {
            window.alert(
                erro instanceof Error
                    ? erro.message
                    : "Erro ao enviar imagem."
            );
        } finally {
            setEnviando(false);
        }
    }

    // ======================================================
    // SALVAR INFORMAÇÕES DO PERFIL
    // ======================================================

    function handleSalvarPerfil(perfilAtualizado: PerfilEditavel) {
        setPerfil((atual) => {
            if (!atual) {
                return atual;
            }

            return {
                ...atual,
                ...perfilAtualizado,
                cnpj: atual.cnpj,
                comercio_id: atual.comercio_id,
                situacao_cadastral: atual.situacao_cadastral,
                criado_em: atual.criado_em,
                logo: atual.logo,
                banner: atual.banner,
            };
        });

        setModalAberto(false);
    }

    // ======================================================
    // EXCLUIR CONTA
    // ======================================================

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

    const logoUrlAtualizada = logoUrl
        ? `${logoUrl}${logoUrl.includes("?") ? "&" : "?"}v=${versaoLogo}`
        : null;

    const bannerUrlAtualizado = bannerUrl
        ? `${bannerUrl}${bannerUrl.includes("?") ? "&" : "?"}v=${versaoBanner}`
        : null;

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

    const descricao =
        perfil.descricao?.trim() || "Descrição não cadastrada.";

    // ======================================================
    // INTERFACE
    // ======================================================

    return (
        <main className={styles.page}>
            <div className={styles.profileContainer}>

                {/* BANNER E LOGO DO COMÉRCIO */}

                <section className={styles.header}>

                    {/* INPUT INVISÍVEL DA LOGO */}

                    <input
                        ref={inputLogoRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(evento) => {
                            const arquivo = evento.target.files?.[0];

                            if (arquivo) {
                                void enviarImagem(arquivo, "logo");
                            }

                            evento.target.value = "";
                        }}
                    />

                    {/* INPUT INVISÍVEL DO BANNER */}

                    <input
                        ref={inputBannerRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(evento) => {
                            const arquivo = evento.target.files?.[0];

                            if (arquivo) {
                                void enviarImagem(arquivo, "banner");
                            }

                            evento.target.value = "";
                        }}
                    />

                    {/* BANNER DO COMÉRCIO */}

                    {bannerUrlAtualizado ? (
                        <img
                            src={bannerUrlAtualizado}
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
                        {logoUrlAtualizada ? (
                            <img
                                src={logoUrlAtualizada}
                                className={styles.logoPerfil}
                                alt={`Logo de ${nomeComercio}`}
                                draggable={false}
                                onError={(evento) => {
                                    evento.currentTarget.style.visibility = "hidden";
                                }}
                            />
                        ) : null}

                        <button
                            type="button"
                            className={styles.circleEdit}
                            title="Alterar logo do comércio"
                            aria-label="Alterar logo do comércio"
                            onClick={handleAlterarLogo}
                            disabled={enviandoLogo}
                        >
                            {enviandoLogo
                                ? "..."
                                : <EditarFotoIcon />}
                        </button>
                    </div>

                    {/* ÍCONE SOBRE O BANNER */}

                    <button
                        type="button"
                        className={styles.headerEdit}
                        title="Alterar banner do comércio"
                        aria-label="Alterar banner do comércio"
                        onClick={handleAlterarBanner}
                        disabled={enviandoBanner}
                    >
                        {enviandoBanner
                            ? "..."
                            : <EditarFotoIcon />}
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
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.infoItem}>
                        <HorarioIcon />

                        <div className={styles.infoContent}>
                            <span className={styles.label}>
                                Horário
                            </span>

                            <strong>
                                {perfil.horarios.length > 0
                                    ? "Consulte os horários cadastrados"
                                    : "Horários não cadastrados"}
                            </strong>
                        </div>
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
                    </div>

                    <div className={styles.divider} />

                    {/* AVALIAÇÃO E BOTÃO DE EDIÇÃO */}

                    <div className={styles.ratingContainer}>
                        <div className={styles.rating}>
                            <EstrelasIcon />

                            <div>
                                <span className={styles.label}>
                                    Avaliação
                                </span>

                                <strong>—</strong>
                            </div>
                        </div>

                        <button
                            type="button"
                            className={styles.botaoAlterarInformacoes}
                            onClick={handleAlterarInformacoes}
                        >
                            Editar informações do perfil
                        </button>
                    </div>
                </section>

                {/* SOBRE O ESTABELECIMENTO */}

                <section className={styles.content}>
                    <div className={styles.descriptionCard}>
                        <div className={styles.cardHeader}>
                            <h2>Sobre o estabelecimento</h2>
                        </div>

                        <div className={styles.cardBody}>
                            <span>
                                {descricao}
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
                                {formatarCNPJ(perfil.cnpj)}
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

            {/* MODAL DE EDIÇÃO DAS INFORMAÇÕES */}

            {modalAberto && (
                <ModalEditarInformacoes
                    perfil={perfil}
                    onClose={() => setModalAberto(false)}
                    onSaved={handleSalvarPerfil}
                />
            )}
        </main>
    );
}

export default Perfil;
