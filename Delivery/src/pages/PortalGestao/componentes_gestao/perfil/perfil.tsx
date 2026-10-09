import styles from "./perfil.module.css";

import categoria from "../../../../assets/perfil/categoria.png";
import editar from "../../../../assets/perfil/editar.png";
import editar_foto from "../../../../assets/perfil/editar_foto.png";
import endereco from "../../../../assets/perfil/endereco.png";
import estrelas from "../../../../assets/perfil/estrelas.png";
import horario from "../../../../assets/perfil/horario.png";
import bannerDadosBancarios from "../../../../assets/perfil/bannerDadosBancarios.png";
import imagemInformacaoConta from "../../../../assets/perfil/informaçãoDaConta.png";

// ========================================================
// ÍCONE EDITAR
// ========================================================

function EditarImg() {
return ( <img
   src={editar}
   className={styles.imgDeIcone}
   alt="Editar"
   title="Editar"
   draggable={false}
 />
);
}

// ========================================================
// ÍCONE ENDEREÇO
// ========================================================

function EnderecoIcon() {
return ( <img
   src={endereco}
   className={styles.imgDeIcone}
   alt="Endereço"
   draggable={false}
 />
);
}

// ========================================================
// ÍCONE HORÁRIO
// ========================================================

function HorarioIcon() {
return ( <img
   src={horario}
   className={styles.imgDeIcone}
   alt="Horário"
   draggable={false}
 />
);
}

// ========================================================
// ÍCONE CATEGORIA
// ========================================================

function CategoriaIcon() {
return ( <img
   src={categoria}
   className={styles.imgDeIcone}
   alt="Categoria"
   draggable={false}
 />
);
}

// ========================================================
// ÍCONE ESTRELAS
// ========================================================

function EstrelasIcon() {
return ( <img
   src={estrelas}
   className={styles.imgDeIcone}
   alt="Avaliação"
   draggable={false}
 />
);
}

// ========================================================
// ÍCONE EDITAR FOTO
// ========================================================

function EditarFotoIcon() {
return ( <img
   src={editar_foto}
   className={styles.imgDeIcone}
   alt="Editar foto"
   draggable={false}
 />
);
}

// ========================================================
// BANNER DADOS BANCÁRIOS
// ========================================================

function BannerDadosBancarios() {
return ( <img
   src={bannerDadosBancarios}
   className={styles.bannerDadosBancarios}
   alt="Banner de dados bancários"
   draggable={false}
 />
);
}

// ========================================================
// IMAGEM INFORMAÇÕES DA CONTA
// ========================================================

function ImagemInformacaoConta() {
return ( <img
   src={imagemInformacaoConta}
   className={styles.imagemInformacaoConta}
   alt="Banner de informações da conta"
   draggable={false}
 />
);
}

// ========================================================
// PERFIL
// ========================================================

export function Perfil() {
function handleAlterarInformacoes() {
// Implementar abertura do formulário de alteração.
}

function handleExcluirConta() {
// Implementar confirmação e solicitação
// de exclusão lógica da conta.
}

return ( <main className={styles.page}>
{/* =====================================================
PERFIL DO ESTABELECIMENTO
===================================================== */}


  <div className={styles.profileContainer}>
    <section className={styles.header}>
      <div className={styles.profileCircle}>
        <div className={styles.circleEdit}>
          <EditarFotoIcon />
        </div>
      </div>

      <div className={styles.headerEdit}>
        <EditarFotoIcon />
      </div>
    </section>

    {/* INFORMAÇÕES DO ESTABELECIMENTO */}

    <section className={styles.infoBar}>
      <div className={styles.infoItem}>
        <EnderecoIcon />

        <div className={styles.infoContent}>
          <span className={styles.label}>Endereço</span>
          <strong>Av. Brasil 655, Osasco - SP</strong>
        </div>

        <EditarImg />
      </div>

      <div className={styles.divider} />

      <div className={styles.infoItem}>
        <HorarioIcon />

        <div className={styles.infoContent}>
          <span className={styles.label}>Horário</span>
          <strong>Segunda-feira 11h até 22h</strong>
        </div>

        <EditarImg />
      </div>

      <div className={styles.divider} />

      <div className={styles.infoItem}>
        <CategoriaIcon />

        <div className={styles.infoContent}>
          <span className={styles.label}>Categoria</span>
          <strong>Comida Brasileira</strong>
        </div>

        <EditarImg />
      </div>

      <div className={styles.rating}>
        <EstrelasIcon />

        <div>
          <span className={styles.label}>Avaliação</span>
          <strong>4,9</strong>
        </div>
      </div>
    </section>

    {/* SOBRE O ESTABELECIMENTO */}

    <section className={styles.content}>
      <div className={styles.descriptionCard}>
        <div className={styles.cardHeader}>
          <h2>Sobre o estabelecimento</h2>
          <EditarImg />
        </div>

        <div className={styles.cardBody}>
          <span>
            Adicione uma descrição sobre o estabelecimento.
          </span>
        </div>
      </div>
    </section>
  </div>

  {/* =====================================================
      1. INFORMAÇÕES DA CONTA
  ===================================================== */}

  <section className={styles.informacaoContaContainer}>
    <ImagemInformacaoConta />

    <div className={styles.cardInformacaoConta}>
      <h2>Informações da Conta</h2>

      <div className={styles.dadosConta}>
        <div>
          <span>Nome do responsável</span>
          <strong>Maria Oliveira</strong>
        </div>

        <div>
          <span>E-mail cadastrado</span>
          <strong>maria@exemplo.com</strong>
        </div>

        <div>
          <span>Telefone</span>
          <strong>(11) 99999-0000</strong>
        </div>

        <div>
          <span>CNPJ</span>
          <strong>00.000.000/0001-00</strong>
        </div>

        <div>
          <span>Data de cadastro</span>
          <strong>10/01/2026</strong>
        </div>

        <div>
          <span>Situação da conta</span>
          <strong className={styles.statusConta}>Ativa</strong>
        </div>
      </div>

      <button
        type="button"
        className={styles.botaoAlterarInformacoes}
        onClick={handleAlterarInformacoes}
      >
        Alterar informações
      </button>
    </div>
  </section>

  {/* =====================================================
      2. DADOS BANCÁRIOS
  ===================================================== */}

  <section className={styles.bannerContainer}>
    <BannerDadosBancarios />

    <div className={styles.informacoesSobreConta}>
      <h2>Dados Bancários</h2>

      <div className={styles.dadosConta}>
        <div>
          <span>Banco</span>
          <strong>Banco do Brasil</strong>
        </div>

        <div>
          <span>Agência</span>
          <strong>1234</strong>
        </div>

        <div>
          <span>Conta</span>
          <strong>12345-6</strong>
        </div>

        <div>
          <span>Chave PIX</span>
          <strong>exemplo@email.com</strong>
        </div>
      </div>

      <button
        type="button"
        className={styles.botaoAlterarInformacoes}
        onClick={handleAlterarInformacoes}
      >
        Alterar informações
      </button>
    </div>
  </section>

  {/* =====================================================
      3. EXCLUSÃO DA CONTA
  ===================================================== */}

  <section className={styles.excluirContaContainer}>
    <button
      type="button"
      className={styles.botaoExcluirConta}
      onClick={handleExcluirConta}
    >
      Excluir conta
    </button>
  </section>
</main>


);
}

export default Perfil;
