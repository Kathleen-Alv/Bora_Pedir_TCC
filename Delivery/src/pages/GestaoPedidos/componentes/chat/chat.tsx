
import { useState } from 'react';

import styles from './chat.module.css';

import imgChat from '../../../../assets/chat.png';


export function Chat() {

    const [chatAberto, setChatAberto] = useState(false);


    function abrirChat() {
        setChatAberto(true);
    }


    function fecharChat() {
        setChatAberto(false);
    }


    return (
        <>

            {/* =================================================
                BOTÃO DO CHAT FECHADO
            ================================================= */}

            {!chatAberto && (

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


            {/* =================================================
                JANELA DO CHAT
            ================================================= */}

            {chatAberto && (

                <div className={styles.chat}>

                    {/* =========================
                        HEADER
                    ========================= */}

                    <header className={styles.header}>

                        <div className={styles.headerInfo}>

                            <div className={styles.avatar}>
                                BP
                            </div>

                            <div className={styles.userInfo}>

                                <strong>
                                    Bora Pedir
                                </strong>

                                <span>

                                    <i
                                        className={
                                            styles.online
                                        }
                                    />

                                    Online

                                </span>

                            </div>

                        </div>


                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={fecharChat}
                            aria-label="Fechar chat"
                        >
                            ×
                        </button>

                    </header>


                    {/* =========================
                        MENSAGENS
                    ========================= */}

                    <main className={styles.messages}>

                        <div className={styles.date}>
                            Hoje
                        </div>


                        <div
                            className={`${styles.messageRow} ${styles.received}`}
                        >

                            <div className={styles.smallAvatar}>
                                BP
                            </div>

                            <div className={styles.messageContent}>

                                <div className={styles.messageBubble}>

                                    Olá! 👋
                                    <br />

                                    Como podemos ajudar você?

                                </div>

                                <span className={styles.messageTime}>
                                    08:42
                                </span>

                            </div>

                        </div>


                        <div
                            className={`${styles.messageRow} ${styles.sent}`}
                        >

                            <div className={styles.messageContent}>

                                <div className={styles.messageBubble}>

                                    Preciso de ajuda com meu pedido.

                                </div>

                                <span className={styles.messageTime}>
                                    08:43
                                </span>

                            </div>

                        </div>


                        <div
                            className={`${styles.messageRow} ${styles.received}`}
                        >

                            <div className={styles.smallAvatar}>
                                BP
                            </div>

                            <div className={styles.messageContent}>

                                <div className={styles.messageBubble}>

                                    Claro! 😊
                                    <br />

                                    Vou verificar isso para você.

                                </div>

                                <span className={styles.messageTime}>
                                    08:44
                                </span>

                            </div>

                        </div>

                    </main>


                    {/* =========================
                        ENVIO
                    ========================= */}

                    <footer className={styles.footer}>

                        <div className={styles.inputArea}>

                            <input
                                type="text"
                                placeholder="Digite uma mensagem..."
                                className={styles.input}
                            />

                            <button
                                type="button"
                                className={styles.sendButton}
                                aria-label="Enviar"
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

                        </div>

                    </footer>

                </div>

            )}

        </>
    );
}
