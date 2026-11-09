
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

type MensagemChat = {
    id: number;
    chat_id: number;
    remetente_usuario_id: number;
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

    // true: exibe o chat dentro da página Duvidas.
    // false: utiliza o botão e a janela flutuante.
    modoIntegrado?: boolean;
};

/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const API_URL =
    (import.meta as any).env?.VITE_API_URL ||
    "http://localhost:3000";

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

    const [chatAberto, setChatAberto] = useState(false);

    const [mensagens, setMensagens] = useState<MensagemChat[]>([]);

    const [texto, setTexto] = useState("");

    const [carregando, setCarregando] = useState(true);

    const [enviando, setEnviando] = useState(false);

    const [erro, setErro] = useState("");

    const mensagensRef = useRef<HTMLDivElement>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    // No modo integrado, o chat fica sempre visível.
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

        if (contentType.includes("application/json") && textoResposta) {
            try {
                dados = JSON.parse(textoResposta);
            } catch {
                throw new Error("A API retornou um JSON inválido.");
            }
        } else if (textoResposta) {
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
       CARREGAR MENSAGENS
    ================================================= */

    const carregarMensagens = useCallback(async (
        mostrarCarregamento = false
    ) => {

        if (!chatId || !token) return;

        try {

            if (mostrarCarregamento) {
                setCarregando(true);
            }

            const resposta = await fetch(
                `${apiUrl}/api/chat/${chatId}/mensagens`,
                {
                    method: "GET",
                    headers: headers(),
                }
            );

            const dados = await lerResposta(resposta);

            const lista: MensagemChat[] =
                Array.isArray(dados.mensagens)
                    ? dados.mensagens
                    : [];

            setMensagens(lista);
            setErro("");

            // Marca mensagens recebidas como lidas.
            // Uma falha nessa operação não deve apagar
            // as mensagens que já foram carregadas.
            try {

                await fetch(
                    `${apiUrl}/api/chat/${chatId}/lida`,
                    {
                        method: "PATCH",
                        headers: headers(),
                    }
                );

            } catch (error) {

                console.warn(
                    "Não foi possível marcar as mensagens como lidas:",
                    error
                );

            }

        } catch (error) {

            console.error("Erro ao carregar chat:", error);

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

    }, [chatId, token, apiUrl, headers]);

    /* =================================================
       ABRIR CHAT FLUTUANTE
    ================================================= */

    function abrirChat() {
        setChatAberto(true);
    }

    /* =================================================
       FECHAR CHAT FLUTUANTE
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

        if (!mensagem || enviando || !chatId) return;

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

            await lerResposta(resposta);

            setTexto("");

            await carregarMensagens();

            inputRef.current?.focus();

        } catch (error) {

            console.error("Erro ao enviar mensagem:", error);

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
       CARREGAMENTO E ATUALIZAÇÃO AUTOMÁTICA
    ================================================= */

    useEffect(() => {

        if (!chatVisivel || !token || !chatId) return;

        carregarMensagens(true);

        // Recebe mensagens enviadas pelo Flutter.
        const intervalo = window.setInterval(() => {
            carregarMensagens();
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

        if (!chatVisivel) return;

        const elemento = mensagensRef.current;

        if (!elemento) return;

        elemento.scrollTo({
            top: elemento.scrollHeight,
            behavior: "smooth",
        });

    }, [mensagens, chatVisivel]);

    /* =================================================
       RENDERIZAÇÃO
    ================================================= */

    return (
        <>

            {/* =========================================
                BOTÃO DO CHAT FLUTUANTE
                Não aparece no modo integrado.
            ========================================= */}

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

            {/* =========================================
                JANELA DO CHAT
            ========================================= */}

            {chatVisivel && (

                <div
                    className={
                        modoIntegrado
                            ? `${styles.chat} ${styles.chatIntegrado}`
                            : styles.chat
                    }
                >

                    {/* HEADER */}

                    <header className={styles.header}>

                        <div className={styles.headerInfo}>

                            <div className={styles.avatar}>
                                {nomeExibido
                                    ?.trim()
                                    .charAt(0)
                                    .toUpperCase() || "C"}
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

                    {/* MENSAGENS */}

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
                                Number(mensagem.remetente_usuario_id) ===
                                Number(usuarioLogadoId);

                            const mensagemAnterior =
                                mensagens[index - 1];

                            const mostrarData =
                                !mensagemAnterior ||
                                formatarData(mensagem.criado_em) !==
                                formatarData(mensagemAnterior.criado_em);

                            return (

                                <div key={mensagem.id}>

                                    {mostrarData && (

                                        <div className={styles.date}>
                                            {formatarData(mensagem.criado_em)}
                                        </div>

                                    )}

                                    <div
                                        className={`${styles.messageRow} ${
                                            propriaMensagem
                                                ? styles.sent
                                                : styles.received
                                        }`}
                                    >

                                        {!propriaMensagem && (

                                            <div className={styles.smallAvatar}>
                                                {nomeExibido
                                                    ?.trim()
                                                    .charAt(0)
                                                    .toUpperCase() || "C"}
                                            </div>

                                        )}

                                        <div className={styles.messageContent}>

                                            <div className={styles.messageBubble}>

                                                {mensagem.tipo_mensagem === "IMAGEM" ? (

                                                    mensagem.arquivo_url ? (

                                                        <img
                                                            src={
                                                                mensagem.arquivo_url.startsWith("http")
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

                                            <span className={styles.messageTime}>
                                                {formatarHorario(mensagem.criado_em)}
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            );
                        })}

                    </main>

                    {/* ENVIO */}

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
                                disabled={!texto.trim() || enviando}
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
