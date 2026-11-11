
import {
    useCallback,
    useEffect,
    useState,
} from "react";

import styles from "./duvidas.module.css";

import { Chat } from "../componentes/chat/chat";

/* =====================================================
   TIPOS
===================================================== */

type Conversa = {
    id: number;
    chat_id?: number;
    cliente_id: number;
    comercio_id: number;
    tipo: "PEDIDO" | "DUVIDA";
    status: "ABERTO" | "ENCERRADO";
    nome_cliente: string;
    ultima_mensagem?: string | null;
    ultima_mensagem_em?: string | null;
};

/* =====================================================
   CONFIGURAÇÕES
===================================================== */

const API_URL =
    (import.meta as any).env?.VITE_API_URL ||
    "http://localhost:3000";

/* =====================================================
   PÁGINA DE DÚVIDAS
===================================================== */

export function Duvidas() {

    const [conversas, setConversas] = useState<Conversa[]>([]);

    const [conversaSelecionada, setConversaSelecionada] =
        useState<Conversa | null>(null);

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState("");

    const [token, setToken] = useState("");

    const [usuarioLogadoId, setUsuarioLogadoId] = useState(0);

    /* =================================================
       RECUPERAR AUTENTICAÇÃO
    ================================================= */

    useEffect(() => {

        const tokenSalvo = localStorage.getItem("token");

        if (!tokenSalvo) {

            setErro("Sessão não encontrada. Faça login novamente.");
            setCarregando(false);

            return;
        }

        try {

            const partes = tokenSalvo.split(".");

            if (partes.length !== 3) {
                throw new Error("Token JWT inválido.");
            }

            const payload = JSON.parse(
                atob(
                    partes[1]
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                        .padEnd(
                            partes[1].length +
                            (4 - partes[1].length % 4) % 4,
                            "="
                        )
                )
            );

            const id =
                payload.id ??
                payload.usuario_id;

            if (!id || !Number.isInteger(Number(id))) {

                setErro(
                    "Não foi possível identificar o usuário autenticado."
                );

                setCarregando(false);

                return;
            }

            setUsuarioLogadoId(Number(id));
            setToken(tokenSalvo);

            console.log("USUÁRIO AUTENTICADO:", {
                id: Number(id),
                tipo: payload.tipo,
                papel: payload.papel,
                comercio_id: payload.comercio_id,
            });

        } catch (error) {

            console.error("Erro ao interpretar token:", error);

            setErro("Não foi possível validar a sessão.");

            setCarregando(false);
        }

    }, []);

    /* =================================================
       BUSCAR CONVERSAS
    ================================================= */

    const carregarConversas = useCallback(async () => {

        if (!token) return;

        try {

            setErro("");

            const resposta = await fetch(
                `${API_URL}/api/chat`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const textoResposta = await resposta.text();

            let dados: any = {};

            try {

                dados = textoResposta
                    ? JSON.parse(textoResposta)
                    : {};

            } catch {

                console.error(
                    "Resposta inválida da API de conversas:",
                    textoResposta
                );

                throw new Error(
                    "O servidor não retornou uma resposta JSON válida."
                );
            }

            if (!resposta.ok) {

                throw new Error(
                    dados.message ||
                    dados.mensagem ||
                    `Erro ao carregar conversas (${resposta.status}).`
                );
            }

            const lista =
                dados.chats ??
                dados.conversas ??
                [];

            if (!Array.isArray(lista)) {

                throw new Error(
                    "A API retornou uma lista de conversas inválida."
                );
            }

            console.log("CONVERSAS RECEBIDAS DA API:", lista);

            /* =========================================
               NORMALIZAR IDENTIFICADOR DA CONVERSA

               O backend pode enviar:
               id: 1

               ou:
               chat_id: 1
            ========================================= */

            const conversasNormalizadas: Conversa[] = lista
                .map((conversa: any) => {

                    const identificador =
                        conversa.id ??
                        conversa.chat_id;

                    return {
                        ...conversa,

                        id: Number(identificador),

                        chat_id: Number(identificador),

                        cliente_id: Number(conversa.cliente_id),

                        comercio_id: Number(conversa.comercio_id),

                    };

                })
                .filter((conversa: Conversa) => {

                    return (
                        Number.isInteger(conversa.id) &&
                        conversa.id > 0
                    );

                });

            console.log(
                "CONVERSAS NORMALIZADAS:",
                conversasNormalizadas
            );

            setConversas(conversasNormalizadas);

            // Atualiza a conversa selecionada sem perder a seleção.
            setConversaSelecionada((anterior) => {

                if (!anterior) return null;

                return (
                    conversasNormalizadas.find(
                        (conversa) => conversa.id === anterior.id
                    ) ?? null
                );

            });

        } catch (error) {

            console.error("Erro ao buscar conversas:", error);

            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar conversas."
            );

        } finally {

            setCarregando(false);

        }

    }, [token]);

    /* =================================================
       CARREGAMENTO INICIAL
    ================================================= */

    useEffect(() => {

        if (!token) return;

        carregarConversas();

        const intervalo = window.setInterval(() => {

            carregarConversas();

        }, 10000);

        return () => {

            window.clearInterval(intervalo);

        };

    }, [token, carregarConversas]);

    /* =================================================
       ABRIR CONVERSA
    ================================================= */

    function abrirConversa(conversa: Conversa) {

        if (!conversa.id || conversa.id <= 0) {

            console.error(
                "Não foi possível abrir a conversa. ID inválido:",
                conversa
            );

            setErro("Não foi possível identificar esta conversa.");

            return;
        }

        setErro("");

        setConversaSelecionada(conversa);

        console.log(
            "CONVERSA SELECIONADA:",
            conversa
        );

    }

   

    /* =================================================
       FORMATAÇÃO
    ================================================= */

    function formatarHorario(data?: string | null) {

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
       RENDERIZAÇÃO
    ================================================= */

    return (

        <main className={styles.container}>

            {/* =========================================
                CABEÇALHO
            ========================================= */}

            <header className={styles.pageHeader}>

                <div>

                    <h1>
                        Dúvidas e conversas
                    </h1>

                    <p>
                        Converse com seus clientes pelo Bora Pedir.
                    </p>

                </div>

                

            </header>

            {/* =========================================
                CONTEÚDO
            ========================================= */}

            <section className={styles.content}>

                {/* =====================================
                    LISTA DE CONVERSAS
                ===================================== */}

                <aside className={styles.sidebar}>

                    <div className={styles.sidebarHeader}>

                        <h2>
                            Conversas
                        </h2>

                        <span>
                            {conversas.length}
                        </span>

                    </div>

                    {carregando && (

                        <div className={styles.empty}>
                            Carregando conversas...
                        </div>

                    )}

                    {!carregando && erro && (

                        <div className={styles.error}>
                            {erro}
                        </div>

                    )}

                    {!carregando &&
                        !erro &&
                        conversas.length === 0 && (

                            <div className={styles.empty}>
                                Nenhuma conversa encontrada.
                            </div>

                        )}

                    {!carregando &&

                        conversas.map((conversa) => (

                            <button
                                key={`conversa-${conversa.id}`}
                                type="button"
                                className={`${styles.conversa} ${
                                    conversaSelecionada?.id === conversa.id
                                        ? styles.conversaAtiva
                                        : ""
                                }`}
                                onClick={() => abrirConversa(conversa)}
                            >

                                <div className={styles.avatar}>

                                    {conversa.nome_cliente
                                        ?.trim()
                                        .charAt(0)
                                        .toUpperCase() || "C"}

                                </div>

                                <div className={styles.conversaInfo}>

                                    <div className={styles.conversaTopo}>

                                        <strong>
                                            {conversa.nome_cliente || "Cliente"}
                                        </strong>

                                        <span>
                                            {formatarHorario(
                                                conversa.ultima_mensagem_em
                                            )}
                                        </span>

                                    </div>

                                    <p>
                                        {conversa.ultima_mensagem ||
                                            "Nenhuma mensagem ainda."}
                                    </p>

                                    <small>
                                        {conversa.tipo === "PEDIDO"
                                            ? "Conversa sobre pedido"
                                            : "Dúvida"}
                                    </small>

                                </div>

                            </button>

                        ))

                    }

                </aside>

                {/* =====================================
                    ÁREA DA CONVERSA
                ===================================== */}

                <section className={styles.chatArea}>

                    {conversaSelecionada && (

                        usuarioLogadoId > 0 && token ? (

                            <>

                               

                                <div className={styles.chatContent}>

                                    <Chat
                                        key={`chat-${conversaSelecionada.id}`}
                                        chatId={conversaSelecionada.id}
                                        usuarioLogadoId={usuarioLogadoId}
                                        nomeExibido={
                                            conversaSelecionada.nome_cliente
                                        }
                                        token={token}
                                        modoIntegrado
                                    />

                                </div>

                            </>

                        ) : (

                            <div className={styles.error}>
                                Não foi possível identificar sua sessão.
                                Faça login novamente.
                            </div>

                        )

                    )}

                    {!conversaSelecionada && (

                        <div className={styles.selecione}>

                            <div className={styles.selecioneIcon}>
                                <span>☏</span>
                            </div>

                            <h2>
                                Suas conversas
                            </h2>

                            <p>
                                Selecione uma conversa ao lado para
                                visualizar e responder às mensagens.
                            </p>

                        </div>

                    )}

                </section>

            </section>

        </main>

    );

}