import { useEffect, useMemo, useState } from 'react';

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

const FOTOS_POR_PAGINA = 5;


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

    if (
        imagem.startsWith('http://') ||
        imagem.startsWith('https://') ||
        imagem.startsWith('blob:') ||
        imagem.startsWith('data:')
    ) {
        return imagem;
    }

    if (imagem.startsWith('/')) {
        return `${API_SERVIDOR}${imagem}`;
    }

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
    // ESTADOS DO FORMULÁRIO
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

    const [fotoUrlAutomatica, setFotoUrlAutomatica] =
        useState('');

    const [preview, setPreview] =
        useState('');

    const [salvando, setSalvando] =
        useState(false);

    const [erro, setErro] =
        useState('');

    const [mostrarPrecificacao, setMostrarPrecificacao] =
        useState(false);


    // ========================================================
    // ESTADOS DA BUSCA AUTOMÁTICA DE FOTOS (5 POR VEZ)
    // ========================================================

    const [fotosEncontradas, setFotosEncontradas] =
        useState<string[]>([]);

    const [paginaFotos, setPaginaFotos] =
        useState(0);

    const [buscandoFotos, setBuscandoFotos] =
        useState(false);

    const [termoBuscado, setTermoBuscado] =
        useState('');


    // ========================================================
    // FOTOS DA PÁGINA ATUAL (5 MINIATURAS)
    // ========================================================

    const fotosPaginaAtual = useMemo(() => {
        const inicio = paginaFotos * FOTOS_POR_PAGINA;
        return fotosEncontradas.slice(inicio, inicio + FOTOS_POR_PAGINA);
    }, [fotosEncontradas, paginaFotos]);

    const totalPaginasFotos = Math.ceil(
        fotosEncontradas.length / FOTOS_POR_PAGINA
    );


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
            setFotoUrlAutomatica('');
            setFotosEncontradas([]);
            setPaginaFotos(0);
            setTermoBuscado('');

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
        setFotoUrlAutomatica('');
        setFotosEncontradas([]);
        setPaginaFotos(0);
        setTermoBuscado('');
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
    // BUSCAR FOTOS AUTOMÁTICAS
    // ========================================================

    async function handleBuscarFotosGoogle() {

        const termo = nome.trim();

        if (!termo) {
            setErro('Digite o nome do item primeiro para buscar fotos.');
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            setErro('Sessão não encontrada. Faça login novamente.');
            return;
        }

        try {

            setBuscandoFotos(true);
            setErro('');

            const resposta = await fetch(
                `${API_URL}/buscar-fotos?q=${encodeURIComponent(termo)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                setFotosEncontradas([]);
                setPaginaFotos(0);
                throw new Error(
                    dados?.message || 'Nenhuma foto encontrada.'
                );
            }

            const links: string[] = dados?.links || [];

            setFotosEncontradas(links);
            setPaginaFotos(0);
            setTermoBuscado(termo);

            if (links.length > 0) {
                selecionarFotoAutomatica(links[0]);
            }

        } catch (error) {

            console.error('Erro ao buscar fotos:', error);

            setErro(
                error instanceof Error
                    ? error.message
                    : 'Erro ao buscar fotos.'
            );

        } finally {

            setBuscandoFotos(false);
        }
    }


    // ========================================================
    // AVANÇAR PARA AS PRÓXIMAS 5 FOTOS
    // ========================================================

    function handleVerMaisCincoFotos() {

        if (totalPaginasFotos <= 1) return;

        const proximaPagina = (paginaFotos + 1) % totalPaginasFotos;
        setPaginaFotos(proximaPagina);

        const primeiroIndiceDaPagina = proximaPagina * FOTOS_POR_PAGINA;
        const primeiraFotoDaPagina = fotosEncontradas[primeiroIndiceDaPagina];

        if (primeiraFotoDaPagina) {
            selecionarFotoAutomatica(primeiraFotoDaPagina);
        }
    }


    // ========================================================
    // REMOVER LINK QUEBRADO DA LISTA SE FALHAR AO CARREGAR
    // ========================================================

    function handleRemoverLinkQuebrado(urlQuebrada: string) {

        setFotosEncontradas((prev) => {
            const filtradas = prev.filter((item) => item !== urlQuebrada);

            if (fotoUrlAutomatica === urlQuebrada) {
                const substituta = filtradas[0] || '';
                setFotoUrlAutomatica(substituta);
                setPreview(substituta);
            }

            return filtradas;
        });
    }


    // ========================================================
    // ESCOLHER UMA DAS 5 MINIATURAS
    // ========================================================

    function selecionarFotoAutomatica(url: string) {

        if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
        }

        setFoto(null);
        setFotoUrlAutomatica(url);
        setPreview(url);
        setErro('');
    }


    // ========================================================
    // SELECIONAR FOTO MANUAL (UPLOAD DO COMPUTADOR)
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

        if (
            !arquivo.type.startsWith('image/')
        ) {

            setErro(
                'Selecione um arquivo de imagem válido.'
            );

            evento.target.value = '';

            return;
        }

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

        setFoto(arquivo);
        setFotoUrlAutomatica('');

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

        if (!categoriaId) {
            setErro('Selecione uma categoria.');
            return;
        }

        if (!nome.trim()) {
            setErro('Informe o nome do item.');
            return;
        }

        if (!preco.trim()) {
            setErro('Informe o preço do item.');
            return;
        }

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
            setErro('Informe um preço válido.');
            return;
        }

        const token =
            localStorage.getItem('token');

        if (!token) {
            setErro('Sessão não encontrada. Faça login novamente.');
            return;
        }

        const dados =
            new FormData();

        dados.append('categoria_id', String(categoriaId));
        dados.append('nome', nome.trim());
        dados.append('preco', String(precoNumerico));
        dados.append('descricao', descricao.trim());

        if (
            modoAlteracao &&
            itemParaAlterar
        ) {
            dados.append(
                'disponivel',
                itemParaAlterar.disponivel ? '1' : '0'
            );
        } else {
            dados.append('disponivel', '1');
        }

        if (foto) {
            dados.append('foto', foto);
        } else if (fotoUrlAutomatica) {
            dados.append('fotoUrl', fotoUrlAutomatica);
        }

        const url =
            modoAlteracao &&
            itemParaAlterar
                ? `${API_URL}/itens/${itemParaAlterar.id}`
                : `${API_URL}/itens`;

        const metodo =
            modoAlteracao
                ? 'PATCH'
                : 'POST';

        setSalvando(true);

        try {

            const resposta =
                await fetch(
                    url,
                    {
                        method: metodo,
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        body: dados
                    }
                );

            const textoResposta =
                await resposta.text();

            let dadosResposta: any;

            try {
                dadosResposta = JSON.parse(textoResposta);
            } catch {
                console.error('Resposta recebida do servidor:', textoResposta);
                throw new Error(
                    `O servidor não retornou JSON. Status: ${resposta.status}`
                );
            }

            if (!resposta.ok) {
                throw new Error(
                    dadosResposta?.message || 'Não foi possível salvar o item.'
                );
            }

            const itemRecebido =
                dadosResposta?.item;

            if (!itemRecebido) {
                throw new Error('O servidor não retornou os dados do item.');
            }

            const itemResultado: ItemCriado = {
                id: Number(itemRecebido.id),
                categoria_id: Number(itemRecebido.categoria_id),
                nome: itemRecebido.nome,
                foto: itemRecebido.foto || null,
                preco: Number(itemRecebido.preco),
                descricao: itemRecebido.descricao || null,
                disponivel: converterBooleano(itemRecebido.disponivel)
            };

            if (modoAlteracao) {
                if (onItemAlterado) {
                    onItemAlterado(itemResultado);
                }
                return;
            }

            onItemCriado(itemResultado);

            setCategoriaId('');
            setNome('');
            setPreco('');
            setDescricao('');
            setFoto(null);
            setFotoUrlAutomatica('');
            setFotosEncontradas([]);
            setPaginaFotos(0);
            setTermoBuscado('');
            setPreview('');
            setErro('');

        } catch (error) {

            console.error('Erro ao salvar item:', error);

            if (error instanceof Error) {
                setErro(error.message);
            } else {
                setErro('Erro ao salvar o item.');
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
                if (evento.target === evento.currentTarget) {
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

                        <h2>
                            {modoAlteracao
                                ? 'Alterar item'
                                : 'Novo item'}
                        </h2>

                        {erro && (
                            <div className={styles.erro}>
                                {erro}
                            </div>
                        )}

                        <form
                            className={styles.modalForm}
                            onSubmit={handleSalvar}
                        >

                            {/* ======================================
                                NOME + BOTÃO BUSCAR FOTOS
                            ====================================== */}

                            <div className={styles.fieldGroup}>
                                <label>
                                    Nome do item
                                </label>

                                <div className={styles.nomeComBusca}>
                                    <input
                                        type="text"
                                        value={nome}
                                        onChange={(evento) =>
                                            setNome(evento.target.value)
                                        }
                                        placeholder="Ex.: X-Bacon"
                                        disabled={salvando}
                                    />

                                    <button
                                        type="button"
                                        className={styles.btnBuscarFoto}
                                        onClick={handleBuscarFotosGoogle}
                                        disabled={
                                            salvando ||
                                            buscandoFotos ||
                                            !nome.trim()
                                        }
                                    >
                                        {buscandoFotos
                                            ? 'Buscando...'
                                            : '🔍 Buscar foto'}
                                    </button>
                                </div>
                            </div>


                            {/* ======================================
                                GALERIA DE 5 OPÇÕES DE FOTOS
                            ====================================== */}

                            {fotosPaginaAtual.length > 0 && (
                                <div className={styles.galeriaBuscaBox}>
                                    <div className={styles.galeriaBuscaTopo}>
                                        <span className={styles.galeriaBuscaTitulo}>
                                            Resultados para "{termoBuscado}" (Pág.{' '}
                                            {paginaFotos + 1}/{totalPaginasFotos})
                                        </span>

                                        {totalPaginasFotos > 1 && (
                                            <button
                                                type="button"
                                                className={styles.btnMaisFotos}
                                                onClick={handleVerMaisCincoFotos}
                                            >
                                                🔄 Ver mais 5 fotos
                                            </button>
                                        )}
                                    </div>

                                    <div className={styles.galeriaGrade}>
                                        {fotosPaginaAtual.map((url, idx) => {
                                            const selecionada =
                                                fotoUrlAutomatica === url;

                                            return (
                                                <button
                                                    key={url}
                                                    type="button"
                                                    onClick={() =>
                                                        selecionarFotoAutomatica(
                                                            url
                                                        )
                                                    }
                                                    className={
                                                        selecionada
                                                            ? `${styles.miniaturaBtn} ${styles.miniaturaSelecionada}`
                                                            : styles.miniaturaBtn
                                                    }
                                                    title="Clique para usar esta foto"
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`Opção ${idx + 1}`}
                                                        className={
                                                            styles.miniaturaImg
                                                        }
                                                        onError={() =>
                                                            handleRemoverLinkQuebrado(
                                                                url
                                                            )
                                                        }
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}


                            {/* ======================================
                                FOTO PRINCIPAL (PREVIEW / UPLOAD)
                            ====================================== */}

                            <div className={styles.fieldGroup}>

                                <label>
                                    Foto do item
                                </label>

                                <div className={styles.imageUpload}>

                                    <label className={styles.uploadPlaceholder}>

                                        {preview ? (

                                            <img
                                                src={preview}
                                                alt="Pré-visualização do item"
                                                className={styles.previewImage}
                                                onError={() => {
                                                    if (fotoUrlAutomatica) {
                                                        handleRemoverLinkQuebrado(
                                                            fotoUrlAutomatica
                                                        );
                                                    }
                                                }}
                                            />

                                        ) : (

                                            <span>
                                                Clique para enviar foto ou use "Buscar foto" acima
                                            </span>

                                        )}

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSelecionarFoto}
                                            disabled={salvando}
                                            style={{ display: 'none' }}
                                        />

                                    </label>

                                </div>

                                <small>
                                    {fotoUrlAutomatica
                                        ? '✓ Foto vinculada automaticamente pela busca (ou clique acima para enviar do computador).'
                                        : 'Formatos de imagem aceitos. Tamanho máximo: 5 MB.'}
                                </small>

                            </div>


                            {/* ======================================
                                CATEGORIA
                            ====================================== */}

                            <div className={styles.fieldGroup}>

                                <label>
                                    Categoria
                                </label>

                                <select
                                    value={categoriaId}
                                    onChange={(evento) => {
                                        setCategoriaId(
                                            evento.target.value
                                                ? Number(evento.target.value)
                                                : ''
                                        );
                                    }}
                                    disabled={salvando}
                                >

                                    <option value="">
                                        Selecione uma categoria
                                    </option>

                                    {categorias.map((categoria) => (
                                        <option
                                            key={categoria.id}
                                            value={categoria.id}
                                        >
                                            {categoria.nome}
                                        </option>
                                    ))}

                                </select>

                            </div>


                            {/* ======================================
                                PREÇO
                            ====================================== */}

                            <div className={styles.fieldGroup}>

                                <label>
                                    Preço
                                </label>

                                <input
                                    type="text"
                                    value={preco}
                                    onChange={(evento) =>
                                        setPreco(evento.target.value)
                                    }
                                    placeholder="Ex.: 25,90"
                                    disabled={salvando}
                                />

                            </div>


                            {/* ======================================
                                DESCRIÇÃO
                            ====================================== */}

                            <div className={styles.fieldGroup}>

                                <label>
                                    Descrição
                                </label>

                                <textarea
                                    value={descricao}
                                    onChange={(evento) =>
                                        setDescricao(evento.target.value)
                                    }
                                    placeholder="Informe os ingredientes, preparo ou outras informações do item."
                                    disabled={salvando}
                                />

                            </div>


                            {/* ======================================
                                BOTÕES
                            ====================================== */}

                            <div className={styles.modalActions}>

                                <button
                                    type="button"
                                    className={styles.btnPrecificacao}
                                    onClick={() =>
                                        setMostrarPrecificacao(true)
                                    }
                                    disabled={salvando}
                                >
                                    💰 Precificação
                                </button>

                                <button
                                    type="button"
                                    className={styles.btnCancel}
                                    onClick={onFechar}
                                    disabled={salvando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className={styles.btnSave}
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

                        <div className={styles.precificacaoArea}>

                            <Precificacao
                                onFechar={() =>
                                    setMostrarPrecificacao(false)
                                }
                            />

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}