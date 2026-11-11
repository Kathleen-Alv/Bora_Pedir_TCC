
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type FormEvent,
} from "react";

import styles from "./chat.module.css";
import imgChat from "../../../../assets/chat/chat.png";

/* =====================================================
   TIPOS
===================================================== */

type TipoRemetente =
    | "CLIENTE"
    | "COMERCIO"
    | "ENTREGADOR"
    | "ADMIN"
    | "SISTEMA";

type MensagemChat = {
    id: number;
    chat_id: number;
    remetente_usuario_id: number;
    remetente_tipo: TipoRemetente;
    mensagem: string | null;
    tipo_mensagem: "TEXTO" | "IMAGEM" | "SISTEMA";
    arquivo_url?: string | null;
    criado_em: string;
    lida_em?: string | null;
};

type ChatProps = {
    chatId: number;
    usuarioLogadoId: number;
    nomeExibido: string;
    token: string;
    apiUrl?: string;
    modoIntegrado?: boolean;
};

/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const API_URL =
    (import.meta as any).env?.VITE_API_URL ||
    "http://localhost:3000";

/*
 * Este componente é utilizado no portal do COMÉRCIO.
 *
 * COMERCIO = mensagem à direita.
 * CLIENTE = mensagem à esquerda.
 *
 * Não utilizar somente o ID do usuário para identificar
 * o remetente, pois os perfis podem compartilhar usuarios.id.
 */

const PAPEL_LOGADO: TipoRemetente = "COMERCIO";

/* =====================================================
   COMPONENTE
===================================================== */

export function Chat({
    chatId,
    usuarioLogadoId,
    nomeExibido,
    token,
    apiUrl = API_URL,
    modoIntegrado = false,
}: ChatProps) {
    /* =================================================
       ESTADOS
    ================================================= */

    const [chatAberto, setChatAberto] = useState(false);
    const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
    const [texto, setTexto] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");

    /* =================================================
       REFERÊNCIAS
    ================================================= */

    const mensagensRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    /*
     * Controla se o chat deve rolar até o final.
     *
     * true  = pode rolar para a última mensagem.
     * false = usuário está lendo mensagens anteriores.
     */

    const deveRolarParaFinalRef = useRef(true);

    const chatVisivel = modoIntegrado || chatAberto;

    /* =================================================
       CABEÇALHOS
    ================================================= */

    const headers = useCallback((): HeadersInit => ({
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    }), [token]);

    /* =================================================
       LER RESPOSTA DA API
    ================================================= */

    async function lerResposta(resposta: Response) {
        const contentType =
            resposta.headers.get("content-type") || "";

        const textoResposta = await resposta.text();

        let dados: any = {};

        if (
            contentType.includes("application/json") &&
            textoResposta
        ) {
            try {
                dados = JSON.parse(textoResposta);
            } catch {
                throw new Error(
                    "A API retornou um JSON inválido."
                );
            }
        } else if (textoResposta) {
            console.error(
                "Resposta não JSON da API:",
                textoResposta
            );

            throw new Error(
                "A API não retornou JSON. Verifique a URL e a rota do chat."
            );
        }

        if (!resposta.ok) {
            throw new Error(
                dados.message ||
                dados.mensagem ||
                `Erro na comunicação com o servidor (${resposta.status}).`
            );
        }

        return dados;
    }

    /* =================================================
       FORMATAR HORÁRIO
    ================================================= */

    function formatarHorario(data: string) {
        if (!data) return "";

        const dataFormatada = new Date(
            data.replace(" ", "T")
        );

        if (Number.isNaN(dataFormatada.getTime())) {
            return "";
        }

        return dataFormatada.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    /* =================================================
       FORMATAR DATA
    ================================================= */

    function formatarData(data: string) {
        if (!data) return "";

        const dataMensagem = new Date(
            data.replace(" ", "T")
        );

        if (Number.isNaN(dataMensagem.getTime())) {
            return "";
        }

        const hoje = new Date();

        const ontem = new Date();
        ontem.setDate(hoje.getDate() - 1);

        const mesmaData = (a: Date, b: Date) =>
            a.getDate() === b.getDate() &&
            a.getMonth() === b.getMonth() &&
            a.getFullYear() === b.getFullYear();

        if (mesmaData(dataMensagem, hoje)) {
            return "Hoje";
        }

        if (mesmaData(dataMensagem, ontem)) {
            return "Ontem";
        }

        return dataMensagem.toLocaleDateString("pt-BR");
    }

    /* =================================================
       IDENTIFICAR REMETENTE
    ================================================= */

    function mensagemEhMinha(
        mensagem: MensagemChat
    ): boolean {
        const remetenteTipo = String(
            mensagem.remetente_tipo || ""
        ).trim().toUpperCase();

        return remetenteTipo === PAPEL_LOGADO;
    }

    /* =================================================
       IDENTIFICAR MENSAGEM DO SISTEMA
    ================================================= */

    function mensagemEhSistema(
        mensagem: MensagemChat
    ): boolean {
        return (
            mensagem.tipo_mensagem === "SISTEMA" ||
            String(mensagem.remetente_tipo || "")
                .trim()
                .toUpperCase() === "SISTEMA"
        );
    }

    /* =================================================
       CARREGAR MENSAGENS
    ================================================= */

    const carregarMensagens = useCallback(async (
        mostrarCarregamento = false
    ) => {
        if (!chatId || !token) {
            console.error(
                "Dados ausentes para carregar o chat:",
                {
                    chatId,
                    tokenExiste: Boolean(token),
                }
            );

            setErro(
                !token
                    ? "Sessão não encontrada. Faça login novamente."
                    : "ID da conversa não encontrado."
            );

            setCarregando(false);
            return;
        }

        try {
            if (mostrarCarregamento) {
                setCarregando(true);
            }

            setErro("");

            const url =
                `${apiUrl}/api/chat/${chatId}/mensagens`;

            const resposta = await fetch(url, {
                method: "GET",
                headers: headers(),
            });

            const dados = await lerResposta(resposta);

            const lista: MensagemChat[] =
                Array.isArray(dados.mensagens)
                    ? dados.mensagens
                    : [];

            /* =============================================
               CONFERÊNCIA DAS MENSAGENS
            ============================================= */

            console.log(
                "MENSAGENS DO CHAT:",
                lista.length
            );

            lista.forEach((mensagem) => {
                console.log(
                    `MENSAGEM ${mensagem.id} | ` +
                    `REMETENTE ID: ${mensagem.remetente_usuario_id} | ` +
                    `REMETENTE TIPO: ${mensagem.remetente_tipo} | ` +
                    `PERFIL ATUAL: ${PAPEL_LOGADO} | ` +
                    `É MINHA: ${mensagemEhMinha(mensagem)}`
                );
            });

            /* =============================================
               VERIFICAR POSIÇÃO DO SCROLL
            ============================================= */

            const elemento = mensagensRef.current;

            if (elemento) {
                const distanciaDoFinal =
                    elemento.scrollHeight -
                    elemento.scrollTop -
                    elemento.clientHeight;

                /*
                 * Se estiver a menos de 120px do final,
                 * acompanha as mensagens novas.
                 *
                 * Se estiver lendo o histórico,
                 * mantém a posição atual.
                 */

                deveRolarParaFinalRef.current =
                    distanciaDoFinal < 120;
            } else {
                deveRolarParaFinalRef.current = true;
            }

            /* =============================================
               ATUALIZAR MENSAGENS
            ============================================= */

            setMensagens(lista);

            /* =============================================
               MARCAR MENSAGENS COMO LIDAS
            ============================================= */

            try {
                const respostaLida = await fetch(
                    `${apiUrl}/api/chat/${chatId}/lida`,
                    {
                        method: "PATCH",
                        headers: headers(),
                    }
                );

                if (!respostaLida.ok) {
                    console.warn(
                        "Não foi possível marcar como lida:",
                        respostaLida.status
                    );
                }
            } catch (error) {
                console.warn(
                    "Erro ao marcar mensagens como lidas:",
                    error
                );
            }
        } catch (error) {
            console.error(
                "ERRO AO CARREGAR MENSAGENS:",
                error
            );

            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar conversa."
            );
        } finally {
            if (mostrarCarregamento) {
                setCarregando(false);
            }
        }
    }, [
        chatId,
        token,
        apiUrl,
        headers,
        usuarioLogadoId,
    ]);

    /* =================================================
       ABRIR CHAT
    ================================================= */

    function abrirChat() {
        setChatAberto(true);
    }

    /* =================================================
       FECHAR CHAT
    ================================================= */

    function fecharChat() {
        setChatAberto(false);
    }

    /* =================================================
       ENVIAR MENSAGEM
    ================================================= */

    async function enviarMensagem(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const mensagem = texto.trim();

        if (
            !mensagem ||
            enviando ||
            !chatId ||
            !token
        ) {
            return;
        }

        try {
            setEnviando(true);
            setErro("");

            const resposta = await fetch(
                `${apiUrl}/api/chat/${chatId}/mensagens`,
                {
                    method: "POST",
                    headers: headers(),
                    body: JSON.stringify({
                        mensagem,
                    }),
                }
            );

            const dados = await lerResposta(resposta);

            console.log(
                "MENSAGEM ENVIADA:",
                dados
            );

            setTexto("");

            /*
             * Ao enviar uma mensagem, sempre acompanha
             * a última mensagem da conversa.
             */

            deveRolarParaFinalRef.current = true;

            await carregarMensagens(true);

            /*
             * Garante a rolagem após o envio,
             * mesmo que o carregamento tenha acontecido
             * antes de o DOM atualizar.
             */

            requestAnimationFrame(() => {
                const elemento = mensagensRef.current;

                if (elemento) {
                    elemento.scrollTo({
                        top: elemento.scrollHeight,
                        behavior: "smooth",
                    });
                }
            });

            inputRef.current?.focus();
        } catch (error) {
            console.error(
                "ERRO AO ENVIAR MENSAGEM:",
                error
            );

            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao enviar mensagem."
            );
        } finally {
            setEnviando(false);
        }
    }

    /* =================================================
       CARREGAMENTO INICIAL E ATUALIZAÇÃO AUTOMÁTICA
    ================================================= */

    useEffect(() => {
        if (!chatVisivel || !chatId || !token) {
            return;
        }

        deveRolarParaFinalRef.current = true;

        carregarMensagens(true);

        /*
         * Atualiza as mensagens automaticamente
         * a cada 3 segundos.
         */

        const intervalo = window.setInterval(() => {
            carregarMensagens(false);
        }, 3000);

        return () => {
            window.clearInterval(intervalo);
        };
    }, [
        chatVisivel,
        chatId,
        token,
        carregarMensagens,
    ]);

    /* =================================================
       ROLAR PARA A ÚLTIMA MENSAGEM
    ================================================= */

    useEffect(() => {
        if (
            !chatVisivel ||
            !deveRolarParaFinalRef.current
        ) {
            return;
        }

        const elemento = mensagensRef.current;

        if (!elemento) return;

        elemento.scrollTo({
            top: elemento.scrollHeight,
            behavior: "smooth",
        });

        deveRolarParaFinalRef.current = false;
    }, [
        mensagens,
        chatVisivel,
    ]);

    /* =================================================
       AVATAR
    ================================================= */

    const inicialNome =
        nomeExibido?.trim().charAt(0).toUpperCase() || "C";

    /* =================================================
       RENDERIZAÇÃO
    ================================================= */

    return (
        <>
            {/* BOTÃO PARA ABRIR O CHAT */}

            {!modoIntegrado && !chatAberto && (
                <button
                    type="button"
                    className={styles.chatButton}
                    onClick={abrirChat}
                    aria-label="Abrir chat"
                >
                    <img
                        src={imgChat}
                        alt="Abrir chat"
                    />
                </button>
            )}

            {chatVisivel && (
                <div
                    className={
                        modoIntegrado
                            ? `${styles.chat} ${styles.chatIntegrado}`
                            : styles.chat
                    }
                >
                    {/* =====================================
                       CABEÇALHO
                    ===================================== */}

                    <header className={styles.header}>
                        <div className={styles.headerInfo}>
                            <div className={styles.avatar}>
                                {inicialNome}
                            </div>

                            <div className={styles.userInfo}>
                                <strong>
                                    {nomeExibido || "Cliente"}
                                </strong>

                                <span>
                                    <i className={styles.online} />
                                    Conversa
                                </span>
                            </div>
                        </div>

                        {!modoIntegrado && (
                            <button
                                type="button"
                                className={styles.closeButton}
                                onClick={fecharChat}
                                aria-label="Fechar chat"
                            >
                                ×
                            </button>
                        )}
                    </header>

                    {/* =====================================
                       ÁREA DE MENSAGENS COM SCROLL
                    ===================================== */}

                    <main
                        className={styles.messages}
                        ref={mensagensRef}
                    >
                        {carregando && mensagens.length === 0 && (
                            <div className={styles.date}>
                                Carregando conversa...
                            </div>
                        )}

                        {!carregando &&
                            mensagens.length === 0 &&
                            !erro && (
                                <div className={styles.date}>
                                    Nenhuma mensagem nesta conversa.
                                </div>
                            )}

                        {erro && (
                            <div className={styles.chatErro}>
                                {erro}
                            </div>
                        )}

                        {mensagens.map((mensagem, index) => {
                            const propriaMensagem =
                                mensagemEhMinha(mensagem);

                            const sistema =
                                mensagemEhSistema(mensagem);

                            const mensagemAnterior =
                                mensagens[index - 1];

                            const mostrarData =
                                !mensagemAnterior ||
                                formatarData(mensagem.criado_em) !==
                                formatarData(
                                    mensagemAnterior.criado_em
                                );

                            return (
                                <div
                                    key={mensagem.id}
                                    className={styles.messageGroup}
                                >
                                    {/* DATA */}

                                    {mostrarData && (
                                        <div className={styles.date}>
                                            {formatarData(
                                                mensagem.criado_em
                                            )}
                                        </div>
                                    )}

                                    {/* MENSAGEM DO SISTEMA */}

                                    {sistema ? (
                                        <div className={styles.date}>
                                            {mensagem.mensagem || ""}
                                        </div>
                                    ) : (
                                        /* MENSAGEM NORMAL */

                                        <div
                                            className={`
                                                ${styles.messageRow}
                                                ${propriaMensagem
                                                    ? styles.sent
                                                    : styles.received
                                                }
                                            `}
                                        >
                                            {/* AVATAR DO REMETENTE */}

                                            {!propriaMensagem && (
                                                <div
                                                    className={styles.smallAvatar}
                                                    title={
                                                        nomeExibido ||
                                                        "Contato"
                                                    }
                                                >
                                                    {inicialNome}
                                                </div>
                                            )}

                                            {/* CONTEÚDO */}

                                            <div
                                                className={
                                                    styles.messageContent
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.messageBubble
                                                    }
                                                >
                                                    {mensagem.tipo_mensagem ===
                                                    "IMAGEM" ? (
                                                        mensagem.arquivo_url ? (
                                                            <img
                                                                src={
                                                                    mensagem.arquivo_url.startsWith(
                                                                        "http"
                                                                    )
                                                                        ? mensagem.arquivo_url
                                                                        : `${apiUrl}${mensagem.arquivo_url}`
                                                                }
                                                                alt="Imagem enviada no chat"
                                                            />
                                                        ) : (
                                                            "Imagem indisponível"
                                                        )
                                                    ) : (
                                                        mensagem.mensagem || ""
                                                    )}
                                                </div>

                                                {/* HORÁRIO */}

                                                <span
                                                    className={
                                                        styles.messageTime
                                                    }
                                                >
                                                    {formatarHorario(
                                                        mensagem.criado_em
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </main>

                    {/* =====================================
                       RODAPÉ E ENVIO
                    ===================================== */}

                    <footer className={styles.footer}>
                        <form
                            className={styles.inputArea}
                            onSubmit={enviarMensagem}
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Digite uma mensagem..."
                                className={styles.input}
                                value={texto}
                                onChange={(event) =>
                                    setTexto(event.target.value)
                                }
                                disabled={enviando}
                                maxLength={5000}
                            />

                            <button
                                type="submit"
                                className={styles.sendButton}
                                aria-label="Enviar mensagem"
                                disabled={
                                    !texto.trim() ||
                                    enviando ||
                                    !token
                                }
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M3 20L21 12L3 4V10L16 12L3 14V20Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </button>
                        </form>
                    </footer>
                </div>
            )}
        </>
    );
}
