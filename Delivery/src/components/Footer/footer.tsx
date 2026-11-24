import styles from './footer.module.css';


import borapedirIMG2 from '../../assets/logo/logo.png';

type FooterProps = {
    children?: React.ReactNode;
    logoSuperior?: string;
    logoInferior?: string;
};

export function Footer({
    children,
    logoSuperior = borapedirIMG2
    
}: FooterProps) {
    return (
        <footer className={styles.footercontainer}>
            {/* =========================
                PARTE DE CIMA
            ========================= */}

            <div className={styles.footerCima}>
                <div className={styles.footerConteudo}>
                    {/* =========================
                        COLUNA ESQUERDA — IMAGEM CIRCULAR
                    ========================= */}

                    <div className={styles.colunaEsquerda}>
                        <div className={styles.logoCircularWrapper}>
                            <img
                                src={logoSuperior}
                                alt="Bora Pedir"
                                className={styles.logoCircular}
                            />
                        </div>
                    </div>

                    {/* =========================
                        SOBRE O PROJETO
                    ========================= */}

                    <div className={styles.footerColuna}>
                        <h3>Sobre o projeto</h3>

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
                        TECNOLOGIAS + IMAGEM INFERIOR DIREITA
                    ========================= */}

                    <div className={styles.footerColunaDireita}>
                        <h3>Desenvolvimento</h3>

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
                </div>
            </div>

            {/* =========================
                PARTE INFERIOR
            ========================= */}

            <div className={styles.footerBaixo}>
                <div className={styles.footerDireitos}>
                    <div className={styles.copyright}>
                        <span>
                            © {new Date().getFullYear()}{' '}
                            <strong>Bora Pedir</strong>
                        </span>

                        <span>Todos os direitos reservados.</span>
                    </div>

                    <div className={styles.footerTcc}>
                        <span>Desenvolvido como projeto acadêmico</span>

                        <span className={styles.separador}>•</span>

                        <span>Trabalho de Conclusão de Curso</span>
                    </div>
                </div>
            </div>

            {children}
        </footer>
    );
}

export default Footer;