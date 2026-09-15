import React, { useState } from 'react';
import styles from './novoItem.module.css'; // Ajuste o caminho do seu CSS

export function NovoItem({ isOpen, onClose, onSave }) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Dados a serem enviados
    const novoItem = {
      nome,
      categoria,
      preco: parseFloat(preco),
      descricao,
      foto,
    };

    onSave(novoItem);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose}>
          &times;
        </button>

        <h2>Cadastrar Novo Item</h2>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {/* Upload de Foto */}
          <div className={styles.fieldGroup}>
            <label>Foto do Item</label>
            <div className={styles.imageUpload}>
              <input
                type="file"
                id="fotoItem"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
              <label htmlFor="fotoItem" className={styles.uploadPlaceholder}>
                {preview ? (
                  <img src={preview} alt="Pré-visualização" className={styles.previewImage} />
                ) : (
                  <span>📷 Clique para selecionar uma foto</span>
                )}
              </label>
            </div>
          </div>

          {/* Nome do Item */}
          <div className={styles.fieldGroup}>
            <label htmlFor="nome">Nome do Item</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: X-Burguer Especial"
              required
            />
          </div>

          {/* Categoria e Preço */}
          <div className={styles.formRow}>
            <div className={styles.fieldGroup}>
              <label htmlFor="categoria">Categoria</label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                <option value="lanches">Lanches</option>
                <option value="bebidas">Bebidas</option>
                <option value="sobremesas">Sobremesas</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="preco">Preço (R$)</label>
              <input
                type="number"
                id="preco"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          {/* Descrição */}
          <div className={styles.fieldGroup}>
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ingredientes e detalhes do prato..."
            />
          </div>

          {/* Ações */}
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnSave}>
              Salvar Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}