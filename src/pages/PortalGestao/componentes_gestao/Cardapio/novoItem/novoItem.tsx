import { useEffect, useState } from 'react';

import styles from './novoItem.module.css';

import { Precificacao } from '../calculadoraDePrecificação/calculadoraDePrecificação';


// ============================================================
// TIPOS
// ============================================================

type Categoria = {
    id: number;
    nome: string;
    quantidade: number;
};

type ItemParaAlterar = {
    id: number;
    nome: string;
    preco: number;
    imagem: string;
    descricao: string;
    disponivel: boolean;
    categoriaId: number;
    statusVenda: 'ativo' | 'pausado';
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
    itemParaAlterar?: ItemParaAlterar;
    modoAlteracao?: boolean;
    onItemAlterado?: (item: ItemCriado) => void;
};


// ============================================================
// URL DA API
// ============================================================

const API_URL =
    'http://localhost:3000/api/cardapio';

const API_SERVIDOR =
    'http://localhost:3000';


// ============================================================
// CONVERTER BOOLEANO
// ============================================================

function converterBooleano(
    valor: unknown
): boolean {
    return (
        valor === true ||
        valor === 1 ||
        valor === '1' ||
        valor === 'true'
    );
}


// ============================================================
// MONTAR URL DA IMAGEM
// ============================================================

function montarUrlImagem(
    imagem: string | null | undefined
): string {

    if (!imagem) {
        return '';
    }

    // URL completa
    if (
        imagem.startsWith('http://') ||
        imagem.startsWith('https://') ||
        imagem.startsWith('blob:') ||
        imagem.startsWith('data:')
    ) {
        return imagem;
    }

    // Caminho começando com /
    if (imagem.startsWith('/')) {
        return `${API_SERVIDOR}${imagem}`;
    }

    // Caminho sem /
    return `${API_SERVIDOR}/${imagem}`;
}


// ============================================================
// COMPONENTE
// ============================================================

export function NovoItem({
    categorias,
    onFechar,
    onItemCriado,
    itemParaAlterar,
    modoAlteracao = false,
    onItemAlterado
}: NovoItemProps) {

    // ========================================================
    // ESTADOS
    // ========================================================

    const [categoriaId, setCategoriaId] =
        useState<number | ''>('');

    const [nome, setNome] =
        useState('');

    const [preco, setPreco] =
        useState('');

    const [descricao, setDescricao] =
        useState('');

    const [foto, setFoto] =
        useState<File | null>(null);

    const [preview, setPreview] =
        useState('');

    const [salvando, setSalvando] =
        useState(false);

    const [erro, setErro] =
        useState('');

    const [mostrarPrecificacao, setMostrarPrecificacao] =
        useState(false);


    // ========================================================
    // PREENCHER FORMULÁRIO NA ALTERAÇÃO
    // ========================================================

    useEffect(() => {

        if (
            modoAlteracao &&
            itemParaAlterar
        ) {

            setCategoriaId(
                Number(
                    itemParaAlterar.categoriaId
                )
            );

            setNome(
                itemParaAlterar.nome || ''
            );

            setPreco(
                Number(
                    itemParaAlterar.preco
                )
                    .toFixed(2)
                    .replace('.', ',')
            );

            setDescricao(
                itemParaAlterar.descricao || ''
            );

            setFoto(null);

            setPreview(
                montarUrlImagem(
                    itemParaAlterar.imagem
                )
            );

            setErro('');

            return;
        }


        // ====================================================
        // NOVO ITEM
        // ====================================================

        setCategoriaId('');
        setNome('');
        setPreco('');
        setDescricao('');
        setFoto(null);
        setPreview('');
        setErro('');

    }, [
        modoAlteracao,
        itemParaAlterar
    ]);


    // ========================================================
    // LIMPAR URL BLOB
    // ========================================================

    useEffect(() => {

        return () => {

            if (
                preview &&
                preview.startsWith('blob:')
            ) {

                URL.revokeObjectURL(
                    preview
                );
            }
        };

    }, [preview]);


    // ========================================================
    // SELECIONAR FOTO
    // ========================================================

    function handleSelecionarFoto(
        evento: React.ChangeEvent<HTMLInputElement>
    ) {

        setErro('');

        const arquivo =
            evento.target.files?.[0];

        if (!arquivo) {
            return;
        }


        // ====================================================
        // VERIFICAR TIPO
        // ====================================================

        if (
            !arquivo.type.startsWith('image/')
        ) {

            setErro(
                'Selecione um arquivo de imagem válido.'
            );

            evento.target.value = '';

            return;
        }


        // ====================================================
        // LIMITE DE 5 MB
        // ====================================================

        const tamanhoMaximo =
            5 * 1024 * 1024;

        if (
            arquivo.size > tamanhoMaximo
        ) {

            setErro(
                'A imagem deve ter no máximo 5 MB.'
            );

            evento.target.value = '';

            return;
        }


        // ====================================================
        // SALVAR FOTO
        // ====================================================

        setFoto(arquivo);


        // Remove preview anterior
        if (
            preview &&
            preview.startsWith('blob:')
        ) {

            URL.revokeObjectURL(
                preview
            );
        }


        const novaPreview =
            URL.createObjectURL(
                arquivo
            );

        setPreview(
            novaPreview
        );
    }


    // ========================================================
    // SALVAR ITEM
    // ========================================================

    async function handleSalvar(
        evento: React.FormEvent<HTMLFormElement>
    ) {

        evento.preventDefault();

        setErro('');


        // ====================================================
        // VALIDAR CATEGORIA
        // ====================================================

        if (!categoriaId) {

            setErro(
                'Selecione uma categoria.'
            );

            return;
        }


        // ====================================================
        // VALIDAR NOME
        // ====================================================

        if (!nome.trim()) {

            setErro(
                'Informe o nome do item.'
            );

            return;
        }


        // ====================================================
        // VALIDAR PREÇO
        // ====================================================

        if (!preco.trim()) {

            setErro(
                'Informe o preço do item.'
            );

            return;
        }


        // ====================================================
        // TRATAR PREÇO
        // ====================================================

        const precoTratado =
            preco
                .replace(/R\$/gi, '')
                .replace(/\s/g, '')
                .replace(/\./g, '')
                .replace(',', '.');


        const precoNumerico =
            Number(precoTratado);


        if (
            Number.isNaN(precoNumerico) ||
            precoNumerico <= 0
        ) {

            setErro(
                'Informe um preço válido.'
            );

            return;
        }


        // ====================================================
        // TOKEN
        // ====================================================

        const token =
            localStorage.getItem('token');


        if (!token) {

            setErro(
                'Sessão não encontrada. Faça login novamente.'
            );

            return;
        }


        // ====================================================
        // FORMDATA
        // ====================================================

        const dados =
            new FormData();


        dados.append(
            'categoria_id',
            String(categoriaId)
        );


        dados.append(
            'nome',
            nome.trim()
        );


        dados.append(
            'preco',
            String(precoNumerico)
        );


        dados.append(
            'descricao',
            descricao.trim()
        );


        // ====================================================
        // DISPONIBILIDADE
        // ====================================================

        if (
            modoAlteracao &&
            itemParaAlterar
        ) {

            dados.append(
                'disponivel',
                itemParaAlterar.disponivel
                    ? '1'
                    : '0'
            );

        } else {

            dados.append(
                'disponivel',
                '1'
            );
        }


        // ====================================================
        // FOTO
        // ====================================================

        if (foto) {

            dados.append(
                'foto',
                foto
            );
        }


        // ====================================================
        // URL
        // ====================================================

        const url =
            modoAlteracao &&
            itemParaAlterar
                ? `${API_URL}/itens/${itemParaAlterar.id}`
                : `${API_URL}/itens`;


        // ====================================================
        // MÉTODO
        // ====================================================

        const metodo =
            modoAlteracao
                ? 'PATCH'
                : 'POST';


        setSalvando(true);


        // ====================================================
        // REQUISIÇÃO
        // ====================================================

        try {

            const resposta =
                await fetch(
                    url,
                    {
                        method: metodo,

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },

                        body: dados
                    }
                );


            // =================================================
            // PEGAR RESPOSTA COMO TEXTO
            // =================================================

            const textoResposta =
                await resposta.text();


            let dadosResposta: any;


            // =================================================
            // CONVERTER PARA JSON
            // =================================================

            try {

                dadosResposta =
                    JSON.parse(
                        textoResposta
                    );

            } catch {

                console.error(
                    'Resposta recebida do servidor:',
                    textoResposta
                );

                throw new Error(
                    `O servidor não retornou JSON. Status: ${resposta.status}`
                );
            }


            // =================================================
            // VERIFICAR ERRO HTTP
            // =================================================

            if (!resposta.ok) {

                throw new Error(
                    dadosResposta?.message ||
                    'Não foi possível salvar o item.'
                );
            }


            // =================================================
            // ITEM RETORNADO
            // =================================================

            const itemRecebido =
                dadosResposta?.item;


            if (!itemRecebido) {

                throw new Error(
                    'O servidor não retornou os dados do item.'
                );
            }


            // =================================================
            // FORMATAR ITEM
            // =================================================

            const itemResultado: ItemCriado = {

                id:
                    Number(
                        itemRecebido.id
                    ),

                categoria_id:
                    Number(
                        itemRecebido.categoria_id
                    ),

                nome:
                    itemRecebido.nome,

                foto:
                    itemRecebido.foto ||
                    null,

                preco:
                    Number(
                        itemRecebido.preco
                    ),

                descricao:
                    itemRecebido.descricao ||
                    null,

                disponivel:
                    converterBooleano(
                        itemRecebido.disponivel
                    )
            };


            // =================================================
            // ALTERAÇÃO
            // =================================================

            if (modoAlteracao) {

                if (onItemAlterado) {

                    onItemAlterado(
                        itemResultado
                    );
                }

                return;
            }


            // =================================================
            // CRIAÇÃO
            // =================================================

            onItemCriado(
                itemResultado
            );


            // =================================================
            // LIMPAR FORMULÁRIO
            // =================================================

            setCategoriaId('');
            setNome('');
            setPreco('');
            setDescricao('');
            setFoto(null);
            setPreview('');
            setErro('');


        } catch (error) {

            console.error(
                'Erro ao salvar item:',
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
                    'Erro ao salvar o item.'
                );
            }

        } finally {

            setSalvando(false);
        }
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div
            className={styles.modalOverlay}

            onMouseDown={(evento) => {

                if (
                    evento.target ===
                    evento.currentTarget
                ) {

                    if (!salvando) {
                        onFechar();
                    }
                }
            }}
        >

            <div
                className={
                    mostrarPrecificacao
                        ? `${styles.modalContent} ${styles.modalContentDividido}`
                        : styles.modalContent
                }

                onMouseDown={(evento) => {
                    evento.stopPropagation();
                }}
            >

                {/* ==================================================
                    BOTÃO FECHAR
                ================================================== */}

                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onFechar}
                    disabled={salvando}
                    aria-label="Fechar"
                >
                    ×
                </button>


                {/* ==================================================
                    ÁREA DIVIDIDA
                ================================================== */}

                <div className={styles.modalBody}>


                    {/* ==================================================
                        LADO ESQUERDO — CADASTRO
                    ================================================== */}

                    <div className={styles.cadastroArea}>

                        {/* ==================================================
                            TÍTULO
                        ================================================== */}

                        <h2>
                            {modoAlteracao
                                ? 'Alterar item'
                                : 'Novo item'}
                        </h2>


                        {/* ==================================================
                            ERRO
                        ================================================== */}

                        {erro && (

                            <div
                                className={styles.erro}
                            >
                                {erro}
                            </div>

                        )}


                        {/* ==================================================
                            FORMULÁRIO
                        ================================================== */}

                        <form
                            className={styles.modalForm}
                            onSubmit={handleSalvar}
                        >

                            {/* ======================================
                                FOTO
                            ====================================== */}

                            <div
                                className={styles.fieldGroup}
                            >

                                <label>
                                    Foto do item
                                </label>


                                <div
                                    className={
                                        styles.imageUpload
                                    }
                                >

                                    <label
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


                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={
                                                handleSelecionarFoto
                                            }
                                            disabled={
                                                salvando
                                            }
                                            style={{
                                                display: 'none'
                                            }}
                                        />

                                    </label>

                                </div>


                                <small>
                                    Formatos de imagem aceitos.
                                    Tamanho máximo: 5 MB.
                                </small>

                            </div>


                            {/* ======================================
                                CATEGORIA
                            ====================================== */}

                            <div
                                className={styles.fieldGroup}
                            >

                                <label>
                                    Categoria
                                </label>


                                <select
                                    value={categoriaId}

                                    onChange={(evento) => {

                                        setCategoriaId(
                                            evento.target.value
                                                ? Number(
                                                    evento.target.value
                                                )
                                                : ''
                                        );

                                    }}

                                    disabled={salvando}
                                >

                                    <option value="">
                                        Selecione uma categoria
                                    </option>


                                    {categorias.map(
                                        (categoria) => (

                                            <option
                                                key={categoria.id}
                                                value={categoria.id}
                                            >
                                                {categoria.nome}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* ======================================
                                NOME
                            ====================================== */}

                            <div
                                className={styles.fieldGroup}
                            >

                                <label>
                                    Nome do item
                                </label>


                                <input
                                    type="text"
                                    value={nome}

                                    onChange={(evento) =>
                                        setNome(
                                            evento.target.value
                                        )
                                    }

                                    placeholder="Ex.: X-Bacon"

                                    disabled={salvando}
                                />

                            </div>


                            {/* ======================================
                                PREÇO
                            ====================================== */}

                            <div
                                className={styles.fieldGroup}
                            >

                                <label>
                                    Preço
                                </label>


                                <input
                                    type="text"
                                    value={preco}

                                    onChange={(evento) =>
                                        setPreco(
                                            evento.target.value
                                        )
                                    }

                                    placeholder="Ex.: 25,90"

                                    disabled={salvando}
                                />

                            </div>


                            {/* ======================================
                                DESCRIÇÃO
                            ====================================== */}

                            <div
                                className={styles.fieldGroup}
                            >

                                <label>
                                    Descrição
                                </label>


                                <textarea
                                    value={descricao}

                                    onChange={(evento) =>
                                        setDescricao(
                                            evento.target.value
                                        )
                                    }

                                    placeholder="Informe os ingredientes, preparo ou outras informações do item."

                                    disabled={salvando}
                                />

                            </div>


                            {/* ======================================
                                BOTÕES
                            ====================================== */}

                            <div
                                className={
                                    styles.modalActions
                                }
                            >

                                <button
                                    type="button"

                                    className={
                                        styles.btnPrecificacao
                                    }

                                    onClick={() =>
                                        setMostrarPrecificacao(
                                            true
                                        )
                                    }

                                    disabled={salvando}
                                >
                                    💰 Precificação
                                </button>


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


                                <button
                                    type="submit"

                                    className={
                                        styles.btnSave
                                    }

                                    disabled={salvando}
                                >

                                    {salvando
                                        ? 'Salvando...'
                                        : modoAlteracao
                                            ? 'Salvar alterações'
                                            : 'Salvar item'}

                                </button>

                            </div>

                        </form>

                    </div>


                    {/* ==================================================
                        LADO DIREITO — PRECIFICAÇÃO
                    ================================================== */}

                    {mostrarPrecificacao && (

                        <div
                            className={
                                styles.precificacaoArea
                            }
                        >

                            <Precificacao
                                onFechar={() =>
                                    setMostrarPrecificacao(
                                        false
                                    )
                                }
                            />

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}