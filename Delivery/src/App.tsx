
import './styles/global.css';
import './styles/theme.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Home } from './pages/Home/home';
import { CadastroComercial } from './pages/CadastroComercial/cadastroComercio'; 
import { CadastroEntregador } from './pages/CadastroEntregador/CadastroEntregador';
import { Login } from './pages/Login/login';
import { PortalGestao } from './pages/PortalGestao/PortalGestao';
import { EsqueciMinhaSenha } from './components/esqueciMinhaSenha/esqueciMinhaSenha';
import { AdminBoraPedir } from './pages/adminBoraPedir/adminBoraPedir';

import { GestaoPedidos } from './pages/GestaoPedidos/gestaoPedidos.tsx';
import { PrimeiroAcessoComercio } from './pages/PortalGestao/componentes_gestao/PrimeiroAcesso/primeiroAcessoComercio.tsx';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/cadastro-comercial"
          element={<CadastroComercial />}
        />

        <Route
          path="/cadastro-entregador"
          element={<CadastroEntregador />}
        />

        <Route
          path="/portal_gestao"
          element={<Login />}
        />

        <Route
        path="/gestao"
        element={<PortalGestao/>}
        />


        <Route
        path="/esqueciMinhaSenha"
        element={<EsqueciMinhaSenha/>}
        />

        <Route
        path="/adminBoraPedir"
        element={<AdminBoraPedir/>}
        />


        
        <Route
        path="/primeiro_acesso"
        element={<PrimeiroAcessoComercio/>}
        />

         <Route
        path="/gestao_pedidos"
        element={<GestaoPedidos/>}
        />




        

        






      </Routes>
    </BrowserRouter>
  );
}

