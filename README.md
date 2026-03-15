<div align="center">

# beTalent API

**API RESTful de pagamentos multi-gateway com fallback automático — Nível 3**

![AdonisJS](https://img.shields.io/badge/AdonisJS-7-5A45FF?style=flat-square&logo=adonisjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![Node](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=nodedotjs)
![Japa](https://img.shields.io/badge/Tested%20with-Japa-6C63FF?style=flat-square)

</div>

---

## Sobre o projeto

API construída com **AdonisJS 7 + TypeScript** para processamento de pagamentos com suporte a múltiplos gateways e fallback automático. Quando o gateway primário falha, o sistema tenta automaticamente o próximo gateway ativo na ordem de prioridade, garantindo alta disponibilidade nas transações.

Este projeto implementa o **Nível 3** do desafio técnico BeTalent, contemplando:

- Compra pública calculada via back-end a partir de **múltiplos produtos e quantidades**
- Gateways externos com **autenticação** (Bearer Token e Headers)
- **Controle de acesso por papel** (ADMIN, MANAGER, FINANCE, USER)
- **TDD** com Japa cobrindo o núcleo de negócio do `PaymentService`
- Ambiente completo com **Docker Compose** (API + MySQL + mock dos gateways)
- Documentação interativa via **Swagger UI**

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

A forma recomendada. Um único comando sobe a API, o banco de dados e os mocks dos gateways.

```bash
docker compose up --build
```

Aguarde os containers iniciarem (cerca de 20–30 segundos). A API estará disponível em:

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

> **Nota:** A porta do MySQL no host é `3307` para evitar conflito com instalações locais do MySQL na porta `3306`.

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

A documentação lista todas as rotas, parâmetros, exemplos de payload e requisitos de autenticação.

### Como autenticar no Swagger

1. Acesse `POST /api/v1/auth/login` no Swagger e faça login
2. Copie o valor do campo `token` da resposta
3. Clique em **Authorize** (canto superior direito do Swagger)
4. Cole no formato exato: `Bearer SEU_TOKEN`
5. Confirme — a partir daí, todas as chamadas autenticadas funcionarão

O documento OpenAPI bruto está disponível em:

```
http://localhost:3333/api/docs/openapi.json
```

---

## Banco de dados

### Diagrama de tabelas

```
users
  id, full_name, email, password, role (ADMIN|MANAGER|FINANCE|USER), created_at, updated_at

gateways
  id, name, is_active, priority, created_at, updated_at

clients
  id, name, email, created_at, updated_at

products
  id, name, amount, is_active, created_at, updated_at

transactions
  id, client_id (FK), gateway_id (FK)
  external_id, status (pending|paid|failed|refunded)
  amount, card_last_numbers, created_at, updated_at

transaction_products  (snapshot imutável da compra — preserva dados mesmo se produto mudar)
  id, transaction_id (FK), product_id (FK)
  product_name, product_amount, quantity
  created_at, updated_at

access_tokens
  id, tokenable_id (FK users), hash, abilities, expires_at, ...
```

> `transaction_products` funciona como um **snapshot**: mesmo que o produto seja editado ou removido depois, o histórico da compra permanece intacto com os valores no momento da transação.

### Status de transação

| Status | Descrição |
|---|---|
| `pending` | Processamento iniciado |
| `paid` | Aprovada por um gateway |
| `failed` | Todos os gateways rejeitaram |
| `refunded` | Estornada com sucesso |

### Papéis de usuário (roles)

| Role | Produtos | Usuários | Reembolso | Gateways |
|---|---|---|---|---|
| `ADMIN` | ✅ criar/editar/remover | ✅ CRUD completo | ✅ | ✅ |
| `MANAGER` | ✅ criar/editar/remover | ✅ CRUD completo | ❌ | ❌ |
| `FINANCE` | ✅ criar/editar/remover | ❌ | ✅ | ❌ |
| `USER` | 👁 somente leitura | ❌ | ❌ | ❌ |

> Todos os roles autenticados podem listar produtos, clientes, pagamentos e seu próprio perfil.

---

## Referência de rotas

Prefixo base: `/api/v1`

### Rotas públicas (sem autenticação)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/signup` | Criar nova conta (role padrão: `USER`) |
| `POST` | `/auth/login` | Autenticar e obter Bearer token |
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
| `GET` | `/products` | Qualquer | Listar produtos ativos |
| `GET` | `/products/:id` | Qualquer | Detalhar produto |
| `POST` | `/products` | ADMIN, MANAGER, FINANCE | Criar produto |
| `PUT` | `/products/:id` | ADMIN, MANAGER, FINANCE | Atualizar produto |
| `DELETE` | `/products/:id` | ADMIN, MANAGER, FINANCE | Remover produto |

#### Usuários

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/users` | ADMIN, MANAGER | Listar usuários |
| `GET` | `/users/:id` | ADMIN, MANAGER | Detalhar usuário |
| `POST` | `/users` | ADMIN, MANAGER | Criar usuário com role definida |
| `PUT` | `/users/:id` | ADMIN, MANAGER | Atualizar dados do usuário |
| `DELETE` | `/users/:id` | ADMIN, MANAGER | Remover usuário |
| `PATCH` | `/users/:id/role` | ADMIN, MANAGER | Alterar papel do usuário |

#### Clientes

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/clients` | Qualquer | Listar todos os clientes |
| `GET` | `/clients/:id` | Qualquer | Detalhar cliente com histórico completo de compras |

#### Pagamentos

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/payments` | Qualquer | Listar todas as transações |
| `GET` | `/payments/:id` | Qualquer | Detalhar transação |
| `POST` | `/payments/:id/refund` | ADMIN, FINANCE | Solicitar reembolso junto ao gateway original |

#### Gateways

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/gateways` | ADMIN | Listar gateways com status e prioridade |
| `PATCH` | `/gateways/:id/active` | ADMIN | Ativar ou desativar gateway |
| `PATCH` | `/gateways/:id/priority` | ADMIN | Alterar prioridade do gateway |

---

## Guia de testes por role

> **Importante:** O `signup` sempre cria o usuário com role `USER`. Para testar com outras roles, crie o usuário via `POST /users` (estando autenticado como ADMIN/MANAGER), ou atualize via banco conforme abaixo.

### Criando usuários de teste via banco de dados

Após criar contas via Swagger (`POST /auth/signup`), eleve as roles:

```bash
docker compose exec mysql mysql -uroot -proot -D betalent_db -e "
  UPDATE users SET role='ADMIN'   WHERE email='admin@teste.com';
  UPDATE users SET role='MANAGER' WHERE email='manager@teste.com';
  UPDATE users SET role='FINANCE' WHERE email='finance@teste.com';
  SELECT id, email, role FROM users;
"
```

### Matriz de permissões por endpoint

| Endpoint | ADMIN | MANAGER | FINANCE | USER |
|---|---|---|---|---|
| `POST /products` | ✅ 201 | ✅ 201 | ✅ 201 | ❌ 403 |
| `PUT /products/:id` | ✅ 200 | ✅ 200 | ✅ 200 | ❌ 403 |
| `DELETE /products/:id` | ✅ 204 | ✅ 204 | ✅ 204 | ❌ 403 |
| `POST /users` | ✅ 201 | ✅ 201 | ❌ 403 | ❌ 403 |
| `PATCH /users/:id/role` | ✅ 200 | ✅ 200 | ❌ 403 | ❌ 403 |
| `POST /payments/:id/refund` | ✅ 200 | ❌ 403 | ✅ 200 | ❌ 403 |
| `PATCH /gateways/:id/active` | ✅ 200 | ❌ 403 | ❌ 403 | ❌ 403 |
| `GET /products` | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 |
| `GET /clients` | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 |

### Resposta de acesso negado

Sempre que um role não tem permissão, a API retorna:

```json
{
  "message": "Você não tem permissão para esta ação."
}
```

### Resposta de não autenticado (sem token ou token inválido)

```json
{
  "errors": [
    {
      "message": "Unauthorized access"
    }
  ]
}
```

---

## Fluxo completo de teste (passo a passo)

### 1. Criar e autenticar um usuário ADMIN

```json
POST /api/v1/auth/signup
{
  "fullName": "Admin Teste",
  "email": "admin@teste.com",
  "password": "Admin@12345",
  "passwordConfirmation": "Admin@12345"
}
```

Eleve a role no banco:

```bash
docker compose exec mysql mysql -uroot -proot -D betalent_db -e \
  "UPDATE users SET role='ADMIN' WHERE email='admin@teste.com';"
```

Faça login e copie o token:

```json
POST /api/v1/auth/login
{
  "email": "admin@teste.com",
  "password": "Admin@12345"
}
```

**Resposta:**

```json
{
  "user": {
    "id": 1,
    "fullName": "Admin Teste",
    "email": "admin@teste.com",
    "role": "ADMIN"
  },
  "token": "oat_MQ.ABC123xyz..."
}
```

No Swagger, clique em **Authorize** e cole: `Bearer oat_MQ.ABC123xyz...`

---

### 2. Criar um produto

```json
POST /api/v1/products
{
  "name": "Plano Premium",
  "amount": 9990,
  "isActive": true
}
```

> `amount` é o valor em **centavos** (9990 = R$ 99,90).

**Resposta:**

```json
{
  "id": 1,
  "name": "Plano Premium",
  "amount": 9990,
  "isActive": true,
  "createdAt": "2026-03-15T10:00:00.000Z"
}
```

---

### 3. Realizar uma compra (rota pública)

```json
POST /api/v1/payments
{
  "customerName": "João Silva",
  "customerEmail": "joao@email.com",
  "productId": 1,
  "quantity": 2,
  "cardNumber": "5569000000006063",
  "cvv": "010"
}
```

> O back-end calcula automaticamente `amount = product.amount × quantity` (sem o cliente informar o valor).

**Resposta (sucesso — gateway 1 processou):**

```json
{
  "id": 1,
  "status": "paid",
  "amount": 19980,
  "gatewayId": 1,
  "externalId": "txn_abc123",
  "cardLastNumbers": "6063"
}
```

**Simular falha no cartão** — use CVV `100` ou `200` no Gateway 1:

```json
{ "cvv": "100" }
```

Nesse caso, o sistema tentará automaticamente o Gateway 2 antes de retornar erro.

---

### 4. Detalhar cliente com histórico de compras

```
GET /api/v1/clients/1
```

**Resposta:**

```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com",
  "transactions": [
    {
      "id": 1,
      "status": "paid",
      "amount": 19980,
      "cardLastNumbers": "6063",
      "createdAt": "2026-03-15T10:00:00.000Z",
      "products": [
        {
          "productName": "Plano Premium",
          "productAmount": 9990,
          "quantity": 2
        }
      ]
    }
  ]
}
```

---

### 5. Solicitar reembolso (ADMIN ou FINANCE)

```
POST /api/v1/payments/1/refund
```

**Resposta:**

```json
{
  "id": 1,
  "status": "refunded",
  "amount": 19980,
  "externalId": "txn_abc123"
}
```

O reembolso é enviado ao **mesmo gateway** que processou a compra original.

---

### 6. Gerenciar gateways (somente ADMIN)

Desativar gateway 1:

```json
PATCH /api/v1/gateways/1/active
{
  "isActive": false
}
```

Alterar prioridade (menor número = maior prioridade):

```json
PATCH /api/v1/gateways/1/priority
{
  "priority": 2
}
```

---

## Payloads de referência

### `POST /api/v1/auth/signup`

```json
{
  "fullName": "Nome Completo",
  "email": "usuario@exemplo.com",
  "password": "Senha@12345",
  "passwordConfirmation": "Senha@12345"
}
```

### `POST /api/v1/users` — Criar usuário com role (ADMIN/MANAGER)

```json
{
  "fullName": "Financeiro",
  "email": "finance@empresa.com",
  "password": "Senha@12345",
  "role": "FINANCE"
}
```

### `PATCH /api/v1/users/:id/role`

```json
{
  "role": "MANAGER"
}
```

### `POST /api/v1/products`

```json
{
  "name": "Produto Exemplo",
  "amount": 4990,
  "isActive": true
}
```

### `PUT /api/v1/products/:id`

```json
{
  "name": "Produto Atualizado",
  "amount": 5990,
  "isActive": true
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

---

## Gateways de pagamento

A API usa dois gateways de pagamento distintos com esquemas de autenticação diferentes. A integração fica em `app/services/gateways/`.

### Gateway 1

| Atributo | Valor |
|---|---|
| Base URL | `http://localhost:3001` (local) / `http://gateways-mock:3001` (Docker) |
| Autenticação | Login via `POST /login` → retorna Bearer Token dinâmico |
| Endpoint de pagamento | `POST /transactions` |
| Endpoint de reembolso | `POST /transactions/:externalId/charge_back` |
| Campos do payload | `amount`, `name`, `email`, `cardNumber`, `cvv` |
| CVV que simula erro | `100` ou `200` |

> O token Bearer do Gateway 1 é obtido automaticamente e mantido em cache durante o ciclo de vida da requisição.

### Gateway 2

| Atributo | Valor |
|---|---|
| Base URL | `http://localhost:3002` (local) / `http://gateways-mock:3002` (Docker) |
| Autenticação | Headers `Gateway-Auth-Token` + `Gateway-Auth-Secret` |
| Endpoint de pagamento | `POST /transacoes` |
| Endpoint de reembolso | `POST /transacoes/reembolso` com body `{ "id": "<externalId>" }` |
| Campos do payload | `valor`, `nome`, `email`, `numeroCartao`, `cvv` |
| CVV que simula erro | `200` ou `300` |

### Lógica de fallback

1. Busca todos os gateways com `is_active = true`, ordenados por `priority` crescente
2. Tenta o gateway de menor prioridade (número menor = mais prioritário)
3. Se falhar (erro de rede, HTTP 4xx/5xx, ou `cvv` inválido), tenta o próximo
4. Interrompe no **primeiro sucesso** e registra qual gateway processou
5. Se todos falharem, a transação é salva como `failed` e a compra retorna erro

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

> As credenciais dos gateways são as fornecidas pelo mock oficial do desafio e já estão preenchidas no `.env.example`.

---

## Testes

Os testes cobrem o núcleo de negócio do `PaymentService` usando **doubles** (stubs) dos gateways para isolar o comportamento sem dependência de rede.

```bash
node ace test unit
```

| Teste | O que valida |
|---|---|
| Pagamento aprovado pelo primeiro gateway | Gateway 1 funciona → transação `paid`, gateway registrado corretamente |
| Fallback automático para o segundo gateway | Gateway 1 falha → sistema tenta Gateway 2 → transação `paid` |
| Todos os gateways falham | Ambos falham → transação `failed`, erro retornado |

Para rodar com saída detalhada:

```bash
node ace test unit --reporters=spec
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
| `node ace test unit --reporters=spec` | Testes unitários com saída detalhada |
| `node ace migration:run` | Executa migrations pendentes |
| `node ace migration:rollback` | Reverte última migration |
| `node ace db:seed` | Popula o banco com gateways padrão |

---

## Estrutura do projeto

```
├── app/
│   ├── contracts/
│   │   ├── GatewayProvider.ts   # Interface base para novos gateways
│   │   └── roles.ts             # Enum de roles do sistema
│   ├── controllers/             # Handlers HTTP de cada recurso
│   ├── middleware/
│   │   ├── auth_middleware.ts         # Valida Bearer token
│   │   ├── role_middleware.ts         # Controle de acesso por role
│   │   └── force_json_response_middleware.ts
│   ├── models/                  # Modelos Lucid ORM (User, Product, Transaction...)
│   ├── services/
│   │   ├── payment_service.ts         # Lógica central: compra, fallback e reembolso
│   │   └── gateways/
│   │       ├── gateway1_provider.ts   # Gateway 1 — autenticação Bearer
│   │       └── gateway2_provider.ts   # Gateway 2 — autenticação por Headers
│   ├── transformers/            # Serialização de respostas (UserTransformer)
│   └── validators/              # Schemas VineJS por recurso
├── database/
│   ├── migrations/              # Uma migration por tabela
│   └── seeders/
│       └── main_seeder.ts       # Registra gateway1 e gateway2 no banco
├── start/
│   ├── routes.ts                # Todas as rotas, grupos e middlewares
│   ├── openapi.ts               # Documento OpenAPI 3.0.3 completo
│   ├── kernel.ts                # Registro de middlewares globais e nomeados
│   └── env.ts                   # Validação das variáveis de ambiente
├── tests/
│   └── unit/
│       └── payment_service.spec.ts   # TDD do serviço de pagamentos
├── docker-compose.yml
└── .env.example
```

### Como adicionar um novo gateway

A arquitetura foi desenhada para extensibilidade. Para adicionar um terceiro gateway:

1. Crie `app/services/gateways/gateway3_provider.ts` estendendo `GatewayProvider`
2. Implemente os métodos `processPayment()` e `refund()`
3. Registre as variáveis de ambiente em `start/env.ts`
4. Injete o provider no `PaymentService` via `providers/api_provider.ts`

Nenhuma outra parte do sistema precisa ser alterada.
