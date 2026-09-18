import { useEffect, useState } from 'react';
import styles from './entregadorDados.module.css';

type Entregador = {
  id: number;
  nome: string;
  documento: string;
  tipo: 'Entregador';
  telefone: string;
  email: string;
  status: 'Aprovado' | 'Suspenso' | 'Inativo';
  cnh?: string;
  data_nascimento?: string;
  placa?: string;
};

export function EntregadorDados() {
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [pesquisa, setPesquisa] = useState('');
  const [entregadorSelecionado, setEntregadorSelecionado] = useState<Entregador | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const entregadoresPorPagina = 5;

  useEffect(() => {
    async function carregarEntregadores() {
      try {
        const resposta = await fetch(
          'http://localhost:3000/api/admin/entregadores/cadastrados'
        );

        if (!resposta.ok) {
          throw new Error('Erro ao buscar dados dos entregadores');
        }

        const dados = await resposta.json();
        setEntregadores(dados);
      } catch (erro) {
        console.error('Erro ao carregar entregadores:', erro);
      }
    }

    carregarEntregadores();

    const intervalo = setInterval(() => {
      carregarEntregadores();
    }, 2000);

    return () => {
      clearInterval(intervalo);
    };
  }, []);

  function limparDocumento(valor: string) {
    return valor.replace(/\D/g, '');
  }

  const entregadoresFiltrados = entregadores.filter((entregador) => {
    const busca = limparDocumento(pesquisa);

    if (!busca) {
      return true;
    }

    const documento = limparDocumento(entregador.documento);

    return documento.includes(busca);
  });

  const totalPaginas = Math.ceil(
    entregadoresFiltrados.length / entregadoresPorPagina
  );

  const indiceInicial =
    (paginaAtual - 1) * entregadoresPorPagina;

  const entregadoresPagina = entregadoresFiltrados.slice(
    indiceInicial,
    indiceInicial + entregadoresPorPagina
  );

  function pesquisar(valor: string) {
    const valorNumerico = valor.replace(/\D/g, '');

    if (valorNumerico.length > 11) {
      return;
    }

    setPesquisa(valorNumerico);
    setPaginaAtual(1);
  }

  function fecharModal() {
    setEntregadorSelecionado(null);
  }

  function classeStatus(status: Entregador['status']) {
    if (status === 'Aprovado') {
      return styles.aprovado;
    }

    if (status === 'Suspenso') {
      return styles.suspenso;
    }

    return styles.inativo;
  }

  return (
    <div className={styles.container}>
      <div className={styles.topo}>
        <h1>Entregadores cadastrados</h1>
        <p>Gerencie os entregadores aprovados no sistema.</p>
      </div>

      <div className={styles.pesquisaContainer}>
        <div className={styles.campoPesquisa}>
          <span className={styles.lupa}>
            🔍
          </span>

          <input
            type="text"
            value={pesquisa}
            onChange={(event) =>
              pesquisar(event.target.value)
            }
            placeholder="Digite o CPF..."
            inputMode="numeric"
          />

          {pesquisa && (
            <button
              className={styles.limparPesquisa}
              onClick={() => pesquisar('')}
            >
              ×
            </button>
          )}
        </div>

        <span className={styles.infoPesquisa}>
          {pesquisa.length === 11 && 'CPF'}
        </span>
      </div>

      <div className={styles.lista}>
        <div className={styles.listaHeader}>
          <span>ID</span>
          <span>Nome</span>
          <span>CPF</span>
          <span>Tipo</span>
          <span>Status</span>
          <span></span>
        </div>

        {entregadoresPagina.length > 0 ? (
          entregadoresPagina.map((entregador) => (
            <button
              key={entregador.id}
              className={styles.linha}
              onClick={() =>
                setEntregadorSelecionado(entregador)
              }
            >
              <span className={styles.id}>
                #{entregador.id}
              </span>

              <span className={styles.nome}>
                {entregador.nome}
              </span>

              <span className={styles.documento}>
                {entregador.documento}
              </span>

              <span className={styles.tipo}>
                {entregador.tipo}
              </span>

              <span>
                <span
                  className={`${styles.status} ${classeStatus(
                    entregador.status
                  )}`}
                >
                  <span className={styles.ponto}>
                    ●
                  </span>

                  {entregador.status}
                </span>
              </span>

              <span className={styles.seta}>
                →
              </span>
            </button>
          ))
        ) : (
          <div className={styles.semResultado}>
            Nenhum entregador encontrado.
          </div>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className={styles.paginacao}>
          <button
            className={styles.paginaSeta}
            disabled={paginaAtual === 1}
            onClick={() =>
              setPaginaAtual(paginaAtual - 1)
            }
          >
            ←
          </button>

          {Array.from(
            {
              length: totalPaginas
            },
            (_, index) => index + 1
          ).map((pagina) => (
            <button
              key={pagina}
              className={`${styles.pagina} ${
                paginaAtual === pagina
                  ? styles.paginaAtiva
                  : ''
              }`}
              onClick={() =>
                setPaginaAtual(pagina)
              }
            >
              {pagina}
            </button>
          ))}

          <button
            className={styles.paginaSeta}
            disabled={paginaAtual === totalPaginas}
            onClick={() =>
              setPaginaAtual(paginaAtual + 1)
            }
          >
            →
          </button>
        </div>
      )}

      {entregadorSelecionado && (
        <div
          className={styles.modalOverlay}
          onClick={fecharModal}
        >
          <div
            className={styles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className={styles.modalTopo}>
              <div>
                <span className={styles.modalCategoria}>
                  {entregadorSelecionado.tipo}
                </span>

                <h2>
                  {entregadorSelecionado.nome}
                </h2>
              </div>

              <button
                className={styles.fechar}
                onClick={fecharModal}
              >
                ×
              </button>
            </div>

            <div className={styles.informacoes}>
              <div className={styles.informacao}>
                <span>ID</span>

                <strong>
                  #{entregadorSelecionado.id}
                </strong>
              </div>

              <div className={styles.informacao}>
                <span>Tipo de usuário</span>

                <strong>
                  {entregadorSelecionado.tipo}
                </strong>
              </div>

              <div className={styles.informacao}>
                <span>CPF</span>

                <strong>
                  {entregadorSelecionado.documento}
                </strong>
              </div>

              <div className={styles.informacao}>
                <span>CNH</span>

                <strong>
                  {entregadorSelecionado.cnh ||
                    'Não informado'}
                </strong>
              </div>

              <div className={styles.informacao}>
                <span>Data de nascimento</span>

                <strong>
                  {entregadorSelecionado.data_nascimento ||
                    'Não informado'}
                </strong>
              </div>

              <div className={styles.informacao}>
                <span>Placa</span>

                <strong>
                  {entregadorSelecionado.placa ||
                    'Não informado'}
                </strong>
              </div>

              <div className={styles.informacao}>
                <span>E-mail</span>

                <strong>
                  {entregadorSelecionado.email}
                </strong>
              </div>

              <div className={styles.informacao}>
                <span>Telefone</span>

                <strong>
                  {entregadorSelecionado.telefone}
                </strong>
              </div>

              <div className={styles.informacao}>
                <span>Status</span>

                <strong>
                  <span
                    className={`${styles.status} ${classeStatus(
                      entregadorSelecionado.status
                    )}`}
                  >
                    <span className={styles.ponto}>
                      ●
                    </span>

                    {entregadorSelecionado.status}
                  </span>
                </strong>
              </div>
            </div>

            <div className={styles.modalRodape}>
              <button
                className={styles.botaoFechar}
                onClick={fecharModal}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}