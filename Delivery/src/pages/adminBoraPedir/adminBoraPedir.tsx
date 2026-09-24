import { useState } from 'react';

import { HeaderAdmin } from '../../components/HeaderAdmin/headerAdmin';
import { InicioAdmin } from '../../componentes_admin/inicio/inicioAdmin';
import { ComerciosAdmin } from '../../componentes_admin/comercios/comercioAdmin';
import { ComercioDados } from '../../componentes_admin/dados_sistema/comercioDados/comercioDados';
import { EntregadorDados } from '../../componentes_admin/dados_sistema/entregadorDados/entregadorDados';
import styles from './adminBoraPedir.module.css';
import { EntregadorAdmin } from '../../componentes_admin/entregadores/entregadorAdmin';


export function AdminBoraPedir() {

  const [telaAtual, setTelaAtual] = useState('inicio');

  return (
    <>
      <HeaderAdmin />

      <div className={styles.portal}>

        <aside className={styles.sidebar}>

          {/* INÍCIO */}

          <button
            className={styles.menuItem}
            onClick={() => setTelaAtual('inicio')}
          >
            <span>Início</span>
          </button>


          {/* ANÁLISE CADASTRAL */}

          <div className={styles.category}>

            <div className={styles.categoryTitle}>
              Análise Cadastral
            </div>

            <button
              className={styles.menuItem}
              onClick={() => setTelaAtual('comercios')}
            >
              <span>Comércios</span>
            </button>

            <button
              className={styles.menuItem}
              onClick={() => setTelaAtual('entregadores')}
            >
              <span>Entregadores</span>
            </button>

          </div>


          {/* Dados do Sistema */}

          {/* Tem que colocar no button onde vai , alem de declarar a rota
          tem um texto que equivale aquela parte exemplo admin 'cadastro admin' */}

          <div className={styles.category}>

            <div className={styles.categoryTitle}>
              Dados do Sistema
            </div>

            <button
              className={styles.menuItem}
              onClick={() => setTelaAtual('Dados de Comércios')}
            >
              <span>Dados de Comércios</span>
            </button>

            <button
              className={styles.menuItem}
              onClick={() => setTelaAtual('Dados de Entregadores')}
            >
              <span>Dados de Entregadores</span>
            </button>

          </div>


          {/* SUPORTE */}

          <div className={styles.category}>

            <div className={styles.categoryTitle}>
              Suporte
            </div>

            <button
              className={styles.menuItem}
              onClick={() => setTelaAtual('abertas')}
            >
              <span>Solicitações em Aberto</span>
            </button>

            <button
              className={styles.menuItem}
              onClick={() => setTelaAtual('encerradas')}
            >
              <span>Solicitações Encerradas</span>
            </button>

          </div>



          

        </aside>


        {/* CONTEÚDO */}

        {/*AQUI é a Rotas Das Pages Internas */}

        <main className={styles.content}>

          {telaAtual === 'inicio' && <InicioAdmin />}

          {telaAtual === 'comercios' && (
            <ComerciosAdmin />
          )}

          

          {telaAtual === 'entregadores' && (
            <EntregadorAdmin/>
          )}

          {telaAtual === 'Dados de Comércios' && (
            <ComercioDados />
          )}

          {/* Aqui Muda O EntregadorDados */}
          {telaAtual === 'Dados de Entregadores' && (
            <EntregadorDados />
          )}

          {telaAtual === 'abertas' && (
            <h1>Solicitações em Aberto</h1>
          )}

          {telaAtual === 'encerradas' && (
            <h1>Solicitações Encerradas</h1>
          )}

        </main>

      </div>
    </>
  );
}