import { useState } from 'react';

import styles from './novaCategoria.module.css';


// ================================================================
// TIPOS
// ================================================================

type NovaCategoriaProps = {
    onFechar: () => void;

    onSalvar: (
        nomeCategoria: string,
        continuarCadastrando?: boolean
    ) => void | Promise<void>;
};


// ================================================================
// COMPONENTE
// ================================================================

export function NovaCategoria({
    onFechar,
    onSalvar
}: NovaCategoriaProps) {


    // ============================================================
    // ESTADOS
    // ============================================================

    const [nome, setNome] =
        useState('');

    const [erro, setErro] =
        useState('');

    const [salvando, setSalvando] =
        useState(false);


    // ============================================================
    // SALVAR CATEGORIA
    // ============================================================

    async function handleSalvar(
        continuarCadastrando: boolean
    ) {

        setErro('');


        // --------------------------------------------------------
        // VALIDA NOME
        // --------------------------------------------------------

        if (!nome.trim()) {

            setErro(
                'Digite o nome da categoria.'
            );

            return;

        }


        try {

            setSalvando(true);


            // ----------------------------------------------------
            // ENVIA PARA O CARDÁPIO
            // ----------------------------------------------------

            await onSalvar(
                nome.trim(),
                continuarCadastrando
            );


            // ----------------------------------------------------
            // LIMPA O CAMPO
            // ----------------------------------------------------

            setNome('');

        } catch (error) {

            console.error(
                'Erro ao criar categoria:',
                error
            );


            if (error instanceof Error) {

                setErro(
                    error.message
                );

            } else {

                setErro(
                    'Não foi possível criar a categoria.'
                );

            }

        } finally {

            setSalvando(false);

        }

    }


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div
            className={styles.modalOverlay}
        >

            <div
                className={styles.modalContent}
            >


                {/* =================================================
                    BOTÃO FECHAR
                ================================================= */}

                <button
                    type="button"
                    className={styles.modalClose}
                    onClick={onFechar}
                    disabled={salvando}
                    aria-label="Fechar"
                    title="Fechar"
                >
                    &times;
                </button>


                {/* =================================================
                    TÍTULO
                ================================================= */}

                <h2>
                    Nova Categoria
                </h2>


                {/* =================================================
                    FORMULÁRIO
                ================================================= */}

                <form
                    className={styles.modalForm}
                    onSubmit={(evento) => {

                        evento.preventDefault();

                        handleSalvar(false);

                    }}
                >


                    {/* =================================================
                        NOME DA CATEGORIA
                    ================================================= */}

                    <div
                        className={styles.fieldGroup}
                    >

                        <label
                            htmlFor="nomeCategoria"
                        >
                            Nome da Categoria
                        </label>


                        <input
                            type="text"
                            id="nomeCategoria"
                            value={nome}
                            onChange={(evento) =>
                                setNome(
                                    evento.target.value
                                )
                            }
                            placeholder="Ex: Sobremesas, Entradas..."
                            autoFocus
                            disabled={salvando}
                        />

                    </div>


                    {/* =================================================
                        ERRO
                    ================================================= */}

                    {erro && (

                        <div
                            className={styles.erro}
                        >
                            {erro}
                        </div>

                    )}


                    {/* =================================================
                        AÇÕES
                    ================================================= */}

                    <div
                        className={styles.modalActions}
                    >


                        {/* =============================================
                            CANCELAR
                        ============================================= */}

                        <button
                            type="button"
                            className={styles.btnCancel}
                            onClick={onFechar}
                            disabled={salvando}
                        >
                            Cancelar
                        </button>


                        {/* =============================================
                            SALVAR E ADICIONAR OUTRA
                        ============================================= */}

                        <button
                            type="button"
                            className={
                                styles.btnSaveOutra
                            }
                            onClick={() =>
                                handleSalvar(true)
                            }
                            disabled={salvando}
                        >

                            {salvando
                                ? 'Salvando...'
                                : 'Salvar e adicionar outra Categoria'
                            }

                        </button>


                        {/* =============================================
                            SALVAR CATEGORIA
                        ============================================= */}

                        <button
                            type="submit"
                            className={styles.btnSave}
                            disabled={salvando}
                        >

                            {salvando
                                ? 'Salvando...'
                                : 'Salvar Categoria'
                            }

                        </button>


                    </div>

                </form>

            </div>

        </div>

    );

}