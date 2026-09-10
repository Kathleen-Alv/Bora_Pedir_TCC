import { useState } from 'react';

import styles from './comercioDados.module.css';

type Usuario = {
  id: number;
  nome: string;
  documento: string;
  tipo: 'Comércio' | 'Entregador';
  telefone: string;
  email: string;
  status: 'Ativo' | 'Suspenso' | 'Inativo';
};

const usuariosIniciais: Usuario[] = [
  {
    id: 1024,
    nome: 'Restaurante Sabor Bom',
    documento: '12.345.678/0001-90',
    tipo: 'Comércio',
    telefone: '(11) 99999-1111',
    email: 'saborbom@email.com',
    status: 'Ativo',
  },
  {
    id: 1025,
    nome: 'Pizzaria Central',
    documento: '98.765.432/0001-10',
    tipo: 'Comércio',
    telefone: '(11) 98888-2222',
    email: 'pizzaria@email.com',
    status: 'Suspenso',
  },
  {
    id: 1026,
    nome: 'João da Silva',
    documento: '123.456.789-00',
    tipo: 'Entregador',
    telefone: '(11) 97777-3333',
    email: 'joao@email.com',
    status: 'Ativo',
  },
  {
    id: 1027,
    nome: 'Carlos Oliveira',
    documento: '987.654.321-00',
    tipo: 'Entregador',
    telefone: '(11) 96666-4444',
    email: 'carlos@email.com',
    status: 'Inativo',
  },
  {
    id: 1028,
    nome: 'Burger House',
    documento: '45.678.901/0001-22',
    tipo: 'Comércio',
    telefone: '(11) 95555-5555',
    email: 'burger@email.com',
    status: 'Ativo',
  },
  {
    id: 1029,
    nome: 'Lanches do Bairro',
    documento: '34.567.890/0001-33',
    tipo: 'Comércio',
    telefone: '(11) 94444-6666',
    email: 'lanches@email.com',
    status: 'Ativo',
  },
  {
    id: 1030,
    nome: 'Pedro Santos',
    documento: '456.789.123-00',
    tipo: 'Entregador',
    telefone: '(11) 93333-7777',
    email: 'pedro@email.com',
    status: 'Suspenso',
  },
  {
    id: 1031,
    nome: 'Marcos Almeida',
    documento: '789.123.456-00',
    tipo: 'Entregador',
    telefone: '(11) 92222-8888',
    email: 'marcos@email.com',
    status: 'Ativo',
  },
  {
    id: 1032,
    nome: 'Cantina da Praça',
    documento: '23.456.789/0001-44',
    tipo: 'Comércio',
    telefone: '(11) 91111-9999',
    email: 'cantina@email.com',
    status: 'Inativo',
  },
  {
    id: 1033,
    nome: 'Felipe Rodrigues',
    documento: '321.654.987-00',
    tipo: 'Entregador',
    telefone: '(11) 90000-1111',
    email: 'felipe@email.com',
    status: 'Ativo',
  },
  {
    id: 1034,
    nome: 'Hamburgueria Brasil',
    documento: '56.789.012/0001-55',
    tipo: 'Comércio',
    telefone: '(11) 98888-4444',
    email: 'hamburgueria@email.com',
    status: 'Ativo',
  },
  {
    id: 1035,
    nome: 'Rafael Costa',
    documento: '654.321.987-00',
    tipo: 'Entregador',
    telefone: '(11) 97777-5555',
    email: 'rafael@email.com',
    status: 'Inativo',
  },
];

export function ComercioDados() {

  const [usuarios, setUsuarios] =
    useState<Usuario[]>(usuariosIniciais);

  const [pesquisa, setPesquisa] = useState('');

  const [usuarioSelecionado, setUsuarioSelecionado] =
    useState<Usuario | null>(null);

  const [paginaAtual, setPaginaAtual] = useState(1);

  const usuariosPorPagina = 5;


  /* =========================
     LIMPAR DOCUMENTO
  ========================= */

  function limparDocumento(valor: string) {
    return valor.replace(/\D/g, '');
  }


  /* =========================
     PESQUISA
  ========================= */

  const usuariosFiltrados = usuarios.filter((usuario) => {

    const busca = limparDocumento(pesquisa);

    if (!busca) {
      return true;
    }

    const documento =
      limparDocumento(usuario.documento);

    return documento.includes(busca);
  });


  /* =========================
     PAGINAÇÃO
  ========================= */

  const totalPaginas = Math.ceil(
    usuariosFiltrados.length / usuariosPorPagina
  );

  const indiceInicial =
    (paginaAtual - 1) * usuariosPorPagina;

  const usuariosPagina =
    usuariosFiltrados.slice(
      indiceInicial,
      indiceInicial + usuariosPorPagina
    );


  /* =========================
     ALTERAR PESQUISA
  ========================= */

  function pesquisar(valor: string) {

    const valorNumerico =
      valor.replace(/\D/g, '');

    // CPF = 11
    // CNPJ = 14

    if (valorNumerico.length > 14) {
      return;
    }

    setPesquisa(valorNumerico);

    setPaginaAtual(1);
  }


  /* =========================
     ALTERAR STATUS
  ========================= */

  function alterarStatus(
    novoStatus: Usuario['status']
  ) {

    if (!usuarioSelecionado) {
      return;
    }

    setUsuarios((usuariosAtuais) =>
      usuariosAtuais.map((usuario) =>
        usuario.id === usuarioSelecionado.id
          ? {
              ...usuario,
              status: novoStatus,
            }
          : usuario
      )
    );

    setUsuarioSelecionado({
      ...usuarioSelecionado,
      status: novoStatus,
    });
  }


  /* =========================
     FECHAR MODAL
  ========================= */

  function fecharModal() {
    setUsuarioSelecionado(null);
  }


  return (

    <div className={styles.container}>

      {/* =========================
          TOPO
      ========================= */}

      <div className={styles.topo}>

        <h1>
          Usuários cadastrados
        </h1>

        <p>
          Gerencie os comércios e entregadores aprovados.
        </p>

      </div>


      {/* =========================
          PESQUISA
      ========================= */}

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
            placeholder="Digite o CPF ou CNPJ..."
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

          {pesquisa.length === 14 && 'CNPJ'}

        </span>

      </div>


      {/* =========================
          LISTA
      ========================= */}

      <div className={styles.lista}>

        {/* CABEÇALHO */}

        <div className={styles.listaHeader}>

          <span>ID</span>

          <span>Nome</span>

          <span>CPF / CNPJ</span>

          <span>Tipo</span>

          <span>Status</span>

          <span></span>

        </div>


        {/* USUÁRIOS */}

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
                  className={`${styles.status} ${
                    usuario.status === 'Ativo'
                      ? styles.ativo
                      : usuario.status === 'Suspenso'
                      ? styles.suspenso
                      : styles.inativo
                  }`}
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
            Nenhum usuário encontrado.
          </div>

        )}

      </div>


      {/* =========================
          PAGINAÇÃO
      ========================= */}

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
            disabled={paginaAtual === totalPaginas}
            onClick={() =>
              setPaginaAtual(paginaAtual + 1)
            }
          >
            →
          </button>

        </div>

      )}


      {/* =========================
          MODAL
      ========================= */}

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

            {/* TOPO MODAL */}

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


            {/* INFORMAÇÕES */}

            <div className={styles.informacoes}>

              <div className={styles.informacao}>

                <span>
                  ID
                </span>

                <strong>
                  #{usuarioSelecionado.id}
                </strong>

              </div>


              <div className={styles.informacao}>

                <span>
                  Tipo de usuário
                </span>

                <strong>
                  {usuarioSelecionado.tipo}
                </strong>

              </div>


              <div className={styles.informacao}>

                <span>
                  CPF / CNPJ
                </span>

                <strong>
                  {usuarioSelecionado.documento}
                </strong>

              </div>


              <div className={styles.informacao}>

                <span>
                  Telefone
                </span>

                <strong>
                  {usuarioSelecionado.telefone}
                </strong>

              </div>


              <div className={styles.informacao}>

                <span>
                  E-mail
                </span>

                <strong>
                  {usuarioSelecionado.email}
                </strong>

              </div>

            </div>


            {/* STATUS */}

            <div className={styles.controleStatus}>

              <span>
                Status da conta
              </span>

              <div className={styles.botoesStatus}>

                <button
                  className={
                    usuarioSelecionado.status === 'Ativo'
                      ? styles.statusSelecionado
                      : ''
                  }
                  onClick={() =>
                    alterarStatus('Ativo')
                  }
                >
                  Ativo
                </button>


                <button
                  className={
                    usuarioSelecionado.status === 'Suspenso'
                      ? styles.statusSelecionado
                      : ''
                  }
                  onClick={() =>
                    alterarStatus('Suspenso')
                  }
                >
                  Suspenso
                </button>


                <button
                  className={
                    usuarioSelecionado.status === 'Inativo'
                      ? styles.statusSelecionado
                      : ''
                  }
                  onClick={() =>
                    alterarStatus('Inativo')
                  }
                >
                  Inativo
                </button>

              </div>

            </div>


            {/* RODAPÉ */}

            <div className={styles.modalRodape}>

              <button
                className={styles.botaoFechar}
                onClick={fecharModal}
              >
                Fechar
              </button>

              <button
                className={styles.botaoSalvar}
                onClick={fecharModal}
              >
                Salvar alterações
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}