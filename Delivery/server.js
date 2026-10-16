// ================================================================
// IMPORTS
// ================================================================

// Express
import express from 'express';

// Configuração do .env
import 'dotenv/config';

// CORS
import cors from 'cors';

// Path
import path from 'path';


import perfilRoutes from './src/api/routes/perfil.routes.js';




// ================================================================
// ROTAS
// ================================================================

import cadastroEntregadorRoutes
    from './src/api/routes/cadastroEntregador.routes.js';

import cadastroComercioRoutes
    from './src/api/routes/cadastroComercio.routes.js';

import adminRoutes
    from './src/api/routes/adminRoutes.routes.js';

import emailRoutes
    from './src/api/routes/email.routes.js';

import loginComercioRoutes
    from './src/api/routes/loginComercio.routes.js';

import recuperacaoSenhaRoutes
    from './src/api/routes/recuperacaoSenha.routes.js';

import comercioRoutes
    from './src/api/routes/comercio.routes.js';


import cardapioRoutes
     from './src/api/routes/cardapio.routes.js';


import cadastroClienteRoutes
    from './src/api/routes/cadastroCliente.routes.js';

import loginClienteRoutes
    from './src/api/routes/loginCliente.routes.js';


// ================================================================
// APLICAÇÃO
// ================================================================

const app = express();

const PORT = 3000;


// ================================================================
// MIDDLEWARES
// ================================================================

app.use(cors());

app.use(express.json());


// ================================================================
// ARQUIVOS ESTÁTICOS
// ================================================================

// Permite acessar as imagens salvas dentro de /uploads

app.use(
    '/uploads',
    express.static(
        path.join(process.cwd(), 'uploads')
    )
);


// ================================================================
// ROTAS
// ================================================================

// Cadastro de entregadores
app.use(
    '/api/entregadores',
    cadastroEntregadorRoutes
);


// Cadastro de comércio
app.use(
    '/api/comercios',
    cadastroComercioRoutes
);


// Administração
app.use(
    '/api/admin',
    adminRoutes
);


// Emails
app.use(
    '/api/email',
    emailRoutes
);


// Login de comércio
app.use(
    '/api/login-comercio',
    loginComercioRoutes
);


// Recuperação de senha
app.use(
    '/api/recuperacao-senha',
    recuperacaoSenhaRoutes
);


// Primeiro acesso / gerenciamento do comércio
app.use(
    '/api/comercios',
    comercioRoutes
);

//CARDAPIO ROUTES

app.use(
    '/api/cardapio',
    cardapioRoutes
);



app.use(
    '/api/clientes',
    cadastroClienteRoutes
);

app.use(
    '/api/login-cliente',
    loginClienteRoutes
);


//Mostrar dados do perfil
app.use(
    '/api/perfil', perfilRoutes
);



// ================================================================
// TESTE DA API
// ================================================================

app.get('/', (req, res) => {

    res.json({
        message: 'API funcionando!'
    });

});


// ================================================================
// INICIAR SERVIDOR
// ================================================================

app.listen(PORT, '0.0.0.0', () => {

    console.log(
        `Servidor rodando em http://localhost:${PORT}`
    );

});