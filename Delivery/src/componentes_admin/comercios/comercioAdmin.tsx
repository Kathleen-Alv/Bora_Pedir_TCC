import { useEffect, useState } from 'react';

import styles from './comercioAdmin.module.css';

type Cadastro = {
  id: number;
  usuario_id: number;
  nome_responsavel: string;
  cnpj: string;
  telefone: string;
  situacao_cadastral:
    | 'PENDENTE'
    | 'APROVADO'
    | 'SUSPENSO'
    | 'INATIVO';
  criado_em: string;
  atualizado_em: string;
};

export function ComerciosAdmin() {
  const [cadastros, setCadastros] = useState<Cadastro[]>([]);

  const [cadastroSelecionado, setCadastroSelecionado] =
    useState<Cadastro | null>(null);

  const [modoRejeicao, setModoRejeicao] = useState(false);

  const [motivoRejeicao, setMotivoRejeicao] = useState('');

  const [carregando, setCarregando] = useState(true);

  const [erro, setErro] = useState(false);

  // =========================
  // BUSCAR COMÉRCIOS
  // =========================

  useEffect(() => {
    async function buscarComercios() {
      try {
        setCarregando(true);

        const resposta = await fetch(
          'http://localhost:3000/api/admin/comercios'
        );

        if (!resposta.ok) {
          throw new Error('Erro ao buscar comércios');
        }

        const dados: Cadastro[] = await resposta.json();

        setCadastros(dados);
        setErro(false);

      } catch (erro) {
        console.error('Erro ao carregar comércios:', erro);

        setErro(true);

      } finally {
        setCarregando(false);
      }
    }

    buscarComercios();
  }, []);

  // =========================
  // APROVAR
  // =========================

  function aprovarCadastro() {
    if (!cadastroSelecionado) return;

    setCadastros((cadastrosAtuais) =>
      cadastrosAtuais.filter(
        (cadastro) =>
          cadastro.id !== cadastroSelecionado.id
      )
    );

    setCadastroSelecionado(null);
  }

  // =========================
  // ABRIR REJEIÇÃO
  // =========================

  function abrirRejeicao() {
    setModoRejeicao(true);
  }

  // =========================
  // CANCELAR REJEIÇÃO
  // =========================

  function cancelarRejeicao() {
    setModoRejeicao(false);
    setMotivoRejeicao('');
  }

  // =========================
  // REJEITAR
  // =========================

  function rejeitarCadastro() {
    if (!cadastroSelecionado) return;

    if (!motivoRejeicao.trim()) return;

    setCadastros((cadastrosAtuais) =>
      cadastrosAtuais.filter(
        (cadastro) =>
          cadastro.id !== cadastroSelecionado.id
      )
    );

    setCadastroSelecionado(null);

    setModoRejeicao(false);

    setMotivoRejeicao('');
  }

  // =========================
  // FECHAR MODAL
  // =========================

  function fecharModal() {
    setCadastroSelecionado(null);

    setModoRejeicao(false);

    setMotivoRejeicao('');
  }

  // =========================
  // FORMATA DATA
  // =========================

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  // =========================
  // CARREGANDO
  // =========================

  if (carregando) {
    return (
      <div className={styles.container}>
        <div className={styles.topo}>
          <div>
            <h1>Análise de Comércios</h1>

            <p>
              Analise os cadastros enviados pelos comércios.
            </p>
          </div>
        </div>

        <p>Carregando cadastros...</p>
      </div>
    );
  }

  // =========================
  // ERRO
  // =========================

  if (erro) {
    return (
      <div className={styles.container}>
        <div className={styles.topo}>
          <div>
            <h1>Análise de Comércios</h1>

            <p>
              Analise os cadastros enviados pelos comércios.
            </p>
          </div>
        </div>

        <p>
          Não foi possível carregar os cadastros.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      {/* =========================
          TOPO
      ========================= */}

      <div className={styles.topo}>

        <div>
          <h1>Análise de Comércios</h1>

          <p>
            Analise os cadastros enviados pelos comércios.
          </p>
        </div>

      </div>

      {/* =========================
          LISTA
      ========================= */}

      <div className={styles.lista}>

        <div className={styles.listaHeader}>

          <span>ID</span>

          <span>Responsável</span>

          <span>Status</span>

          <span>Data</span>

          <span></span>

        </div>

        {cadastros.length === 0 ? (

          <div>
            <p>
              Não existem cadastros pendentes.
            </p>
          </div>

        ) : (

          cadastros.map((cadastro) => (

            <button
              key={cadastro.id}
              className={styles.linha}
              onClick={() =>
                setCadastroSelecionado(cadastro)
              }
            >

              <span className={styles.id}>
                #{cadastro.id}
              </span>

              <span className={styles.nome}>
                {cadastro.nome_responsavel}
              </span>

              <span>

                <span
                  className={`${styles.status} ${
                    cadastro.situacao_cadastral ===
                    'PENDENTE'
                      ? styles.pendente
                      : cadastro.situacao_cadastral ===
                        'APROVADO'
                      ? styles.aprovado
                      : styles.rejeitado
                  }`}
                >
                  {cadastro.situacao_cadastral}
                </span>

              </span>

              <span className={styles.data}>
                {formatarData(cadastro.criado_em)}
              </span>

              <span className={styles.seta}>
                →
              </span>

            </button>

          ))

        )}

      </div>

      {/* =========================
          MODAL
      ========================= */}

      {cadastroSelecionado && (

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

            {/* =========================
                TOPO MODAL
            ========================= */}

            <div className={styles.modalTopo}>

              <div>

                <span className={styles.modalCategoria}>
                  COMÉRCIO
                </span>

                <h2>
                  {cadastroSelecionado.nome_responsavel}
                </h2>

              </div>

              <button
                className={styles.fechar}
                onClick={fecharModal}
              >
                ×
              </button>

            </div>

            {/* =========================
                STATUS
            ========================= */}

            <div className={styles.modalStatus}>

              <span>
                ID: #{cadastroSelecionado.id}
              </span>

              <span
                className={`${styles.status} ${
                  cadastroSelecionado.situacao_cadastral ===
                  'PENDENTE'
                    ? styles.pendente
                    : cadastroSelecionado.situacao_cadastral ===
                      'APROVADO'
                    ? styles.aprovado
                    : styles.rejeitado
                }`}
              >
                {cadastroSelecionado.situacao_cadastral}
              </span>

            </div>

            {/* =========================
                INFORMAÇÕES
            ========================= */}

            <div className={styles.informacoes}>

              <div className={styles.informacao}>

                <span>
                  Responsável
                </span>

                <strong>
                  {cadastroSelecionado.nome_responsavel}
                </strong>

              </div>

              <div className={styles.informacao}>

                <span>
                  CNPJ
                </span>

                <strong>
                  {cadastroSelecionado.cnpj}
                </strong>

              </div>

              <div className={styles.informacao}>

                <span>
                  Telefone
                </span>

                <strong>
                  {cadastroSelecionado.telefone}
                </strong>

              </div>

              <div className={styles.informacao}>

                <span>
                  Data do cadastro
                </span>

                <strong>
                  {formatarData(
                    cadastroSelecionado.criado_em
                  )}
                </strong>

              </div>

            </div>

            {/* =========================
                REJEIÇÃO
            ========================= */}

            {modoRejeicao && (

              <div className={styles.rejeicao}>

                <label htmlFor="motivo">
                  Motivo da rejeição
                </label>

                <textarea
                  id="motivo"
                  value={motivoRejeicao}
                  onChange={(event) =>
                    setMotivoRejeicao(
                      event.target.value
                    )
                  }
                  placeholder="Informe o motivo da rejeição..."
                />

                <div className={styles.acoesRejeicao}>

                  <button
                    className={styles.botaoCancelar}
                    onClick={cancelarRejeicao}
                  >
                    Cancelar
                  </button>

                  <button
                    className={
                      styles.botaoConfirmarRejeicao
                    }
                    onClick={rejeitarCadastro}
                    disabled={
                      !motivoRejeicao.trim()
                    }
                  >
                    Confirmar rejeição
                  </button>

                </div>

              </div>

            )}

            {/* =========================
                AÇÕES
            ========================= */}

            {!modoRejeicao &&
              cadastroSelecionado.situacao_cadastral ===
                'PENDENTE' && (

                <div className={styles.acoes}>

                  <button
                    className={styles.botaoRejeitar}
                    onClick={abrirRejeicao}
                  >
                    Rejeitar
                  </button>

                  <button
                    className={styles.botaoAprovar}
                    onClick={aprovarCadastro}
                  >
                    Aprovar
                  </button>

                </div>

              )}

          </div>

        </div>

      )}

    </div>
  );
}