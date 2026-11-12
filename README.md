# ❤️ Bora Pedir — Plataforma de Gestão e Delivery para Comércios

## 📌 Sobre o projeto

O **Bora Pedir** é uma plataforma tecnológica desenvolvida com o propósito de oferecer aos estabelecimentos comerciais uma solução digital para modernizar sua gestão, otimizar processos e ampliar suas oportunidades de negócio.

O projeto tem como principal foco o comércio, buscando proporcionar ferramentas que auxiliem os comerciantes no gerenciamento de seus estabelecimentos, produtos, cardápios e pedidos, além de oferecer mecanismos de segurança para proteger as informações e controlar o acesso às funcionalidades do sistema.

A proposta vai além de conectar consumidores a estabelecimentos. O Bora Pedir busca contribuir para a transformação digital dos pequenos e médios negócios, oferecendo um ambiente organizado, acessível e integrado.

Por meio de diferentes módulos, a plataforma conecta comerciantes, clientes, entregadores e administradores, mantendo o estabelecimento comercial como elemento central da operação.

## 🎯 Objetivo geral

Desenvolver uma plataforma de delivery com foco na melhoria da gestão comercial, proporcionando recursos tecnológicos que contribuam para a organização dos estabelecimentos, a segurança das operações e a integração entre comerciantes, consumidores e entregadores.

### Objetivos específicos

- Digitalizar e facilitar os processos de gerenciamento comercial.
- Proporcionar autonomia aos comerciantes na administração de seus estabelecimentos.
- Disponibilizar ferramentas para gerenciamento de cardápios, categorias e produtos.
- Organizar o recebimento e o acompanhamento dos pedidos.
- Implementar mecanismos de autenticação e controle de acesso.
- Proteger informações dos usuários e estabelecimentos.
- Reduzir falhas operacionais por meio da centralização das informações.
- Melhorar a comunicação entre os participantes do processo de delivery.
- Contribuir para a modernização e competitividade dos estabelecimentos comerciais.

## 🏪 O comércio como protagonista

O principal diferencial do Bora Pedir está na valorização do estabelecimento comercial.

A plataforma foi pensada para oferecer ao comerciante maior controle sobre sua operação, permitindo que ele gerencie informações e acompanhe os processos relacionados às vendas em um ambiente digital.

### Principais recursos para o comércio

- **Gestão do estabelecimento:** cadastro e gerenciamento das informações comerciais.
- **Identidade comercial:** personalização com nome, categoria, logotipo e banner.
- **Gestão de cardápio:** criação e organização de categorias e produtos.
- **Controle de produtos:** gerenciamento de preços, descrições, imagens e disponibilidade.
- **Gestão de pedidos:** visualização, aceitação, recusa e atualização do andamento dos pedidos.
- **Organização operacional:** acompanhamento das etapas de preparação.
- **Controle de acesso:** identificação do perfil comercial e proteção das funcionalidades.
- **Centralização de informações:** integração dos dados comerciais com os demais módulos da plataforma.

## 🔐 Segurança da informação

A segurança é um dos pilares do desenvolvimento do Bora Pedir.

Considerando a importância das informações comerciais e pessoais envolvidas nas operações de delivery, o projeto utiliza mecanismos de proteção e controle de acesso para reduzir riscos de utilização indevida do sistema.

Entre os recursos implementados ou previstos na arquitetura estão:

- **Autenticação com JWT:** utilização de tokens para identificar usuários autenticados.
- **Controle de acesso por perfil:** separação das permissões de clientes, comerciantes, administradores e entregadores.
- **Middleware de autenticação:** validação das credenciais de acesso às rotas protegidas.
- **Identificação do usuário:** associação das operações ao usuário autenticado.
- **Validação no servidor:** verificação das informações recebidas pela API.
- **Proteção de rotas:** restrição de funcionalidades conforme o perfil autorizado.
- **Controle de dados comerciais:** relacionamento das operações com o estabelecimento correspondente.
- **Gerenciamento de sessão:** armazenamento e utilização de informações de autenticação nas aplicações.

A proposta é garantir que cada participante tenha acesso somente às funcionalidades e informações necessárias para desempenhar suas atividades.

## 🚀 Módulos da plataforma

O Bora Pedir possui módulos integrados, desenvolvidos para atender às necessidades de cada participante da operação.

### 1. Painel de gestão comercial

<text>**Módulo principal da plataforma.**</text>

Ambiente web voltado aos comerciantes, permitindo administrar as principais informações e atividades do estabelecimento.

Funcionalidades:

- Cadastro e autenticação comercial.
- Configuração inicial do estabelecimento.
- Gerenciamento de dados comerciais.
- Cadastro de logotipo e banner.
- Gerenciamento de cardápios.
- Cadastro e organização de categorias.
- Cadastro e edição de produtos.
- Controle de preços e disponibilidade.
- Recebimento e gerenciamento de pedidos.
- Atualização do status dos pedidos.
- Organização das etapas de preparação.

### 2. Aplicação do cliente

Aplicação mobile desenvolvida para facilitar a experiência de compra e aproximar os consumidores dos estabelecimentos cadastrados.

Funcionalidades:

- Cadastro e login.
- Visualização de estabelecimentos.
- Pesquisa e categorias comerciais.
- Consulta de cardápios e produtos.
- Gerenciamento do carrinho.
- Cadastro e seleção de endereços.
- Seleção de formas de pagamento.
- Realização de pedidos.
- Acompanhamento dos pedidos.

### 3. Aplicação do entregador

Aplicação mobile destinada aos profissionais responsáveis pela etapa de entrega.

Funcionalidades:

- Autenticação do entregador.
- Verificação da situação cadastral.
- Identificação da aprovação para acesso.
- Ambiente de gerenciamento de entregas.
- Integração com o fluxo de pedidos.

### 4. Painel administrativo

Ambiente destinado à administração e ao controle geral da plataforma.

Sua finalidade é centralizar o gerenciamento dos participantes e apoiar a supervisão do funcionamento do sistema.

---

## 🔄 Fluxo operacional

O Bora Pedir organiza o processo de delivery considerando o estabelecimento comercial como responsável pela gestão da operação.

1. O comerciante realiza seu cadastro na plataforma.
2. Configura as informações do estabelecimento.
3. Organiza seu cardápio e disponibiliza os produtos.
4. O cliente acessa a aplicação e escolhe um estabelecimento.
5. O cliente seleciona os produtos e finaliza o pedido.
6. O estabelecimento recebe a solicitação em seu painel de gestão.
7. O comerciante analisa e aceita ou recusa o pedido.
8. Após a confirmação, o estabelecimento acompanha e atualiza a preparação.
9. O pedido segue para a etapa de entrega.
10. O cliente acompanha o andamento até a conclusão.

## 🛠️ Tecnologias utilizadas

A plataforma utiliza tecnologias para desenvolvimento web, mobile, backend e gerenciamento de dados.

| Tecnologia | Aplicação |
|---|---|
| Flutter | Desenvolvimento mobile |
| Dart | Linguagem das aplicações Flutter |
| React | Interface web |
| TypeScript | Desenvolvimento do frontend |
| CSS Modules | Estilização das interfaces |
| Node.js | Ambiente de execução do servidor |
| Express.js | Construção da API REST |
| JavaScript | Desenvolvimento do backend |
| MariaDB | Banco de dados relacional |
| SQL | Manipulação e consulta de dados |
| JWT | Autenticação e autorização baseada em tokens |
| SharedPreferences | Persistência local de sessão no Flutter |
| Git e GitHub | Versionamento e colaboração |

## 🏗️ Arquitetura do sistema

A arquitetura do Bora Pedir é organizada em três camadas principais: aplicações, servidor e banco de dados.

```text
BORA PEDIR
│
├── FRONTEND
│   │
│   ├── Painel Comercial
│   │   └── React + TypeScript
│   │
│   ├── Aplicação do Cliente
│   │   └── Flutter + Dart
│   │
│   └── Aplicação do Entregador
│       └── Flutter + Dart
│
├── BACKEND
│   │
│   ├── Node.js
│   ├── Express.js
│   ├── API REST
│   ├── Controllers
│   ├── Routes
│   ├── Middlewares
│   └── Autenticação JWT
│
└── BANCO DE DADOS
    │
    └── MariaDB
```

A comunicação entre os módulos ocorre por meio de uma API REST, responsável por processar as requisições, validar informações, aplicar regras de negócio e realizar operações no banco de dados.

## 🗄️ Banco de dados

O MariaDB é utilizado para armazenar e organizar os dados da plataforma.

A estrutura contempla informações relacionadas a:

- Usuários e autenticação.
- Estabelecimentos comerciais.
- Dados dos comércios.
- Clientes.
- Entregadores.
- Cardápios.
- Categorias comerciais.
- Produtos.
- Carrinhos de compras.
- Endereços de entrega.
- Pedidos.
- Itens dos pedidos.
- Informações de acompanhamento.

A modelagem relacional busca garantir consistência e integridade entre as informações dos diferentes módulos.

## 💻 Ambiente de desenvolvimento

Ferramentas necessárias:

- Flutter SDK.
- Dart SDK.
- Node.js.
- MariaDB.
- Git.
- Visual Studio Code ou IDE compatível.

## ⚙️ Instalação e execução

### 1. Clonar o repositório

```bash
git clone https://github.com/Kathleen-Alv/Bora_Pedir_TCC.git
```

### 2. Acessar o projeto

```bash
cd Bora_Pedir_TCC
```

### 3. Configurar o backend

Acesse a pasta do backend e instale as dependências:

```bash
cd Delivery
npm install
```

Configure as variáveis de ambiente:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=bora_pedir_delivery
JWT_SECRET=sua_chave_secreta
PORT=3000
```

Configure o banco de dados MariaDB e inicie o servidor utilizando o script disponível no `package.json`.

```bash
npm run dev
```

### 4. Executar o frontend web

Na pasta correspondente ao frontend:

```bash
npm install
npm run dev
```

### 5. Executar a aplicação do cliente

```bash
cd bora_pedir_app
flutter pub get
flutter run
```

### 6. Executar a aplicação do entregador

```bash
cd bora_pedir_entregador
flutter pub get
flutter run
```

**Observação:** os caminhos e comandos devem corresponder à estrutura efetiva das pastas do repositório. Os endereços da API também devem ser ajustados conforme o ambiente de execução.

---

## 📈 Diferenciais e contribuição do projeto

O Bora Pedir busca contribuir para a modernização do comércio por meio da integração de recursos que normalmente exigiriam diferentes ferramentas e processos.

Seus principais diferenciais são:

- Foco na gestão e autonomia dos estabelecimentos comerciais.
- Centralização de informações comerciais e operacionais.
- Integração entre gestão, vendas e entrega.
- Controle de acesso de acordo com os diferentes perfis.
- Utilização de autenticação e validação de operações.
- Digitalização do gerenciamento de cardápios e pedidos.
- Estrutura preparada para evolução de funcionalidades.

A plataforma procura oferecer não apenas um canal de vendas, mas também um ambiente de apoio à organização e ao desenvolvimento dos negócios.

## 🎓 Contexto acadêmico

O Bora Pedir foi desenvolvido como Trabalho de Conclusão de Curso (TCC), com o propósito de aplicar conhecimentos de desenvolvimento de software, engenharia de sistemas, segurança da informação, modelagem de banco de dados e integração de aplicações.

O projeto busca demonstrar como a tecnologia pode contribuir para solucionar dificuldades presentes na gestão comercial, proporcionando ferramentas digitais que favoreçam a organização, a segurança e a eficiência dos estabelecimentos.

---

## 👩‍💻 Repositório

**Projeto:** Bora Pedir

**GitHub:** https://github.com/Kathleen-Alv/Bora_Pedir_TCC

**Finalidade:** Trabalho de Conclusão de Curso (TCC).

---

<p align="center">
  **Bora Pedir**
  
  *Fortalecendo o comércio por meio da tecnologia, gestão e segurança.* ❤️
</p>