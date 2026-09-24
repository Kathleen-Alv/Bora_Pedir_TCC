
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';

import styles from './mapaBrasil.module.css';
import astronauta from '../../../assets/astronauta.png';


const geoUrl =
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';


/* =========================================================
   CIDADE EM DESTAQUE
========================================================= */

const cidades = [
  {
    nome: 'Osasco',
    coordenadas: [-46.7917, -23.5329] as [number, number],
    comercios: 15,
  },
];


export function MapaBrasil() {

  return (
    <section className={styles.container}>


      {/* =====================================================
          CABEÇALHO
      ===================================================== */}

      <div className={styles.header}>

        <div>

          <span className={styles.eyebrow}>
            COBERTURA
          </span>


          <h2 className={styles.titulo}>
            Onde o Bora Pedir está
          </h2>


          <p className={styles.descricao}>
            Visualize as cidades que possuem comércios
            cadastrados na plataforma.
          </p>

        </div>


        <div className={styles.status}>

          <span className={styles.statusPonto}></span>

          <span>
            Sistema ativo
          </span>

        </div>

      </div>



      {/* =====================================================
          ÁREA PRINCIPAL
      ===================================================== */}

      <div className={styles.mapaArea}>


        {/* ===================================================
            ÁREA DA FRASE
        =================================================== */}

        <div className={styles.fraseArea}>


          <span className={styles.frasePequena}>
            NOSSO OBJETIVO
          </span>


          <h3 className={styles.fraseDominacao}>
            Em busca da
            <br />
            dominação mundial.
          </h3>


          {/* =================================================
              IMAGEM DO ASTRONAUTA
          ================================================= */}

          <div className={styles.imagemArea}>

            <img
              src={astronauta}
              alt="Astronauta Bora Pedir"
              className={styles.imagemAstronauta}
            />

          </div>


          <span className={styles.fraseDetalhe}>
            Começando por Osasco.
          </span>

        </div>



        {/* ===================================================
            ÁREA DO MAPA
        =================================================== */}

        <div className={styles.mapaWrapper}>


          <ComposableMap
            projection="geoMercator"

            width={900}

            height={600}

            projectionConfig={{
              center: [-54, -15],
              scale: 700,
            }}

            className={styles.mapa}
          >


            {/* =================================================
                ESTADOS
            ================================================= */}

            <Geographies geography={geoUrl}>

              {({ geographies }) =>

                geographies.map((geo) => {

                  const nomeEstado =
                    geo.properties.name ||
                    geo.properties.sigla ||
                    geo.properties.NOME ||
                    '';


                  const nomeNormalizado =
                    nomeEstado
                      .toString()
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '');


                  const estadoEhSaoPaulo =
                    nomeNormalizado === 'sao paulo';


                  return (

                    <Geography
                      key={geo.rsmKey}

                      geography={geo}

                      className={
                        estadoEhSaoPaulo
                          ? styles.estadoSaoPaulo
                          : styles.estado
                      }
                    />

                  );

                })

              }

            </Geographies>



            {/* =================================================
                MARCADOR DE OSASCO
            ================================================= */}

            {cidades.map((cidade) => (

              <Marker
                key={cidade.nome}
                coordinates={cidade.coordenadas}
              >


                {/* =================================================
                    HALO
                ================================================= */}

                <circle
                  r={14}
                  className={styles.markerHalo}
                />


                {/* =================================================
                    PONTO
                ================================================= */}

                <circle
                  r={6}
                  className={styles.marker}
                />


                {/* =================================================
                    NOME
                ================================================= */}

                <text
                  textAnchor="middle"
                  y={-18}
                  className={styles.nomeCidade}
                >
                  {cidade.nome}
                </text>


              </Marker>

            ))}


          </ComposableMap>


        </div>


      </div>



      {/* =====================================================
          INFORMAÇÕES
      ===================================================== */}

      <div className={styles.resumo}>


        {/* =================================================
            CIDADES
        ================================================= */}

        <div className={styles.resumoItem}>

          <span className={styles.resumoNumero}>
            1
          </span>

          <span className={styles.resumoTexto}>
            Cidade
          </span>

        </div>


        <div className={styles.linha}></div>


        {/* =================================================
            COMÉRCIOS
        ================================================= */}

        <div className={styles.resumoItem}>

          <span className={styles.resumoNumero}>
            15
          </span>

          <span className={styles.resumoTexto}>
            Comércios
          </span>

        </div>


        <div className={styles.linha}></div>


        {/* =================================================
            COBERTURA
        ================================================= */}

        <div className={styles.resumoItem}>

          <span className={styles.resumoNumero}>
            Ativo
          </span>

          <span className={styles.resumoTexto}>
            Cobertura
          </span>

        </div>


      </div>


    </section>
  );
}
