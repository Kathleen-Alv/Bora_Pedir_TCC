import { useEffect, useState } from 'react';
import styles from './menuItem.module.css';

type MenuItemProps = {
    onVerItem: () => void;
    onAlterar: () => void;
    onExcluir: () => void;
};

type PosicaoMenu = {
    top: number;
    left: number;
};

export function MenuItem({
    onVerItem,
    onAlterar,
    onExcluir
}: MenuItemProps) {

    const [aberto, setAberto] = useState(false);

    const [posicao, setPosicao] = useState<PosicaoMenu>({
        top: 0,
        left: 0
    });


    // ============================================================
    // FECHA O MENU QUANDO OUTRO MENU FOR ABERTO
    // ============================================================

    useEffect(() => {

        function fecharOutroMenu(event: Event) {

            const evento = event as CustomEvent;

            /*
             * Se outro MenuItem avisar que foi aberto,
             * fecha este.
             */
            if (evento.detail !== undefined) {
                setAberto(false);
            }
        }

        document.addEventListener(
            'menuItemAberto',
            fecharOutroMenu
        );

        return () => {

            document.removeEventListener(
                'menuItemAberto',
                fecharOutroMenu
            );

        };

    }, []);


    // ============================================================
    // FECHA O MENU AO CLICAR FORA
    // ============================================================

    useEffect(() => {

        function fecharMenu() {

            setAberto(false);

        }

        if (aberto) {

            document.addEventListener(
                'click',
                fecharMenu
            );

        }

        return () => {

            document.removeEventListener(
                'click',
                fecharMenu
            );

        };

    }, [aberto]);


    // ============================================================
    // CALCULA A POSIÇÃO DO MENU
    // ============================================================

    function calcularPosicaoMenu(
        event: React.MouseEvent<HTMLButtonElement>
    ) {

        const botao = event.currentTarget;

        const rect = botao.getBoundingClientRect();

        setPosicao({

            /*
             * Distância do menu para o botão.
             */
            top: rect.bottom + 12,

            /*
             * Alinha o lado direito do menu
             * com o lado direito do botão.
             */
            left: rect.right - 155

        });

    }


    // ============================================================
    // ABRIR / FECHAR MENU
    // ============================================================

    function alternarMenu(
        event: React.MouseEvent<HTMLButtonElement>
    ) {

        event.stopPropagation();

        /*
         * Se o menu já estiver aberto,
         * apenas fecha.
         */
        if (aberto) {

            setAberto(false);

            return;

        }

        /*
         * Calcula a posição antes de abrir.
         */
        calcularPosicaoMenu(event);


        /*
         * Avisa TODOS os outros MenuItem
         * que um novo menu está sendo aberto.
         *
         * Os outros vão receber esse evento
         * e fechar.
         */
        document.dispatchEvent(
            new CustomEvent('menuItemAberto', {
                detail: true
            })
        );


        /*
         * Abre este menu.
         */
        setAberto(true);

    }


    // ============================================================
    // VER ITEM
    // ============================================================

    function handleVerItem(
        event: React.MouseEvent<HTMLButtonElement>
    ) {

        event.stopPropagation();

        setAberto(false);

        onVerItem();

    }


    // ============================================================
    // ALTERAR ITEM
    // ============================================================

    function handleAlterar(
        event: React.MouseEvent<HTMLButtonElement>
    ) {

        event.stopPropagation();

        setAberto(false);

        onAlterar();

    }


    // ============================================================
    // EXCLUIR ITEM
    // ============================================================

    function handleExcluir(
        event: React.MouseEvent<HTMLButtonElement>
    ) {

        event.stopPropagation();

        setAberto(false);

        onExcluir();

    }


    // ============================================================
    // RENDERIZAÇÃO
    // ============================================================

    return (
        <div className={styles.container}>

            {/* =====================================================
                BOTÃO DOS TRÊS PONTOS
            ===================================================== */}

            <button
                type="button"
                className={styles.botaoMenu}
                onClick={alternarMenu}
                title="Opções do item"
                aria-label="Opções do item"
                aria-expanded={aberto}
            >

                <span></span>
                <span></span>
                <span></span>

            </button>


            {/* =====================================================
                MENU
            ===================================================== */}

            {aberto && (

                <div
                    className={styles.menu}
                    style={{
                        top: `${posicao.top}px`,
                        left: `${posicao.left}px`
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                >

                    {/* =================================================
                        ALTERAR
                    ================================================= */}

                    <button
                        type="button"
                        className={styles.opcao}
                        onClick={handleAlterar}
                    >

                        <span className={styles.icone}>
                            ✎
                        </span>

                        <span>
                            Alterar
                        </span>

                    </button>


                    {/* =================================================
                        EXCLUIR
                    ================================================= */}

                    <button
                        type="button"
                        className={`${styles.opcao} ${styles.opcaoExcluir}`}
                        onClick={handleExcluir}
                    >

                        <span className={styles.icone}>
                            🗑
                        </span>

                        <span>
                            Excluir
                        </span>

                    </button>


                    {/* =================================================
                        VER ITEM
                    ================================================= */}

                    <button
                        type="button"
                        className={`${styles.opcao} ${styles.opcaoVerItem}`}
                        onClick={handleVerItem}
                    >

                        <span className={styles.icone}>
                            👁️
                        </span>

                        <span>
                            Ver Item
                        </span>

                    </button>

                </div>

            )}

        </div>
    );
}