import styles from '../novoItem/novoItem.module.css';

import type {
    Item,
    Categoria
} from '../types/cardapio.types';


// ============================================================
// TIPOS
// ============================================================

type VerItemProps = {
    item: Item;
    categorias: Categoria[];
    onFechar: () => void;
    montarUrlImagem: (
        imagem: string | null | undefined
    ) => string | null;
};


// ============================================================
// COMPONENTE
// ============================================================

export function VerItem({
    item,
    categorias,
    onFechar,
    montarUrlImagem
}: VerItemProps) {

    // ========================================================
    // ENCONTRAR CATEGORIA
    // ========================================================

    const categoria = categorias.find(
        (categoria) =>
            categoria.id === item.categoriaId
    );


    // ========================================================
    // URL DA IMAGEM
    // ========================================================

    const imagemUrl = montarUrlImagem(
        item.imagem
    );


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
                    onFechar();
                }

            }}
        >

            <div
                className={styles.modalContent}
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
                    aria-label="Fechar"
                >
                    ×
                </button>


                {/* ==================================================
                    TÍTULO
                ================================================== */}

                <h2>
                    Visualizar item
                </h2>


                {/* ==================================================
                    CONTEÚDO
                ================================================== */}

                <div className={styles.modalForm}>

                    {/* ==================================================
                        FOTO
                    ================================================== */}

                    <div
                        className={styles.fieldGroup}
                    >

                        <label>
                            Foto do item
                        </label>


                        <div
                            className={styles.imageUpload}
                        >

                            <div
                                className={
                                    styles.uploadPlaceholder
                                }
                            >

                                {imagemUrl ? (

                                    <img
                                        src={imagemUrl}
                                        alt={item.nome}
                                        className={
                                            styles.previewImage
                                        }
                                    />

                                ) : (

                                    <span>
                                        Sem imagem
                                    </span>

                                )}

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        CATEGORIA
                    ================================================== */}

                    <div
                        className={styles.fieldGroup}
                    >

                        <label>
                            Categoria
                        </label>


                        <div
                            className={styles.readOnlyValue}
                        >
                            {categoria?.nome ||
                                'Categoria não encontrada'}
                        </div>

                    </div>


                    {/* ==================================================
                        NOME
                    ================================================== */}

                    <div
                        className={styles.fieldGroup}
                    >

                        <label>
                            Nome do item
                        </label>


                        <div
                            className={styles.readOnlyValue}
                        >
                            {item.nome}
                        </div>

                    </div>


                    {/* ==================================================
                        PREÇO
                    ================================================== */}

                    <div
                        className={styles.fieldGroup}
                    >

                        <label>
                            Preço
                        </label>


                        <div
                            className={styles.readOnlyValue}
                        >

                            R${' '}
                            {Number(item.preco)
                                .toFixed(2)
                                .replace('.', ',')}

                        </div>

                    </div>


                    {/* ==================================================
                        DESCRIÇÃO
                    ================================================== */}

                    <div
                        className={styles.fieldGroup}
                    >

                        <label>
                            Descrição
                        </label>


                        <div
                            className={`${styles.readOnlyValue} ${styles.readOnlyDescricao}`}
                        >

                            {item.descricao
                                ? item.descricao
                                : 'Nenhuma descrição cadastrada.'}

                        </div>

                    </div>


                    {/* ==================================================
                        DISPONIBILIDADE
                    ================================================== */}

                    <div
                        className={styles.fieldGroup}
                    >

                        <label>
                            Disponibilidade
                        </label>


                        <div
                            className={
                                item.disponivel
                                    ? styles.statusDisponivel
                                    : styles.statusIndisponivel
                            }
                        >

                            <span
                                className={
                                    item.disponivel
                                        ? styles.pontoDisponivel
                                        : styles.pontoIndisponivel
                                }
                            />

                            <span>
                                {item.disponivel
                                    ? 'Disponível'
                                    : 'Indisponível'}
                            </span>

                        </div>

                    </div>


                    {/* ==================================================
                        BOTÃO
                    ================================================== */}

                    <div
                        className={styles.modalActions}
                    >

                        <button
                            type="button"
                            className={styles.btnCancel}
                            onClick={onFechar}
                        >
                            Fechar
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );
}