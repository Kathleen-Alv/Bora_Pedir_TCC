import styles from './footer.module.css';

import borapedirIMG from '../../assets/footer/gpt2.png';

type FooterProps = {
    children?: React.ReactNode;
};

export function Footer({ children }: FooterProps) {

    return (
        <footer className={styles.footercontainer}>

            {/* =========================
                PARTE DE CIMA
            ========================= */}

            <div className={styles.footerCima}>

                <div className={styles.footerConteudo}>

                    {/* =========================
                        LOGO
                    ========================= */}

                    <div className={styles.footerQuadrado}>

                        <img
                            src={borapedirIMG}
                            alt="Bora Pedir"
                            className={styles.borapedirIMG}
                        />

                    </div>


                    {/* =========================
                        SOBRE O BORA PEDIR
                    ========================= */}

                    <div className={styles.footerInfo}>

                        <h2>
                            Bora Pedir
                        </h2>

                        <p className={styles.destaque}>
                            Seu pedido, do seu jeito.
                        </p>

                        <p>
                            Uma plataforma de delivery criada para
                            aproximar clientes, comércios e entregadores
                            em um único lugar.
                        </p>

                    </div>


                    {/* =========================
                        SOBRE O PROJETO
                    ========================= */}

                    <div className={styles.footerColuna}>

                        <h3>
                            Sobre o projeto
                        </h3>

                        <p>
                            O Bora Pedir foi desenvolvido como
                            projeto de Trabalho de Conclusão de Curso
                            (TCC), com o objetivo de aplicar na prática
                            conhecimentos de desenvolvimento de sistemas.
                        </p>

                        <span className={styles.projetoTag}>
                            Projeto Acadêmico • TCC
                        </span>

                    </div>


                    {/* =========================
                        TECNOLOGIAS
                    ========================= */}

                    <div className={styles.footerColuna}>

                        <h3>
                            Desenvolvimento
                        </h3>

                        <p>
                            Uma solução construída envolvendo
                            desenvolvimento web, aplicativo mobile,
                            API, banco de dados e integração entre
                            diferentes serviços.
                        </p>

                        <div className={styles.tecnologias}>

                            <span>React</span>
                            <span>Node.js</span>
                            <span>Express</span>
                            <span>MariaDB</span>
                            <span>Flutter</span>

                        </div>

                    </div>


                    {/* =========================
                        APLICATIVOS
                    ========================= */}

             

                </div>

            </div>


            {/* =========================
                PARTE INFERIOR
            ========================= */}

            <div className={styles.footerBaixo}>

                <div className={styles.footerDireitos}>

                    <div className={styles.copyright}>

                        <span>
                            © {new Date().getFullYear()} Bora Pedir
                        </span>

                        <span>
                            Todos os direitos reservados.
                        </span>

                    </div>

                    <div className={styles.footerTcc}>

                        <span>
                            Desenvolvido como projeto acadêmico
                        </span>

                        <span className={styles.separador}>
                            •
                        </span>

                        <span>
                            Trabalho de Conclusão de Curso
                        </span>

                    </div>

                </div>

            </div>


            {children}

        </footer>
    );
}