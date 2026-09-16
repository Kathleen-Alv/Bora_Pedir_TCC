
import { useState } from 'react';
import styles from './novaCategoria.module.css';

type NovaCategoriaProps = {
    onFechar: () => void;
    onSalvar: (nomeCategoria: string) => void | Promise<void>;
};

export function NovaCategoria({
    onFechar,
    onSalvar
}: NovaCategoriaProps) {

    const [nome, setNome] = useState('');
    const [erro, setErro] = useState('');
    const [salvando, setSalvando] = useState(false);

    async function handleSalvar() {

        setErro('');

        if (!nome.trim()) {
            setErro('Digite o nome da categoria.');
            return;
        }

        try {

            setSalvando(true);

            await onSalvar(nome.trim());

            setNome('');

        } catch (error) {

            console.error(error);

            setErro('Não foi possível criar a categoria.');

        } finally {

            setSalvando(false);

        }
    }

    return (
        <div
            className={styles.modalOverlay}
            onMouseDown={onFechar}
        >

            <div
                className={styles.modalContent}
                onMouseDown={(evento) => evento.stopPropagation()}
            >

                <button
                    type="button"
                    className={styles.modalClose}
                    onClick={onFechar}
                    disabled={salvando}
                >
                    &times;
                </button>

                <h2>Nova Categoria</h2>

                <form
                    onSubmit={(evento) => {
                        evento.preventDefault();
                        handleSalvar();
                    }}
                    className={styles.modalForm}
                >

                    <div className={styles.fieldGroup}>

                        <label htmlFor="nomeCategoria">
                            Nome da Categoria
                        </label>

                        <input
                            type="text"
                            id="nomeCategoria"
                            value={nome}
                            onChange={(evento) => setNome(evento.target.value)}
                            placeholder="Ex: Sobremesas, Entradas..."
                            autoFocus
                            disabled={salvando}
                        />

                    </div>

                    {erro && (
                        <div className={styles.erro}>
                            {erro}
                        </div>
                    )}

                    <div className={styles.modalActions}>

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
                                : 'Salvar Categoria'
                            }
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

