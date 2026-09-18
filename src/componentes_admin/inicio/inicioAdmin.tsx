import { useEffect, useState } from 'react';

import styles from './inicioAdmin.module.css';

type DadosDashboard = {
    solicitacoesCadastro: number;
    entregadoresAtivos: number;
    comerciosAtivos: number;
};

export function InicioAdmin() {

    const [dados, setDados] = useState<DadosDashboard | null>(null);

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState(false);


    useEffect(() => {

        async function buscarDadosDashboard() {

            try {

                const resposta = await fetch(
                    'http://localhost:3000/api/admin/dashboard'
                );

                if (!resposta.ok) {
                    throw new Error('Erro ao buscar dashboard');
                }

                const dadosRecebidos: DadosDashboard =
                    await resposta.json();

                setDados(dadosRecebidos);

                setErro(false);

            } catch (erro) {

                console.error(
                    'Erro ao carregar dashboard:',
                    erro
                );

                setErro(true);

            } finally {

                setCarregando(false);

            }
        }


        // Busca imediatamente ao abrir
        buscarDadosDashboard();


        // Atualiza a cada 5 segundos
        const intervalo = setInterval(() => {
            buscarDadosDashboard();
        }, 5000);


        // Limpa o intervalo quando sair da tela
        return () => {
            clearInterval(intervalo);
        };

    }, []);


    if (carregando) {

        return (
            <div className={styles.inicioContainer}>
                <p>Carregando dados...</p>
            </div>
        );

    }


    if (erro || !dados) {

        return (
            <div className={styles.inicioContainer}>
                <p>
                    Não foi possível carregar os dados do dashboard.Fora de Sistema
                </p>
            </div>
        );

    }


    return (
        <div className={styles.inicioContainer}>

            <div className={styles.cardsContainer}>

                {/* SOLICITAÇÕES DE CADASTRO */}

                <div className={styles.card}>

                    <span className={styles.cardTitulo}>
                        Solicitações de Cadastro
                    </span>

                    <strong className={styles.cardNumero}>
                        {dados.solicitacoesCadastro}
                    </strong>

                    <span className={styles.cardDescricao}>
                        aguardando análise
                    </span>

                </div>


                {/* ENTREGADORES ATIVOS */}

                <div className={styles.card}>

                    <span className={styles.cardTitulo}>
                        Entregadores Ativos
                    </span>

                    <strong className={styles.cardNumero}>
                        {dados.entregadoresAtivos}
                    </strong>

                    <span className={styles.cardDescricao}>
                        usuários ativos
                    </span>

                </div>


                {/* COMÉRCIOS ATIVOS */}

                <div className={styles.card}>

                    <span className={styles.cardTitulo}>
                        Comércios Ativos
                    </span>

                    <strong className={styles.cardNumero}>
                        {dados.comerciosAtivos}
                    </strong>

                    <span className={styles.cardDescricao}>
                        estabelecimentos ativos
                    </span>

                </div>

            </div>

        </div>
    );
}