
import styles from "./perfil.module.css";

import categoria from "../../../../assets/perfil/categoria.png";
import editar from "../../../../assets/perfil/editar.png";
import editar_foto from "../../../../assets/perfil/editar_foto.png";
import endereco from "../../../../assets/perfil/endereco.png";
import estrelas from "../../../../assets/perfil/estrelas.png";
import horario from "../../../../assets/perfil/horario.png";
import informacao from "../../../../assets/perfil/informacao.png";
import bannerDadosBancarios from "../../../../assets/perfil/bannerDadosBancarios.png";


// ========================================================
// ÍCONE EDITAR
// ========================================================

function EditarImg() {
  return (
    <img
      src={editar}
      className={styles.imgDeIcone}
      alt="Editar"
      title="Editar"
    />
  );
}


// ========================================================
// ÍCONE ENDEREÇO
// ========================================================

function EnderecoIcon() {
  return (
    <img
      src={endereco}
      className={styles.imgDeIcone}
      alt="Endereço"
      title="Endereço"
    />
  );
}


// ========================================================
// ÍCONE HORÁRIO
// ========================================================

function HorarioIcon() {
  return (
    <img
      src={horario}
      className={styles.imgDeIcone}
      alt="Horário"
      title="Horário"
    />
  );
}


// ========================================================
// ÍCONE CATEGORIA
// ========================================================

function CategoriaIcon() {
  return (
    <img
      src={categoria}
      className={styles.imgDeIcone}
      alt="Categoria"
      title="Categoria"
    />
  );
}


// ========================================================
// ÍCONE ESTRELAS
// ========================================================

function EstrelasIcon() {
  return (
    <img
      src={estrelas}
      className={styles.imgDeIcone}
      alt="Avaliação"
      title="Avaliação"
    />
  );
}


// ========================================================
// ÍCONE INFORMAÇÃO
// ========================================================

function InfoIcon() {
  return (
    <img
      src={informacao}
      className={styles.imgDeIcone}
      alt="Informação"
      title="Informação"
    />
  );
}


// ========================================================
// ÍCONE EDITAR FOTO
// ========================================================

function EditarFotoIcon() {
  return (
    <img
      src={editar_foto}
      className={styles.imgDeIcone}
      alt="Editar foto"
      title="Editar foto"
    />
  );
}


// ========================================================
// BANNER DADOS BANCÁRIOS
// ========================================================

function BannerDadosBancarios() {
  return (
    <img
      src={bannerDadosBancarios}
      className={styles.bannerDadosBancarios}
      alt="Dados Bancários"
      title="Dados Bancários"
    />
  );
}


// ========================================================
// PERFIL
// ========================================================

export function Perfil() {
  return (
    <main className={styles.page}>

      {/* =====================================================
          CONTAINER DO PERFIL
      ===================================================== */}

      <div className={styles.profileContainer}>

        {/* =====================================================
            CABEÇALHO
        ===================================================== */}

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


        {/* =====================================================
            INFORMAÇÕES
        ===================================================== */}

        <section className={styles.infoBar}>

          {/* ================= ENDEREÇO ================= */}

          <div className={styles.infoItem}>

            <EnderecoIcon />

            <div className={styles.infoContent}>

              <span className={styles.label}>
                Endereço
              </span>

              <strong>
                Av. Brasil 655, Osasco - SP
              </strong>

            </div>

            <EditarImg />

          </div>


          <div className={styles.divider} />


          {/* ================= HORÁRIO ================= */}

          <div className={styles.infoItem}>

            <HorarioIcon />

            <div className={styles.infoContent}>

              <span className={styles.label}>
                Horário
              </span>

              <strong>
                Segunda-feira 11h até 22h
              </strong>

            </div>

            <EditarImg />

          </div>


          <div className={styles.divider} />


          {/* ================= CATEGORIA ================= */}

          <div className={styles.infoItem}>

            <CategoriaIcon />

            <div className={styles.infoContent}>

              <span className={styles.label}>
                Categoria
              </span>

              <strong>
                Comida Brasileira
              </strong>

            </div>

            <EditarImg />

          </div>


          {/* ================= AVALIAÇÃO ================= */}

          <div className={styles.rating}>

            <EstrelasIcon />

            <div>

              <span className={styles.label}>
                Avaliação
              </span>

              <strong>
                4,9
              </strong>

            </div>

          </div>

        </section>


        {/* =====================================================
            CARD INFERIOR
        ===================================================== */}

        <section className={styles.content}>

          <div className={styles.descriptionCard}>

            <div className={styles.cardHeader}>

              <h2>
                Sobre o estabelecimento
              </h2>

              <div>
                <EditarImg />
              </div>

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
          BANNER DADOS BANCÁRIOS
      ===================================================== */}


<div className={styles.bannerContainer}>

  <BannerDadosBancarios />

  <div className={styles.informacoesSobreConta}>
    <h2>Informações sobre a Conta</h2>


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

<button className={styles.botaoAlterarInformacoes}>
  Alterar informações
</button>

</div>

    
  

</div>
    
    </main>
  );
}


export default Perfil;
