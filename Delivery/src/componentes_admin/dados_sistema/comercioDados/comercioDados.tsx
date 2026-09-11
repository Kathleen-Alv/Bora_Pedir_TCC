import { useEffect, useState } from 'react';
import styles from './comercioDados.module.css';

type Usuario = {
  id: number;
  nome: string;
  documento: string;
  tipo: 'Comércio';
  telefone: string;
  email: string;
  status: 'Aprovado' | 'Suspenso' | 'Inativo';
};

export function ComercioDados() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [pesquisa, setPesquisa] = useState('');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const usuariosPorPagina = 5;

  useEffect(() => {
    async function carregarComercios() {
      try {
        const resposta = await fetch(
          'http://localhost:3000/api/admin/comercios/cadastrados'
        );

        if (!resposta.ok) {
          throw new Error('Erro ao buscar dados dos comércios');
        }

        const dados = await resposta.json();
        setUsuarios(dados);
      } catch (erro) {
        console.error('Erro ao carregar comércios:', erro);
      }
    }

    carregarComercios();

    const intervalo = setInterval(() => {
      carregarComercios();
    }, 2000);

    return () => {
      clearInterval(intervalo);
    };
  }, []);

  function limparDocumento(valor: string) {
    return valor.replace(/\D/g, '');
  }

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const busca = limparDocumento(pesquisa);

    if (!busca) {
      return true;
    }

    const documento = limparDocumento(usuario.documento);

    return documento.includes(busca);
  });

  const totalPaginas = Math.ceil(
    usuariosFiltrados.length / usuariosPorPagina
  );

  const indiceInicial =
    (paginaAtual - 1) * usuariosPorPagina;

  const usuariosPagina = usuariosFiltrados.slice(
    indiceInicial,
    indiceInicial + usuariosPorPagina
  );

  function pesquisar(valor: string) {
    const valorNumerico = valor.replace(/\D/g, '');

    if (valorNumerico.length > 14) {
      return;
    }

    setPesquisa(valorNumerico);
    setPaginaAtual(1);
  }

  function fecharModal() {
    setUsuarioSelecionado(null);
  }

  function classeStatus(status: Usuario['status']) {
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
        <h1>Comércios cadastrados</h1>
        <p>Gerencie os comércios aprovados no sistema.</p>
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
            placeholder="Digite o CNPJ..."
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
          {pesquisa.length === 14 && 'CNPJ'}
        </span>
      </div>

      <div className={styles.lista}>
        <div className={styles.listaHeader}>
          <span>ID</span>
          <span>Nome</span>
          <span>CNPJ</span>
          <span>Tipo</span>
          <span>Status</span>
          <span></span>
        </div>

        {usuariosPagina.length > 0 ? (
          usuariosPagina.map((usuario) => (
            <button
              key={usuario.id}
              className={styles.linha}
              onClick={() =>
                setUsuarioSelecionado(usuario)
              }
            >
              <span className={styles.id}>
                #{usuario.id}
              </span>

              <span className={styles.nome}>
                {usuario.nome}
              </span>

              <span className={styles.documento}>
                {usuario.documento}
              </span>

              <span className={styles.tipo}>
                {usuario.tipo}
              </span>

              <span>
                <span
                  className={`${styles.status} ${classeStatus(
                    usuario.status
                  )}`}
                >
                  <span className={styles.ponto}>
                    ●
                  </span>

                  {usuario.status}
                </span>
              </span>

              <span className={styles.seta}>
                →
              </span>
            </button>
          ))
        ) : (
          <div className={styles.semResultado}>
            Nenhum comércio encontrado.
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
            { length: totalPaginas },
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
            disabled={
              paginaAtual === totalPaginas
            }
            onClick={() =>
              setPaginaAtual(paginaAtual + 1)
            }
          >
            →
          </button>
        </div>
      )}

      {usuarioSelecionado && (
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
                  {usuarioSelecionado.tipo}
                </span>

                <h2>
                  {usuarioSelecionado.nome}
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
                  #{usuarioSelecionado.id}
                </strong>
              </div>

              <div className={styles.informacao}>
                <span>Tipo de comércio</span>

                <strong>
                  {usuarioSelecionado.tipo}
                </strong>
              </div>

              <div className={styles.informacao}>
                <span>CNPJ</span>

                <strong>
                  {usuarioSelecionado.documento}
                </strong>
              </div>

              <div className={styles.informacao}>
                <span>Telefone</span>

                <strong>
                  {usuarioSelecionado.telefone}
                </strong>
              </div>

              <div className={styles.informacao}>
                <span>E-mail</span>

                <strong>
                  {usuarioSelecionado.email}
                </strong>
              </div>

              <div className={styles.informacao}>
                <span>Status</span>

                <strong>
                  <span
                    className={`${styles.status} ${classeStatus(
                      usuarioSelecionado.status
                    )}`}
                  >
                    <span className={styles.ponto}>
                      ●
                    </span>

                    {usuarioSelecionado.status}
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