import styles from "./perfil.module.css";

function EditIcon() {
  return (
    <span className={styles.editIcon} title="Editar">
      ✎
    </span>
  );
}

function LocationIcon() {
  return (
    <div className={styles.locationIcon}>
      <div className={styles.locationPin} />
    </div>
  );
}

function ClockIcon() {
  return (
    <div className={styles.clockIcon}>
      <div className={styles.clockHour} />
      <div className={styles.clockMinute} />
      <div className={styles.clockCenter} />
    </div>
  );
}

function TagIcon() {
  return (
    <div className={styles.tagIcon}>
      <span />
    </div>
  );
}

export function Perfil() {
  return (
    <main className={styles.page}>

      <div className={styles.profileContainer}>

        {/* CABEÇALHO */}
        <section className={styles.header}>

          <div className={styles.profileCircle}>
            <div className={styles.circleEdit}>
              <EditIcon />
            </div>
          </div>

          <div className={styles.headerEdit}>
            <EditIcon />
          </div>

        </section>


        {/* INFORMAÇÕES */}
        <section className={styles.infoBar}>

          <div className={styles.infoItem}>

            <LocationIcon />

            <div className={styles.infoContent}>
              <span className={styles.label}>
                Endereço
              </span>

              <strong>
                Av. Brasil 655, Osasco - SP
              </strong>
            </div>

            <EditIcon />

          </div>


          <div className={styles.divider} />


          <div className={styles.infoItem}>

            <ClockIcon />

            <div className={styles.infoContent}>
              <span className={styles.label}>
                Horário
              </span>

              <strong>
                Segunda-feira 11h até 22h
              </strong>
            </div>

            <span className={styles.arrow}>
              ⌄
            </span>

            <EditIcon />

          </div>


          <div className={styles.divider} />


          <div className={styles.infoItem}>

            <TagIcon />

            <div className={styles.infoContent}>
              <span className={styles.label}>
                Categoria
              </span>

              <strong>
                Comida Brasileira
              </strong>
            </div>

            <EditIcon />

          </div>


          <div className={styles.rating}>

            <span className={styles.star}>
              ★
            </span>

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


        {/* CARD INFERIOR */}
        <section className={styles.content}>

          <div className={styles.descriptionCard}>

            <div className={styles.cardHeader}>

              <h2>
                Sobre o estabelecimento
              </h2>

              <EditIcon />

            </div>

            <div className={styles.cardBody}>
              <span>
                Adicione uma descrição sobre o estabelecimento.
              </span>
            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

export default Perfil;
