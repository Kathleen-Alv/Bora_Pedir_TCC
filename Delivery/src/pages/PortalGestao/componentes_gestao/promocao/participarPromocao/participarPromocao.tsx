import { useMemo, useState } from 'react';
import styles from './participarPromocao.module.css';
import { useCardapio } from '../../Cardapio/hooks/useCardapio';
import { salvarPromocaoItem } from '../../Cardapio/api/cardapio.api';

interface ItemPromocaoRascunho {
  ativo: boolean;
  precoPromocional: string;
}

type PacoteAtivoTipo = 10 | 20 | 'categoria' | null;

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

function parsePreco(valorTexto: string): number {
  const limpo = valorTexto.replace(/[^\d,.-]/g, '').replace(',', '.');
  const numero = parseFloat(limpo);
  return Number.isNaN(numero) ? 0 : numero;
}

function calcularPrecoComDesconto(preco: number, percentual: number): number {
  const calculado = Number((preco * (1 - percentual / 100)).toFixed(2));
  return preco > 0.01 ? Math.max(0.01, calculado) : preco;
}

function temPromocaoNoBanco(
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

export function ParticiparPromocao() {
  const {
    categorias,
    itens,
    categoriaSelecionada,
    setCategoriaSelecionada,
    categoriaAtual,
    carregandoCategorias,
    carregandoItens,
    carregarItens,
    erro,
    setErro,
  } = useCardapio();

  const [busca, setBusca] = useState('');
  const [descontoCategoriaInput, setDescontoCategoriaInput] =
    useState<number>(15);
  const [pacoteSelecionado, setPacoteSelecionado] =
    useState<PacoteAtivoTipo>(null);
  const [promocoesRascunho, setPromocoesRascunho] = useState<
    Record<number, ItemPromocaoRascunho>
  >({});
  const [erroPrecoId, setErroPrecoId] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [removendoId, setRemovendoId] = useState<number | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // ================================================================
  // PRÉVIA DE IMPACTO DOS PACOTES DE 10% E 20%
  // ================================================================
  const resumoPacotes = useMemo(() => {
    if (itens.length === 0) {
      return {
        ticketMedioAtual: 0,
        ticketMedio10: 0,
        ticketMedio20: 0,
      };
    }

    const somaAtual = itens.reduce((acc, item) => acc + item.preco, 0);
    const soma10 = itens.reduce(
      (acc, item) => acc + calcularPrecoComDesconto(item.preco, 10),
      0
    );
    const soma20 = itens.reduce(
      (acc, item) => acc + calcularPrecoComDesconto(item.preco, 20),
      0
    );

    return {
      ticketMedioAtual: somaAtual / itens.length,
      ticketMedio10: soma10 / itens.length,
      ticketMedio20: soma20 / itens.length,
    };
  }, [itens]);

  // ================================================================
  // AUTOMAÇÃO 1 E 2: APLICAR PACOTE NO CARDÁPIO TODO (10% OU 20%)
  // ================================================================
  function aplicarPacoteCardapioTodo(percentual: 10 | 20) {
    // Se clicar novamente no pacote já ativo, limpa o rascunho (toggle)
    if (pacoteSelecionado === percentual) {
      limparTudo();
      return;
    }

    const novoMapa: Record<number, ItemPromocaoRascunho> = {};

    itens.forEach((item) => {
      const novoValor = calcularPrecoComDesconto(item.preco, percentual);
      novoMapa[item.id] = {
        ativo: true,
        precoPromocional: novoValor.toFixed(2).replace('.', ','),
      };
    });

    setPromocoesRascunho(novoMapa);
    setPacoteSelecionado(percentual);
    setErroPrecoId(null);
    setMensagemSucesso('');
  }

  // ================================================================
  // AUTOMAÇÃO 3: APLICAR PACOTE NA CATEGORIA SELECIONADA
  // ================================================================
  function aplicarPacoteCategoriaAtual(percentual: number) {
    const itensAlvo = categoriaSelecionada
      ? itens.filter(
          (item) => Number(item.categoriaId) === Number(categoriaSelecionada)
        )
      : itens;

    setPromocoesRascunho((prev) => {
      const atualizado = { ...prev };

      itensAlvo.forEach((item) => {
        const novoValor = calcularPrecoComDesconto(item.preco, percentual);
        atualizado[item.id] = {
          ativo: true,
          precoPromocional: novoValor.toFixed(2).replace('.', ','),
        };
      });

      return atualizado;
    });

    setPacoteSelecionado('categoria');
    setErroPrecoId(null);
    setMensagemSucesso('');
  }

  // ================================================================
  // ALTERAR SELEÇÃO INDIVIDUAL DO ITEM
  // ================================================================
  function alternarItemPromocao(
    itemId: number,
    precoOriginal: number,
    precoBanco?: number | null
  ) {
    setPacoteSelecionado(null);
    setPromocoesRascunho((prev) => {
      const atual = prev[itemId];
      const jaEstaNoBanco = temPromocaoNoBanco(precoOriginal, precoBanco);

      if (atual !== undefined) {
        const copia = { ...prev };
        delete copia[itemId];
        return copia;
      }

      if (jaEstaNoBanco) {
        return {
          ...prev,
          [itemId]: {
            ativo: false,
            precoPromocional: '',
          },
        };
      }

      const sugestao = calcularPrecoComDesconto(precoOriginal, 10);
      return {
        ...prev,
        [itemId]: {
          ativo: true,
          precoPromocional: sugestao.toFixed(2).replace('.', ','),
        },
      };
    });
    setMensagemSucesso('');
  }

  // ================================================================
  // REMOVER UM ITEM ESPECÍFICO DE PROMOÇÃO NO BANCO
  // ================================================================
  async function handleRemoverItemDePromocao(itemId: number) {
    try {
      setRemovendoId(itemId);
      setErro('');
      setMensagemSucesso('');

      await salvarPromocaoItem(itemId, null);
      await carregarItens();

      setPromocoesRascunho((prev) => {
        const copia = { ...prev };
        delete copia[itemId];
        return copia;
      });

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
  // REMOVER TODOS OS ITENS ATIVOS DA PROMOÇÃO (CATEGORIA OU TUDO)
  // ================================================================
  async function handleRemoverTodosDePromocao() {
    const itensParaRemover = itensExibidos.filter((item) =>
      temPromocaoNoBanco(item.preco, item.precoPromocional)
    );

    if (itensParaRemover.length === 0) return;

    try {
      setSalvando(true);
      setErro('');
      setMensagemSucesso('');

      await Promise.all(
        itensParaRemover.map((item) => salvarPromocaoItem(item.id, null))
      );

      await carregarItens();
      setPromocoesRascunho({});
      setPacoteSelecionado(null);
      setMensagemSucesso(
        `${itensParaRemover.length} item(ns) removido(s) da promoção!`
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível remover as promoções.'
      );
    } finally {
      setSalvando(false);
    }
  }

  // ================================================================
  // ALTERAR PREÇO PROMOCIONAL (BLOQUEIA AUMENTO DE PREÇO)
  // ================================================================
  function handleMudarPrecoPromocional(
    itemId: number,
    precoOriginal: number,
    valorDigitado: string
  ) {
    const valorNumerico = parsePreco(valorDigitado);
    setPacoteSelecionado(null);

    if (valorNumerico >= precoOriginal) {
      setErroPrecoId(itemId);
      const maximoPermitido = Number((precoOriginal - 0.01).toFixed(2));
      setPromocoesRascunho((prev) => ({
        ...prev,
        [itemId]: {
          ativo: true,
          precoPromocional:
            maximoPermitido > 0
              ? maximoPermitido.toFixed(2).replace('.', ',')
              : '0,01',
        },
      }));
      return;
    }

    setErroPrecoId(null);
    setMensagemSucesso('');
    setPromocoesRascunho((prev) => ({
      ...prev,
      [itemId]: {
        ativo: valorNumerico > 0,
        precoPromocional: valorDigitado,
      },
    }));
  }

  // ================================================================
  // CALCULAR PORCENTAGEM DE DESCONTO EM TEMPO REAL
  // ================================================================
  function calcularPorcentagem(
    precoOriginal: number,
    valorTexto?: string
  ): number {
    if (!valorTexto) return 0;
    const novoPreco = parsePreco(valorTexto);
    if (novoPreco <= 0 || novoPreco >= precoOriginal) return 0;
    return Math.round(((precoOriginal - novoPreco) / precoOriginal) * 100);
  }

  // ================================================================
  // FILTRAR ITENS POR CATEGORIA E BUSCA
  // ================================================================
  const itensExibidos = useMemo(() => {
    return itens.filter((item) => {
      const pertenceCategoria =
        categoriaSelecionada === null ||
        Number(item.categoriaId) === Number(categoriaSelecionada);
      const bateBusca = item.nome
        .toLowerCase()
        .includes(busca.trim().toLowerCase());

      return pertenceCategoria && bateBusca;
    });
  }, [itens, categoriaSelecionada, busca]);

  const qtdAtivosNoBancoExibidos = useMemo(() => {
    return itensExibidos.filter((item) =>
      temPromocaoNoBanco(item.preco, item.precoPromocional)
    ).length;
  }, [itensExibidos]);

  const totalAlteracoesPendentes = useMemo(() => {
    return Object.values(promocoesRascunho).filter(
      (p) => !p.ativo || parsePreco(p.precoPromocional) > 0
    ).length;
  }, [promocoesRascunho]);

  function limparTudo() {
    setPromocoesRascunho({});
    setPacoteSelecionado(null);
    setErroPrecoId(null);
    setMensagemSucesso('');
  }

  // ================================================================
  // SALVAR PROMOÇÕES NA API
  // ================================================================
  async function handlePublicarPromocoes() {
    if (totalAlteracoesPendentes === 0) return;

    try {
      setSalvando(true);
      setErro('');
      setMensagemSucesso('');

      const listaParaSalvar = Object.entries(promocoesRascunho)
        .filter(
          ([, dados]) => !dados.ativo || parsePreco(dados.precoPromocional) > 0
        )
        .map(([itemId, dados]) => ({
          itemId: Number(itemId),
          precoPromocional: dados.ativo
            ? parsePreco(dados.precoPromocional)
            : null,
        }));

      await Promise.all(
        listaParaSalvar.map((promo) =>
          salvarPromocaoItem(promo.itemId, promo.precoPromocional)
        )
      );

      await carregarItens();
      setPromocoesRascunho({});
      setPacoteSelecionado(null);
      setMensagemSucesso(
        `${listaParaSalvar.length} promoção(ões) atualizada(s) com sucesso!`
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar as promoções.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={styles.container}>
      {/* EXIBE ERRO SE A API FALHAR */}
      {erro && <div className={styles.mensagemErro}>{erro}</div>}

      {/* EXIBE FEEDBACK DE SUCESSO */}
      {mensagemSucesso && (
        <div className={styles.mensagemSucesso}>{mensagemSucesso}</div>
      )}

      {/* =====================================================
          3 CARDS DE AUTOMAÇÃO NO TOPO
      ===================================================== */}
      <section className={styles.pacotesGrid}>
        {/* CARD 1: 10% NO CARDÁPIO TODO */}
        <div
          className={`${styles.pacoteCard} ${
            pacoteSelecionado === 10 ? styles.pacoteCardAtivo : ''
          }`}
        >
          <div className={styles.pacoteTopo}>
            <span className={styles.pacoteBadge}>
              {pacoteSelecionado === 10 ? '✓ Ativo no rascunho' : 'Cardápio Todo'}
            </span>
            <span className={styles.pacoteDestaque}>-10%</span>
          </div>

          <h3>Pacote Esquenta Vendas</h3>
          <p>
            Aplica <strong>10% de desconto</strong> em todos os{' '}
            <strong>{itens.length} itens</strong>. Ideal para aumentar o giro
            diário preservando sua margem.
          </p>

          {itens.length > 0 && (
            <div className={styles.pacotePrevia}>
              <span>Preço médio:</span>{' '}
              <del>{formatarMoeda(resumoPacotes.ticketMedioAtual)}</del>{' '}
              <strong>{formatarMoeda(resumoPacotes.ticketMedio10)}</strong>
            </div>
          )}

          <button
            type="button"
            className={styles.btnPacote}
            onClick={() => aplicarPacoteCardapioTodo(10)}
            disabled={itens.length === 0}
          >
            {pacoteSelecionado === 10
              ? 'Cancelar pacote de 10%'
              : 'Aplicar 10% em tudo'}
          </button>
        </div>

        {/* CARD 2: 20% NO CARDÁPIO TODO */}
        <div
          className={`${styles.pacoteCard} ${styles.pacoteCardDestaque} ${
            pacoteSelecionado === 20 ? styles.pacoteCardAtivo : ''
          }`}
        >
          <div className={styles.pacoteTopo}>
            <span className={styles.pacoteBadgeDestaque}>
              {pacoteSelecionado === 20
                ? '✓ Ativo no rascunho'
                : 'Mais Convertido'}
            </span>
            <span className={styles.pacoteDestaque}>-20%</span>
          </div>

          <h3>Pacote Super Oferta</h3>
          <p>
            Aplica <strong>20% de desconto</strong> em todo o cardápio (
            <strong>{itens.length} itens</strong>) para maximizar pedidos e
            destaque no app.
          </p>

          {itens.length > 0 && (
            <div className={styles.pacotePrevia}>
              <span>Preço médio:</span>{' '}
              <del>{formatarMoeda(resumoPacotes.ticketMedioAtual)}</del>{' '}
              <strong>{formatarMoeda(resumoPacotes.ticketMedio20)}</strong>
            </div>
          )}

          <button
            type="button"
            className={styles.btnPacoteDestaque}
            onClick={() => aplicarPacoteCardapioTodo(20)}
            disabled={itens.length === 0}
          >
            {pacoteSelecionado === 20
              ? 'Cancelar pacote de 20%'
              : 'Aplicar 20% em tudo'}
          </button>
        </div>

        {/* CARD 3: PACOTE POR CATEGORIA SELECIONADA */}
        <div
          className={`${styles.pacoteCard} ${
            pacoteSelecionado === 'categoria' ? styles.pacoteCardAtivo : ''
          }`}
        >
          <div className={styles.pacoteTopo}>
            <span className={styles.pacoteBadge}>Por Categoria</span>
            <span className={styles.pacoteDestaque}>
              -{descontoCategoriaInput}%
            </span>
          </div>
          <h3>Oferta em {categoriaAtual?.nome || 'Todas as Categorias'}</h3>
          <p>
            Aplica desconto nos <strong>{itensExibidos.length} itens</strong>{' '}
            filtrados na categoria selecionada abaixo.
          </p>

          <div className={styles.pacoteCategoriaAcoes}>
            <select
              className={styles.selectPercentual}
              value={descontoCategoriaInput}
              onChange={(e) =>
                setDescontoCategoriaInput(Number(e.target.value))
              }
            >
              <option value={5}>-5%</option>
              <option value={10}>-10%</option>
              <option value={15}>-15%</option>
              <option value={20}>-20%</option>
              <option value={25}>-25%</option>
              <option value={30}>-30%</option>
            </select>

            <button
              type="button"
              className={styles.btnPacote}
              onClick={() =>
                aplicarPacoteCategoriaAtual(descontoCategoriaInput)
              }
              disabled={itensExibidos.length === 0}
            >
              Aplicar na categoria
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          BARRA DE BUSCA E RESUMO DE AÇÃO
      ===================================================== */}
      <div className={styles.barraControle}>
        <div className={styles.campoBusca}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Buscar nome do item para colocar em promoção..."
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

        <div className={styles.acoesSalvar}>
          {totalAlteracoesPendentes > 0 && (
            <button
              type="button"
              className={styles.btnLimparSelecao}
              onClick={limparTudo}
            >
              Desfazer ({totalAlteracoesPendentes})
            </button>
          )}

          <button
            type="button"
            className={styles.btnPublicar}
            disabled={totalAlteracoesPendentes === 0 || salvando}
            onClick={handlePublicarPromocoes}
          >
            {salvando
              ? 'Salvando...'
              : `Salvar Promoções (${totalAlteracoesPendentes})`}
          </button>
        </div>
      </div>

      {/* =====================================================
          CONTEÚDO PRINCIPAL: CATEGORIAS + LISTA DE ITENS
      ===================================================== */}
      <div className={styles.conteudo}>
        {/* LATERAL DE CATEGORIAS */}
        <aside className={styles.categoriasSidebar}>
          <div className={styles.tituloCategorias}>
            <h2>Categorias</h2>
          </div>

          <div className={styles.listaCategorias}>
            {/* OPÇÃO PARA VER TODAS */}
            <button
              type="button"
              className={`${styles.botaoCategoria} ${
                categoriaSelecionada === null ? styles.categoriaSelecionada : ''
              }`}
              onClick={() => setCategoriaSelecionada(null)}
            >
              <span className={styles.nomeCategoria}>Todas</span>
              <div className={styles.badgesCategoria}>
                <small>{itens.length}</small>
              </div>
            </button>

            {carregandoCategorias ? (
              <p className={styles.mensagemVazia}>Carregando...</p>
            ) : (
              categorias.map((cat) => {
                const qtdEmPromo = itens.filter((i) => {
                  if (Number(i.categoriaId) !== Number(cat.id)) return false;
                  const rascunho = promocoesRascunho[i.id];
                  if (rascunho !== undefined) return rascunho.ativo;
                  return temPromocaoNoBanco(i.preco, i.precoPromocional);
                }).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${styles.botaoCategoria} ${
                      Number(categoriaSelecionada) === Number(cat.id)
                        ? styles.categoriaSelecionada
                        : ''
                    }`}
                    onClick={() => setCategoriaSelecionada(cat.id)}
                  >
                    <span className={styles.nomeCategoria}>{cat.nome}</span>
                    <div className={styles.badgesCategoria}>
                      {qtdEmPromo > 0 && (
                        <span className={styles.badgePromoCat}>
                          {qtdEmPromo}
                        </span>
                      )}
                      <small>{cat.quantidade}</small>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ÁREA DOS ITENS DA CATEGORIA */}
        <section className={styles.areaItens}>
          <div className={styles.barraItensTopo}>
            <div>
              <strong>{categoriaAtual?.nome || 'Todos os itens'}</strong>
              <span> • Defina um valor menor que o preço atual</span>
            </div>

            <div className={styles.acoesBarraItens}>
              {qtdAtivosNoBancoExibidos > 0 && (
                <button
                  type="button"
                  className={styles.btnRemoverTodasPromocoes}
                  onClick={handleRemoverTodosDePromocao}
                  disabled={salvando}
                >
                  Remover todos de promoção ({qtdAtivosNoBancoExibidos})
                </button>
              )}

              <button
                type="button"
                className={styles.btnSelecionarCategoriaInteira}
                onClick={() => aplicarPacoteCategoriaAtual(10)}
                disabled={itensExibidos.length === 0}
              >
                Selecionar categoria toda (-10%)
              </button>
            </div>
          </div>

          <div className={styles.cabecalhoTabela}>
            <span>Item</span>
            <span>Preço Atual</span>
            <span>Preço Promocional</span>
          </div>

          <div className={styles.listaItens}>
            {carregandoItens ? (
              <div className={styles.mensagemVazia}>Carregando itens...</div>
            ) : itensExibidos.length === 0 ? (
              <div className={styles.mensagemVazia}>
                Nenhum item encontrado nesta categoria.
              </div>
            ) : (
              itensExibidos.map((item) => {
                const rascunho = promocoesRascunho[item.id];
                const salvoNoBanco = temPromocaoNoBanco(
                  item.preco,
                  item.precoPromocional
                );

                const estaAtivo =
                  rascunho !== undefined ? rascunho.ativo : salvoNoBanco;

                const valorExibidoInput =
                  rascunho !== undefined
                    ? rascunho.precoPromocional
                    : salvoNoBanco
                    ? item.precoPromocional!.toFixed(2).replace('.', ',')
                    : '';

                const porcentagem = estaAtivo
                  ? calcularPorcentagem(item.preco, valorExibidoInput)
                  : 0;

                return (
                  <div
                    key={item.id}
                    className={`${styles.itemRow} ${
                      estaAtivo ? styles.itemRowAtivo : ''
                    }`}
                  >
                    {/* COLUNA 1: CHECKBOX + FOTO + NOME */}
                    <div className={styles.itemInfo}>
                      <input
                        type="checkbox"
                        checked={estaAtivo}
                        onChange={() =>
                          alternarItemPromocao(
                            item.id,
                            item.preco,
                            item.precoPromocional
                          )
                        }
                      />

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
                        {estaAtivo && (
                          <span className={styles.tagSelecionado}>
                            Em promoção
                          </span>
                        )}
                      </div>
                    </div>

                    {/* COLUNA 2: PREÇO ORIGINAL */}
                    <div
                      className={`${styles.precoOriginal} ${
                        estaAtivo ? styles.precoRiscado : ''
                      }`}
                    >
                      {formatarMoeda(item.preco)}
                    </div>

                    {/* COLUNA 3: INPUT DO NOVO PREÇO + PORCENTAGEM + REMOVER */}
                    <div className={styles.precoPromoBox}>
                      <div className={styles.inputMoedaWrapper}>
                        <span>R$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder={item.preco.toFixed(2).replace('.', ',')}
                          value={valorExibidoInput}
                          onChange={(e) =>
                            handleMudarPrecoPromocional(
                              item.id,
                              item.preco,
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {porcentagem > 0 && (
                        <span className={styles.badgeDesconto}>
                          -{porcentagem}%
                        </span>
                      )}

                      {salvoNoBanco && (
                        <button
                          type="button"
                          className={styles.btnRemoverPromocao}
                          onClick={() => handleRemoverItemDePromocao(item.id)}
                          disabled={removendoId === item.id || salvando}
                          title="Remover item da promoção"
                        >
                          {removendoId === item.id
                            ? 'Removendo...'
                            : 'Remover de promoção'}
                        </button>
                      )}

                      {erroPrecoId === item.id && (
                        <span className={styles.avisoMenorPreco}>
                          Deve ser menor que o atual
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}