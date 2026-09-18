import { useEffect, useState } from 'react';

import styles from './novaCategoria.module.css';


// ================================================================
// TIPOS
// ================================================================

type NovaCategoriaProps = {
    // ------------------------------------------------------------
    // Controla se o botão "Salvar e adicionar outra Categoria"
    // deve aparecer.
    //
    // Por padrão fica TRUE para não quebrar outros lugares
    // que utilizam este componente.
    // ------------------------------------------------------------

    mostrarSalvarOutraCategoria?: boolean;

    onFechar: () => void;

    onSalvar: (
        nomeCategoria: string,
        continuarCadastrando?: boolean
    ) => void | Promise<void>;

    // ------------------------------------------------------------
    // Categoria que será alterada.
    //
    // null = cadastro de nova categoria
    // objeto = edição de categoria existente
    // ------------------------------------------------------------

    categoriaEmEdicao?: {
        id: number;
        nome: string;
    } | null;
};


// ================================================================
// COMPONENTE
// ================================================================

export function NovaCategoria({
    onFechar,
    onSalvar,
    categoriaEmEdicao = null,
    mostrarSalvarOutraCategoria = true
}: NovaCategoriaProps) {


    // ============================================================
    // ESTADO DO NOME
    // ============================================================

    const [nome, setNome] = useState(
        categoriaEmEdicao?.nome || ''
    );


    // ============================================================
    // ESTADO DO ERRO
    // ============================================================

    const [erro, setErro] = useState('');


    // ============================================================
    // ESTADO DE SALVAMENTO
    // ============================================================

    const [salvando, setSalvando] = useState(false);


    // ============================================================
    // VERIFICA SE ESTÁ EDITANDO
    // ============================================================

    const editando =
        categoriaEmEdicao !== null;


    // ============================================================
    // ATUALIZAR FORMULÁRIO
    // ============================================================
    //
    // Quando abrir o modal para editar:
    //
    // categoriaEmEdicao:
    //
    // {
    //     id: 1,
    //     nome: "Bebidas"
    // }
    //
    // O input ficará:
    //
    // [ Bebidas ]
    //
    // Quando abrir para cadastrar:
    //
    // categoriaEmEdicao = null
    //
    // O input ficará vazio.
    //
    // ============================================================

    useEffect(() => {

        if (categoriaEmEdicao) {

            setNome(
                categoriaEmEdicao.nome
            );

        } else {

            setNome('');

        }

        setErro('');

        setSalvando(false);

    }, [categoriaEmEdicao]);


    // ============================================================
    // SALVAR
    // ============================================================

    async function handleSalvar(
        continuarCadastrando: boolean
    ) {

        // --------------------------------------------------------
        // LIMPA ERRO ANTERIOR
        // --------------------------------------------------------

        setErro('');


        // --------------------------------------------------------
        // REMOVE ESPAÇOS DESNECESSÁRIOS
        // --------------------------------------------------------

        const nomeCategoria =
            nome.trim();


        // --------------------------------------------------------
        // VALIDA NOME
        // --------------------------------------------------------

        if (!nomeCategoria) {

            setErro(
                'Digite o nome da categoria.'
            );

            return;

        }


        try {

            setSalvando(true);


            // ----------------------------------------------------
            // ENVIA PARA O COMPONENTE PAI
            // ----------------------------------------------------

            await onSalvar(
                nomeCategoria,
                continuarCadastrando
            );


            // ----------------------------------------------------
            // SE FOR CADASTRO
            // ----------------------------------------------------
            //
            // Quando o usuário escolher:
            //
            // "Salvar e adicionar outra Categoria"
            //
            // o campo deve ficar vazio para cadastrar a próxima.
            //
            // ----------------------------------------------------

            if (
                !editando &&
                continuarCadastrando
            ) {

                setNome('');

            }


        } catch (error) {

            console.error(
                editando
                    ? 'Erro ao alterar categoria:'
                    : 'Erro ao criar categoria:',
                error
            );


            // ----------------------------------------------------
            // MOSTRA ERRO DEVOLVIDO PELO BACKEND
            // ----------------------------------------------------

            if (error instanceof Error) {

                setErro(
                    error.message
                );

            } else {

                setErro(
                    editando
                        ? 'Não foi possível alterar a categoria.'
                        : 'Não foi possível criar a categoria.'
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
            className={
                styles.modalOverlay
            }
        >

            <div
                className={
                    styles.modalContent
                }
            >


                {/* =================================================
                    BOTÃO FECHAR
                ================================================= */}

                <button
                    type="button"
                    className={
                        styles.modalClose
                    }
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

                    {editando
                        ? 'Editar Categoria'
                        : 'Nova Categoria'
                    }

                </h2>


                {/* =================================================
                    FORMULÁRIO
                ================================================= */}

                <form
                    className={
                        styles.modalForm
                    }
                    onSubmit={(evento) => {

                        evento.preventDefault();

                        // --------------------------------------------
                        // O botão principal sempre salva e fecha.
                        // --------------------------------------------

                        handleSalvar(false);

                    }}
                >


                    {/* =================================================
                        NOME DA CATEGORIA
                    ================================================= */}

                    <div
                        className={
                            styles.fieldGroup
                        }
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
                            onChange={(evento) => {

                                setNome(
                                    evento.target.value
                                );

                                // ------------------------------------
                                // Limpa o erro enquanto o usuário
                                // começa a corrigir o campo.
                                // ------------------------------------

                                if (erro) {

                                    setErro('');

                                }

                            }}
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
                            className={
                                styles.erro
                            }
                        >
                            {erro}
                        </div>

                    )}


                    {/* =================================================
                        AÇÕES
                    ================================================= */}

                    <div
                        className={
                            styles.modalActions
                        }
                    >


                        {/* =============================================
                            CANCELAR
                        ============================================= */}

                        <button
                            type="button"
                            className={
                                styles.btnCancel
                            }
                            onClick={onFechar}
                            disabled={salvando}
                        >
                            Cancelar
                        </button>


                        {/* =============================================
                            SALVAR E ADICIONAR OUTRA
                            ============================================= */}
                        {/*
                            Esse botão:

                            - NÃO aparece durante edição.
                            - Aparece durante cadastro quando
                              mostrarSalvarOutraCategoria = true.

                            No Cardápio estamos passando:

                            mostrarSalvarOutraCategoria={false}

                            portanto ele ficará escondido lá.
                        */}

                        {!editando &&
                            mostrarSalvarOutraCategoria && (

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

                            )}


                        {/* =============================================
                            SALVAR PRINCIPAL
                        ============================================= */}

                        <button
                            type="submit"
                            className={
                                styles.btnSave
                            }
                            disabled={salvando}
                        >

                            {salvando

                                ? 'Salvando...'

                                : editando

                                    ? 'Salvar Alterações'

                                    : 'Salvar Categoria'

                            }

                        </button>


                    </div>

                </form>

            </div>

        </div>

    );

}