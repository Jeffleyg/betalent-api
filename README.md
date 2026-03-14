<div align="center">

# beTalent API

**API RESTful de pagamentos multi-gateway com fallback automático**

![AdonisJS](https://img.shields.io/badge/AdonisJS-7-5A45FF?style=flat-square&logo=adonisjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![Node](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=nodedotjs)

</div>

---

## Sobre o projeto

API construída com **AdonisJS 7 + TypeScript** para processamento de pagamentos com suporte a múltiplos gateways e fallback automático. Quando o gateway primário falha, o sistema tenta automaticamente o próximo gateway ativo, garantindo alta disponibilidade nas transações.

O banco de dados é **MySQL 8**, as validações de entrada usam **VineJS**, a autenticação é via **token Bearer** (Opaque Tokens do AdonisJS Auth) e os testes cobrem o núcleo de negócio com **Japa**.

### Funcionalidades principais

- Compra pública (sem autenticação) com fallback entre gateways
- Reembolso de transações pagas pelo gateway original
- Gerenciamento de gateways (ativar/desativar, prioridade)
- CRUD completo de produtos e usuários com controle de papéis
- Listagem de clientes com histórico de compras
- Documentação interativa via **Swagger UI** em `/api/docs`

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | AdonisJS 7 (Node.js 22) |
| Linguagem | TypeScript 5.9 |
| ORM | Lucid ORM (AdonisJS) |
| Validação | VineJS |
| Banco de dados | MySQL 8.0 |
| Autenticação | AdonisJS Auth — Opaque Tokens |
| Testes | Japa |
| Docs | Swagger UI 5 (OpenAPI 3.0.3) |
| Containers | Docker + Docker Compose |

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- [Node.js 22+](https://nodejs.org/) *(apenas para rodar localmente sem Docker)*
- NPM

---

## Início rápido com Docker

A forma recomendada de rodar o projeto. Um único comando sobe a API, o banco de dados e os mocks dos gateways.

```bash
docker compose up --build
```

Aguarde os containers iniciarem. A API estará disponível em:

```
http://localhost:3333
```

O comando já executa automaticamente as **migrations** e o **seeder** (que registra os dois gateways padrão).

### Serviços do Docker Compose

| Serviço | Porta | Descrição |
|---|---|---|
| `app` | `3333` | API AdonisJS |
| `mysql` | `3307` → `3306` | Banco de dados MySQL 8 |
| `gateways-mock` | `3001`, `3002` | Mock oficial dos gateways de pagamento |

> **Nota:** A porta do MySQL no host é `3307` para evitar conflito com instalações locais do MySQL na `3306`.

---

## Rodando localmente (sem Docker)

Use este método se preferir rodar somente a API localmente, apontando para um banco MySQL externo.

**1. Instale as dependências:**

```bash
npm install
```

**2. Configure o ambiente:**

```bash
cp .env.example .env
```

Edite o `.env` com as credenciais do seu banco MySQL e as URLs dos gateways. Veja a seção [Variáveis de Ambiente](#variáveis-de-ambiente) para detalhes.

**3. Suba o mock dos gateways (necessário para processar pagamentos):**

```bash
docker compose up gateways-mock -d
```

**4. Execute as migrations e o seeder:**

```bash
node ace migration:run
node ace db:seed
```

**5. Inicie o servidor em modo de desenvolvimento:**

```bash
npm run dev
```

A API estará disponível em `http://localhost:3333`.

---

## Documentação interativa (Swagger UI)

Com a API rodando, acesse a documentação completa e interativa no navegador:

```
http://localhost:3333/api/docs
```

A documentação lista todas as rotas, parâmetros e exemplos de payload. Para testar rotas privadas:

1. Acesse `/api/v1/auth/login` no Swagger e faça login
2. Copie o `token` da resposta
3. Clique em **Authorize** (canto superior direito)
4. Cole no formato: `Bearer SEU_TOKEN`
5. Confirme — a partir daí, todas as chamadas autenticadas funcionarão

O documento OpenAPI bruto também está disponível em:

```
http://localhost:3333/api/docs/openapi.json
```

---

## Banco de dados

### Diagrama de tabelas

```
users
  id, email, password, role, created_at, updated_at

gateways
  id, name, is_active, priority, created_at, updated_at

clients
  id, name, email, created_at, updated_at

products
  id, name, amount, is_active, created_at, updated_at

transactions
  id, client_id (FK), gateway_id (FK), product_id (FK)
  external_id, status, amount, card_last_numbers
  quantity, created_at, updated_at

transaction_products  (snapshot imutável da compra)
  id, transaction_id (FK), product_id (FK)
  product_name, product_amount, quantity
  created_at, updated_at

access_tokens
  id, tokenable_id (FK users), hash, abilities, expires_at, ...
```

### Status de transação

| Status | Descrição |
|---|---|
| `pending` | Processamento iniciado |
| `paid` | Aprovada por um gateway |
| `failed` | Todos os gateways rejeitaram |
| `refunded` | Estornada com sucesso |

### Papéis de usuário (roles)

| Role | Acesso |
|---|---|
| `ADMIN` | Acesso total — gateways, pagamentos, reembolso, usuários, produtos |
| `MANAGER` | Usuários + produtos (sem gateways e reembolso) |
| `FINANCE` | Pode solicitar reembolsos |
| `USER` | Somente leitura de produtos e perfil próprio |

---

## Referência de rotas

Prefixo base: `/api/v1`

### Rotas públicas

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/signup` | Criar nova conta |
| `POST` | `/auth/login` | Autenticar e obter token |
| `POST` | `/payments` | Realizar uma compra |

### Rotas privadas (requer `Authorization: Bearer <token>`)

#### Autenticação e perfil

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `POST` | `/auth/logout` | Qualquer | Revogar token atual |
| `GET` | `/account/profile` | Qualquer | Ver perfil do usuário autenticado |

#### Produtos

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/products` | Qualquer | Listar produtos |
| `GET` | `/products/:id` | Qualquer | Detalhar produto |
| `POST` | `/products` | ADMIN, MANAGER | Criar produto |
| `PUT` | `/products/:id` | ADMIN, MANAGER | Atualizar produto |
| `DELETE` | `/products/:id` | ADMIN, MANAGER | Remover produto |

#### Usuários

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/users` | ADMIN, MANAGER | Listar usuários |
| `GET` | `/users/:id` | ADMIN, MANAGER | Detalhar usuário |
| `POST` | `/users` | ADMIN, MANAGER | Criar usuário |
| `PUT` | `/users/:id` | ADMIN, MANAGER | Atualizar usuário |
| `DELETE` | `/users/:id` | ADMIN, MANAGER | Remover usuário |
| `PATCH` | `/users/:id/role` | ADMIN, MANAGER | Alterar papel do usuário |

#### Clientes

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/clients` | Qualquer | Listar clientes |
| `GET` | `/clients/:id` | Qualquer | Detalhar cliente com histórico de compras |

#### Pagamentos

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/payments` | Qualquer | Listar todas as transações |
| `GET` | `/payments/:id` | Qualquer | Detalhar transação |
| `POST` | `/payments/:id/refund` | ADMIN, FINANCE | Solicitar reembolso |

#### Gateways

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/gateways` | ADMIN | Listar gateways |
| `PATCH` | `/gateways/:id/active` | ADMIN | Ativar ou desativar gateway |
| `PATCH` | `/gateways/:id/priority` | ADMIN | Alterar prioridade do gateway |

---

## Payloads de exemplo

### `POST /api/v1/auth/signup`

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

### `POST /api/v1/auth/login`

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "type": "bearer",
  "token": "oat_NA.abc123..."
}
```

### `POST /api/v1/payments` — Realizar compra

```json
{
  "customerName": "João Silva",
  "customerEmail": "joao@exemplo.com",
  "productId": 1,
  "quantity": 2,
  "cardNumber": "5569000000006063",
  "cvv": "010"
}
```

**Resposta (sucesso):**
```json
{
  "id": 1,
  "status": "paid",
  "amount": 199.98,
  "gateway_id": 1,
  "external_id": "txn_abc123",
  "card_last_numbers": "6063"
}
```

### `PATCH /api/v1/gateways/:id/active`

```json
{
  "isActive": false
}
```

### `PATCH /api/v1/gateways/:id/priority`

```json
{
  "priority": 1
}
```

### `POST /api/v1/products` — Criar produto

```json
{
  "name": "Produto Exemplo",
  "amount": 99.99
}
```

### `POST /api/v1/users` — Criar usuário (ADMIN/MANAGER)

```json
{
  "email": "novo@exemplo.com",
  "password": "senha456",
  "role": "FINANCE"
}
```

### `PATCH /api/v1/users/:id/role`

```json
{
  "role": "MANAGER"
}
```

---

## Gateways de pagamento

A API usa dois gateways de pagamento distintos com esquemas de autenticação diferentes.

### Gateway 1

| Atributo | Valor |
|---|---|
| Base URL | `http://localhost:3001` (local) / `http://gateways-mock:3001` (Docker) |
| Autenticação | Login via `POST /login` → retorna Bearer Token |
| Endpoint de pagamento | `POST /transactions` |
| Endpoint de reembolso | `POST /transactions/:externalId/charge_back` |

*O token Bearer é obtido dinamicamente a cada requisição, com cache durante o processamento.*

### Gateway 2

| Atributo | Valor |
|---|---|
| Base URL | `http://localhost:3002` (local) / `http://gateways-mock:3002` (Docker) |
| Autenticação | Headers: `Gateway-Auth-Token` + `Gateway-Auth-Secret` |
| Endpoint de pagamento | `POST /transacoes` |
| Endpoint de reembolso | `POST /transacoes/reembolso` com body `{ "id": "<externalId>" }` |

### Lógica de fallback

1. Busca todos os gateways com `is_active = true`, ordenados por `priority` crescente
2. Tenta o gateway de menor prioridade primeiro
3. Se falhar (erro de rede ou resposta negativa), tenta o próximo
4. Interrompe no primeiro sucesso e registra qual gateway processou
5. Se todos falharem, a transação é marcada como `failed`

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores:

```env
# Servidor
PORT=3333
HOST=localhost
NODE_ENV=development

# Aplicação
APP_KEY=sua_chave_aleatoria_32chars
APP_URL=http://localhost:3333

# Sessão
SESSION_DRIVER=cookie

# Banco de Dados
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=betalent_db

# Gateway 1 (autenticação por login)
GATEWAY1_BASE_URL=http://localhost:3001
GATEWAY1_LOGIN_EMAIL=dev@betalent.tech
GATEWAY1_LOGIN_TOKEN=FEC9BB078BF338F464F96B48089EB498

# Gateway 2 (autenticação por headers)
GATEWAY2_BASE_URL=http://localhost:3002
GATEWAY2_AUTH_TOKEN=tk_f2198cc671b5289fa856
GATEWAY2_AUTH_SECRET=3d15e8ed6131446ea7e3456728b1211f
```

> As credenciais dos gateways acima são as fornecidas pelo mock oficial do desafio e já estão preenchidas no `.env.example`.

---

## Testes

Os testes cobrem o núcleo de negócio do `PaymentService` com 3 casos:

```bash
node ace test unit
```

| Teste | Descrição |
|---|---|
| Cálculo de valor | Confirma que `amount * quantity` é calculado corretamente |
| Fallback entre gateways | Garante que o sistema tenta o próximo gateway quando o primeiro falha |
| Todos os gateways falham | Verifica que a resposta indica falha quando nenhum gateway funciona |

Para rodar todos os testes (incluindo funcionais, se adicionados):

```bash
node ace test
```

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor em desenvolvimento com HMR |
| `npm run build` | Compila TypeScript para produção |
| `npm start` | Inicia o build compilado |
| `npm run typecheck` | Verifica tipos TypeScript sem compilar |
| `npm run lint` | Analisa código com ESLint |
| `npm run format` | Formata código com Prettier |
| `node ace test unit` | Roda testes unitários |
| `node ace migration:run` | Executa migrations pendentes |
| `node ace migration:rollback` | Reverte última migration |
| `node ace db:seed` | Popula o banco com dados iniciais |

---

## Estrutura do projeto

```
├── app/
│   ├── contracts/        # Interfaces e tipos (GatewayProvider, Roles)
│   ├── controllers/      # Handlers HTTP (payments, gateways, users, clients, products)
│   ├── middleware/        # Auth, roles, JSON response
│   ├── models/           # Modelos Lucid ORM
│   ├── services/
│   │   ├── payment_service.ts        # Lógica central de compra e reembolso
│   │   └── gateways/
│   │       ├── gateway1_provider.ts  # Integração Gateway 1 (Bearer)
│   │       └── gateway2_provider.ts  # Integração Gateway 2 (Headers)
│   ├── transformers/     # Formatação de respostas (UserTransformer)
│   └── validators/       # Schemas de validação VineJS
├── database/
│   ├── migrations/       # Criação de tabelas
│   └── seeders/          # Dados iniciais (gateways)
├── start/
│   ├── routes.ts         # Definição de todas as rotas
│   ├── openapi.ts        # Documento OpenAPI 3.0.3 (Swagger)
│   ├── kernel.ts         # Registro de middlewares
│   └── env.ts            # Validação de variáveis de ambiente
├── tests/
│   └── unit/             # Testes unitários (PaymentService)
├── docker-compose.yml
└── .env.example
```
