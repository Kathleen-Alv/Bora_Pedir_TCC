// Importa o framework Express, que facilita a criação de servidores HTTP e o gerenciamento de rotas/middlewares.
import express from 'express';

// Importa o pacote CORS (Cross-Origin Resource Sharing), necessário para permitir que aplicações frontend em origens diferentes façam requisições para esta API.
import cors from 'cors';

// Importa os roteadores de arquivos externos modularizados.
import cadastroEntregadorRoutes from './src/api/routes/cadastroEntregador.routes.js';
import cadastroComercioRoutes from './src/api/routes/cadastroComercio.routes.js'; // CORRIGIDO: adicionado o '/' após o '.'


import adminRoutes from './src/api/routes/adminRoutes.routes.js';


// Inicializa uma instância da aplicação Express (o núcleo da sua API).
const app = express();

// Define a porta em que o servidor local responderá a requisições HTTP.
const PORT = 3000;

// =========================
// MIDDLEWARES
// =========================

// Habilita o CORS para todas as origens por padrão.
app.use(cors());

// Configura o Express para interpretar requisições cujo corpo (body) venha no formato JSON, convertendo-o para um objeto JavaScript acessível via `req.body`.
app.use(express.json());

// =========================
// ROTAS
// =========================

// Registra as rotas importadas.
app.use('/api/entregadores', cadastroEntregadorRoutes);

// AJUSTADO: alterado para '/api/comercios' (no plural) para alinhar com o fetch do React e com a rota de entregadores
app.use('/api/comercios', cadastroComercioRoutes);


app.use('/api/admin', adminRoutes);


// =========================
// TESTE DA API
// =========================

// Define uma rota de teste na raiz do servidor ('/').
app.get('/', (req, res) => {
    res.json({
        message: 'API funcionando!'
    });
});

// =========================
// INICIAR SERVIDOR
// =========================

// Coloca o servidor para escutar na porta 3000.
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});