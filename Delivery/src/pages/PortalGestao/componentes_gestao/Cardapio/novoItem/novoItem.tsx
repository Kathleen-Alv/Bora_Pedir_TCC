import React, { useState } from 'react';

import styles from './novoItem.module.css';


// ================================================================
// TIPOS
// ================================================================

type Categoria = {
    id: number;
    nome: string;
    quantidade: number;
};


type ItemCriado = {
    id: number;
    categoria_id: number;
    nome: string;
    foto: string | null;
    preco: number;
    descricao: string | null;
    disponivel: boolean;
};


type NovoItemProps = {
    categorias: Categoria[];
    onFechar: () => void;
    onItemCriado: (item: ItemCriado) => void;
};


// ================================================================
// API
// ================================================================

const API_URL =
    'http://localhost:3000/api/cardapio';


// ================================================================
// TOKEN
// ================================================================

function obterToken(): string | null {

    return localStorage.getItem('token');

}


// ================================================================
// COMPONENTE
// ================================================================

export function NovoItem({
    categorias,
    onFechar,
    onItemCriado
}: NovoItemProps) {


    // ============================================================
    // ESTADOS
    // ============================================================

    const [categoriaId, setCategoriaId] =
        useState('');

    const [nome, setNome] =
        useState('');

    const [preco, setPreco] =
        useState('');

    const [descricao, setDescricao] =
        useState('');

    const [foto, setFoto] =
        useState<File | null>(null);

    const [preview, setPreview] =
        useState<string | null>(null);

    const [salvando, setSalvando] =
        useState(false);

    const [erro, setErro] =
        useState('');


    // ============================================================
    // SELECIONAR FOTO
    // ============================================================

    function handleSelecionarFoto(
        evento: React.ChangeEvent<HTMLInputElement>
    ) {

        const arquivo =
            evento.target.files?.[0] || null;


        if (!arquivo) {
            return;
        }


        // --------------------------------------------------------
        // VERIFICA SE É IMAGEM
        // --------------------------------------------------------

        if (!arquivo.type.startsWith('image/')) {

            setErro(
                'Selecione apenas arquivos de imagem.'
            );

            return;

        }


        // --------------------------------------------------------
        // VERIFICA TAMANHO
        // --------------------------------------------------------

        if (arquivo.size > 5 * 1024 * 1024) {

            setErro(
                'A imagem deve ter no máximo 5 MB.'
            );

            return;

        }


        setErro('');

        setFoto(arquivo);


        // --------------------------------------------------------
        // LIBERA PREVIEW ANTERIOR
        // --------------------------------------------------------

        if (preview) {

            URL.revokeObjectURL(
                preview
            );

        }


        // --------------------------------------------------------
        // CRIA NOVA PRÉ-VISUALIZAÇÃO
        // --------------------------------------------------------

        const url =
            URL.createObjectURL(
                arquivo
            );


        setPreview(url);

    }


    // ============================================================
    // LIMPAR FORMULÁRIO
    // ============================================================

    function limparFormulario() {

        setCategoriaId('');

        setNome('');

        setPreco('');

        setDescricao('');

        setFoto(null);


        // --------------------------------------------------------
        // LIBERA URL DA IMAGEM
        // --------------------------------------------------------

        if (preview) {

            URL.revokeObjectURL(
                preview
            );

        }


        setPreview(null);


        // --------------------------------------------------------
        // LIMPA INPUT DE ARQUIVO
        // --------------------------------------------------------

        const inputFoto =
            document.getElementById(
                'fotoItem'
            ) as HTMLInputElement | null;


        if (inputFoto) {

            inputFoto.value = '';

        }

    }


    // ============================================================
    // SALVAR ITEM
    // ============================================================

    async function handleSubmit(
        evento: React.FormEvent,
        continuarCadastrando: boolean
    ) {

        evento.preventDefault();

        setErro('');


        // --------------------------------------------------------
        // CATEGORIA
        // --------------------------------------------------------

        if (!categoriaId) {

            setErro(
                'Selecione uma categoria.'
            );

            return;

        }


        // --------------------------------------------------------
        // NOME
        // --------------------------------------------------------

        if (!nome.trim()) {

            setErro(
                'Digite o nome do item.'
            );

            return;

        }


        // --------------------------------------------------------
        // PREÇO
        // --------------------------------------------------------

        const precoNumerico =
            Number(
                preco.replace(',', '.')
            );


        if (
            !preco.trim() ||
            Number.isNaN(precoNumerico) ||
            precoNumerico <= 0
        ) {

            setErro(
                'Digite um preço válido.'
            );

            return;

        }


        // --------------------------------------------------------
        // TOKEN
        // --------------------------------------------------------

        const token =
            obterToken();


        if (!token) {

            setErro(
                'Sessão expirada. Faça login novamente.'
            );

            return;

        }


        try {

            setSalvando(true);


            // ====================================================
            // FORM DATA
            // ====================================================

            const formulario =
                new FormData();


            formulario.append(
                'categoria_id',
                String(categoriaId)
            );


            formulario.append(
                'nome',
                nome.trim()
            );


            formulario.append(
                'preco',
                String(precoNumerico)
            );


            formulario.append(
                'descricao',
                descricao.trim()
            );


            // ----------------------------------------------------
            // FOTO
            // ----------------------------------------------------

            if (foto) {

                formulario.append(
                    'foto',
                    foto
                );

            }


            // ====================================================
            // ENVIA PARA O BACKEND
            // ====================================================

            const resposta =
                await fetch(
                    `${API_URL}/itens`,
                    {
                        method: 'POST',

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },

                        body:
                            formulario
                    }
                );


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    dados.message ||
                    'Erro ao criar item.'
                );

            }


            // ====================================================
            // DEVOLVE ITEM PARA O CARDÁPIO
            // ====================================================

            onItemCriado(
                dados.item
            );


            // ====================================================
            // LIMPA FORMULÁRIO
            // ====================================================

            limparFormulario();


            // ====================================================
            // LIMPA ERRO
            // ====================================================

            setErro('');


            // ====================================================
            // DECIDE SE FECHA OU CONTINUA
            // ====================================================

            if (
                !continuarCadastrando
            ) {

                onFechar();

            }


        } catch (error) {

            console.error(
                'Erro ao criar item:',
                error
            );


            if (
                error instanceof Error
            ) {

                setErro(
                    error.message
                );

            } else {

                setErro(
                    'Erro ao criar item.'
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
                    TÍTULO
                ================================================= */}

                <h2>
                    Novo Item
                </h2>


                <form
                    className={styles.modalForm}
                    onSubmit={(evento) =>
                        handleSubmit(
                            evento,
                            false
                        )
                    }
                >


                    {/* =================================================
                        FOTO
                    ================================================= */}

                    <div
                        className={styles.fieldGroup}
                    >

                        <label>
                            Foto do item
                        </label>


                        <div
                            className={styles.imageUpload}
                        >

                            <label
                                htmlFor="fotoItem"
                                className={
                                    styles.uploadPlaceholder
                                }
                            >

                                {preview ? (

                                    <img
                                        src={preview}
                                        alt="Pré-visualização do item"
                                        className={
                                            styles.previewImage
                                        }
                                    />

                                ) : (

                                    <span>
                                        Clique para adicionar uma foto
                                    </span>

                                )}

                            </label>


                            <input
                                id="fotoItem"
                                type="file"
                                accept="image/*"
                                onChange={
                                    handleSelecionarFoto
                                }
                                disabled={salvando}
                                hidden
                            />

                        </div>

                    </div>



                    {/* =================================================
                        NOME
                    ================================================= */}

                    <div
                        className={styles.fieldGroup}
                    >

                        <label htmlFor="nomeItem">
                            Nome do item
                        </label>


                        <input
                            id="nomeItem"
                            type="text"
                            value={nome}
                            onChange={(evento) =>
                                setNome(
                                    evento.target.value
                                )
                            }
                            placeholder="Ex.: Baião de Dois"
                            disabled={salvando}
                            required
                        />

                    </div>



                    {/* =================================================
                        CATEGORIA
                    ================================================= */}

                    <div
                        className={styles.fieldGroup}
                    >

                        <label htmlFor="categoriaItem">
                            Categoria
                        </label>


                        <select
                            id="categoriaItem"
                            value={categoriaId}
                            onChange={(evento) =>
                                setCategoriaId(
                                    evento.target.value
                                )
                            }
                            disabled={salvando}
                            required
                        >

                            <option value="">
                                Selecione uma categoria
                            </option>


                            {categorias.map(
                                (categoria) => (

                                    <option
                                        key={
                                            categoria.id
                                        }
                                        value={
                                            categoria.id
                                        }
                                    >
                                        {
                                            categoria.nome
                                        }
                                    </option>

                                )
                            )}

                        </select>

                    </div>



                    {/* =================================================
                        PREÇO
                    ================================================= */}

                    <div
                        className={styles.fieldGroup}
                    >

                        <label htmlFor="precoItem">
                            Preço
                        </label>


                        <input
                            id="precoItem"
                            type="text"
                            inputMode="decimal"
                            value={preco}
                            onChange={(evento) =>
                                setPreco(
                                    evento.target.value
                                )
                            }
                            placeholder="Ex.: 29,90"
                            disabled={salvando}
                            required
                        />

                    </div>



                    {/* =================================================
                        DESCRIÇÃO
                    ================================================= */}

                    <div
                        className={styles.fieldGroup}
                    >

                        <label htmlFor="descricaoItem">
                            Descrição
                        </label>


                        <textarea
                            id="descricaoItem"
                            value={descricao}
                            onChange={(evento) =>
                                setDescricao(
                                    evento.target.value
                                )
                            }
                            placeholder="Ingredientes, preparo ou detalhes do item..."
                            rows={4}
                            disabled={salvando}
                        />

                    </div>



                    {/* =================================================
                        ERRO
                    ================================================= */}

                    {erro && (

                        <div
                            style={{
                                color: '#c62828',
                                fontSize: '13px',
                                fontWeight: 600
                            }}
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
                            CADASTRAR E ADICIONAR OUTRO
                        ============================================= */}

                        <button
                            type="button"
                            className={
                                styles.btnSaveOutra
                            }
                            onClick={(evento) =>
                                handleSubmit(
                                    evento,
                                    true
                                )
                            }
                            disabled={salvando}
                        >

                            {salvando
                                ? 'Salvando...'
                                : 'Cadastrar e adicionar outro Item'
                            }

                        </button>



                        {/* =============================================
                            CADASTRAR
                        ============================================= */}

                        <button
                            type="submit"
                            className={styles.btnSave}
                            disabled={salvando}
                        >

                            {salvando
                                ? 'Salvando...'
                                : 'Cadastrar'
                            }

                        </button>


                    </div>

                </form>

            </div>

        </div>

    );

}