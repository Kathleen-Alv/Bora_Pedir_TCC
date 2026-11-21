import { useMemo, useState } from 'react';
import styles from './minhaPromocao.module.css';
import { useCardapio } from '../../Cardapio/hooks/useCardapio';
import { salvarPromocaoItem } from '../../Cardapio/api/cardapio.api';

function montarUrlImagem(imagem: string | null | undefined): string | null {
  if (!imagem) return null;
  if (
    imagem.startsWith('http://') ||
    imagem.startsWith('https://') ||
    imagem.startsWith('blob:') ||
    imagem.startsWith('data:')
  ) {
    return imagem;
  }
  return `http://localhost:3000${imagem.startsWith('/') ? imagem : `/${imagem}`}`;
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function temPromocaoAtiva(
  preco: number,
  precoPromocional?: number | null
): boolean {
  return (
    precoPromocional !== null &&
    precoPromocional !== undefined &&
    precoPromocional > 0 &&
    precoPromocional < preco
  );
}

export function MinhaPromocao() {
  const {
    categorias,
    itens,
    carregandoItens,
    carregarItens,
    erro,
    setErro,
  } = useCardapio();

  const [busca, setBusca] = useState('');
  const [removendoId, setRemovendoId] = useState<number | null>(null);
  const [removendoTodos, setRemovendoTodos] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // ================================================================
  // MAPA DE CATEGORIAS PARA EXIBIR O NOME DA CATEGORIA NO ITEM
  // ================================================================
  const mapaCategorias = useMemo(() => {
    const mapa: Record<number, string> = {};
    categorias.forEach((cat) => {
      mapa[Number(cat.id)] = cat.nome;
    });
    return mapa;
  }, [categorias]);

  // ================================================================
  // FILTRAR SOMENTE ITENS EM PROMOÇÃO ATIVA
  // ================================================================
  const itensEmPromocao = useMemo(() => {
    return itens.filter((item) => {
      const ativo = temPromocaoAtiva(item.preco, item.precoPromocional);
      if (!ativo) return false;

      if (!busca.trim()) return true;
      return item.nome.toLowerCase().includes(busca.trim().toLowerCase());
    });
  }, [itens, busca]);

  // ================================================================
  // REMOVER UM ITEM ESPECÍFICO DE PROMOÇÃO
  // ================================================================
  async function handleRemoverItemDePromocao(itemId: number) {
    try {
      setRemovendoId(itemId);
      setErro('');
      setMensagemSucesso('');

      await salvarPromocaoItem(itemId, null);
      await carregarItens();

      setMensagemSucesso('Item removido da promoção com sucesso!');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível remover o item da promoção.'
      );
    } finally {
      setRemovendoId(null);
    }
  }

  // ================================================================
  // REMOVER TODOS OS ITENS EM PROMOÇÃO
  // ================================================================
  async function handleRemoverTodosDePromocao() {
    if (itensEmPromocao.length === 0) return;

    try {
      setRemovendoTodos(true);
      setErro('');
      setMensagemSucesso('');

      for (const item of itensEmPromocao) {
        await salvarPromocaoItem(item.id, null);
      }

      await carregarItens();
      setMensagemSucesso('Todas as promoções foram removidas com sucesso!');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível remover as promoções.'
      );
    } finally {
      setRemovendoTodos(false);
    }
  }

  return (
    <div className={styles.container}>
      {erro && <div className={styles.mensagemErro}>{erro}</div>}

      {mensagemSucesso && (
        <div className={styles.mensagemSucesso}>{mensagemSucesso}</div>
      )}

      {/* =====================================================
          BARRA SUPERIOR: CONTADOR + BUSCA + REMOVER TODOS
      ===================================================== */}
      <div className={styles.barraTopo}>
        <div className={styles.resumoTopo}>
          <h2>Itens em promoção ativa</h2>
          <span className={styles.contadorBadge}>
            {itensEmPromocao.length}{' '}
            {itensEmPromocao.length === 1 ? 'item' : 'itens'}
          </span>
        </div>

        <div className={styles.acoesTopo}>
          <div className={styles.campoBusca}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Buscar item em promoção..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            {busca && (
              <button
                type="button"
                className={styles.btnLimparBusca}
                onClick={() => setBusca('')}
              >
                ✕
              </button>
            )}
          </div>

          {itensEmPromocao.length > 0 && (
            <button
              type="button"
              className={styles.btnRemoverTodos}
              onClick={handleRemoverTodosDePromocao}
              disabled={removendoTodos || removendoId !== null}
            >
              {removendoTodos
                ? 'Removendo...'
                : 'Remover todos de promoção'}
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          LISTA DE ITENS EM PROMOÇÃO
      ===================================================== */}
      <section className={styles.cardLista}>
        <div className={styles.cabecalhoTabela}>
          <span>Item</span>
          <span>Preço Original</span>
          <span>Preço Promocional</span>
          <span>Ação</span>
        </div>

        {carregandoItens ? (
          <div className={styles.estadoVazio}>
            Carregando promoções ativas...
          </div>
        ) : itensEmPromocao.length === 0 ? (
          <div className={styles.estadoVazio}>
            <span className={styles.iconeVazio}>🏷️</span>
            <strong>Nenhum item em promoção no momento</strong>
            <p>
              Vá até a aba <strong>Participar de Promoção</strong> para aplicar
              descontos nos seus produtos.
            </p>
          </div>
        ) : (
          <div className={styles.listaItens}>
            {itensEmPromocao.map((item) => {
              const precoPromo = item.precoPromocional!;
              const percentualDesconto = Math.round(
                ((item.preco - precoPromo) / item.preco) * 100
              );
              const nomeCategoria =
                mapaCategorias[Number(item.categoriaId)] || 'Sem categoria';

              return (
                <div key={item.id} className={styles.itemRow}>
                  {/* COLUNA 1: FOTO + NOME + CATEGORIA */}
                  <div className={styles.itemInfo}>
                    {item.imagem ? (
                      <img
                        src={montarUrlImagem(item.imagem) || ''}
                        alt={item.nome}
                        className={styles.itemImg}
                      />
                    ) : (
                      <div className={styles.itemImgVazia}>🍔</div>
                    )}

                    <div className={styles.itemTextos}>
                      <span className={styles.itemNome}>{item.nome}</span>
                      <span className={styles.itemCategoria}>
                        {nomeCategoria}
                      </span>
                    </div>
                  </div>

                  {/* COLUNA 2: PREÇO ORIGINAL RISCADO */}
                  <div className={styles.precoOriginal}>
                    {formatarMoeda(item.preco)}
                  </div>

                  {/* COLUNA 3: PREÇO PROMOCIONAL + SELO DE DESCONTO */}
                  <div className={styles.precoPromoArea}>
                    <strong className={styles.precoPromocional}>
                      {formatarMoeda(precoPromo)}
                    </strong>
                    <span className={styles.badgeDesconto}>
                      -{percentualDesconto}%
                    </span>
                  </div>

                  {/* COLUNA 4: BOTÃO REMOVER DE PROMOÇÃO */}
                  <div className={styles.acaoArea}>
                    <button
                      type="button"
                      className={styles.btnRemoverPromocao}
                      onClick={() => handleRemoverItemDePromocao(item.id)}
                      disabled={removendoId === item.id || removendoTodos}
                    >
                      {removendoId === item.id
                        ? 'Removendo...'
                        : 'Remover de promoção'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}