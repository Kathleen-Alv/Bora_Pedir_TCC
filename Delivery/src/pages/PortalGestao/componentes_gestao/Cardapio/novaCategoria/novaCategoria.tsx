import React, { useState } from 'react';
import styles from './NovaCategoria.module.css';

interface NovaCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nomeCategoria: string) => void;
}

export function NovaCategoria({ isOpen, onClose, onSave }: NovaCategoriaProps) {
  const [nome, setNome] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    onSave(nome.trim());
    setNome('');
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose}>
          &times;
        </button>

        <h2>Nova Categoria</h2>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.fieldGroup}>
            <label htmlFor="nomeCategoria">Nome da Categoria</label>
            <input
              type="text"
              id="nomeCategoria"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Sobremesas, Entradas..."
              autoFocus
              required
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnSave}>
              Salvar Categoria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}