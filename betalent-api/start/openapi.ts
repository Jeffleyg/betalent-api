const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'beTalent API - Nível 2',
    version: '1.0.0',
    description: 'Documentação Swagger para testes da API multi-gateway.',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Auth' },
    { name: 'Products' },
    { name: 'Payments' },
    { name: 'Clients' },
    { name: 'Gateways' },
    { name: 'Users' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Token',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@betalent.local' },
          password: { type: 'string', example: '12345678' },
        },
      },
      PurchaseRequest: {
        type: 'object',
        required: ['customerName', 'customerEmail', 'productId', 'quantity', 'cardNumber', 'cvv'],
        properties: {
          customerName: { type: 'string', example: 'Cliente Teste' },
          customerEmail: { type: 'string', format: 'email', example: 'cliente@teste.com' },
          productId: { type: 'integer', example: 1 },
          quantity: { type: 'integer', example: 2 },
          cardNumber: { type: 'string', example: '5569000000006063' },
          cvv: { type: 'string', example: '100' },
        },
      },
      ProductRequest: {
        type: 'object',
        required: ['name', 'amount'],
        properties: {
          name: { type: 'string', example: 'Produto X' },
          amount: { type: 'integer', example: 1500 },
          isActive: { type: 'boolean', example: true },
        },
      },
      GatewayActiveRequest: {
        type: 'object',
        required: ['isActive'],
        properties: {
          isActive: { type: 'boolean', example: true },
        },
      },
      GatewayPriorityRequest: {
        type: 'object',
        required: ['priority'],
        properties: {
          priority: { type: 'integer', example: 1 },
        },
      },
      UserRequest: {
        type: 'object',
        required: ['email', 'password', 'role'],
        properties: {
          fullName: { type: 'string', nullable: true, example: 'Admin User' },
          email: { type: 'string', format: 'email', example: 'admin@betalent.local' },
          password: { type: 'string', example: '12345678' },
          role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'FINANCE', 'USER'] },
        },
      },
      UserRoleRequest: {
        type: 'object',
        required: ['role'],
        properties: {
          role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'FINANCE', 'USER'] },
        },
      },
    },
  },
  paths: {
    '/api/v1/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Criar conta',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'passwordConfirmation'],
                properties: {
                  fullName: { type: 'string', nullable: true },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                  passwordConfirmation: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Conta criada' } },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: { 200: { description: 'Autenticado' } },
      },
    },
    '/api/v1/payments': {
      post: {
        tags: ['Payments'],
        summary: 'Compra pública (produto + quantidade)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PurchaseRequest' },
            },
          },
        },
        responses: { 201: { description: 'Compra criada' }, 400: { description: 'Erro de compra' } },
      },
      get: {
        tags: ['Payments'],
        summary: 'Listar compras',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de compras' } },
      },
    },
    '/api/v1/payments/{id}': {
      get: {
        tags: ['Payments'],
        summary: 'Detalhe de compra',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Detalhe da compra' } },
      },
    },
    '/api/v1/payments/{id}/refund': {
      post: {
        tags: ['Payments'],
        summary: 'Reembolso da compra',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Reembolso executado' } },
      },
    },
    '/api/v1/products': {
      get: {
        tags: ['Products'],
        summary: 'Listar produtos',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de produtos' } },
      },
      post: {
        tags: ['Products'],
        summary: 'Criar produto (ADMIN/MANAGER)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductRequest' },
            },
          },
        },
        responses: { 201: { description: 'Produto criado' } },
      },
    },
    '/api/v1/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Detalhe de produto',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Detalhe do produto' } },
      },
      put: {
        tags: ['Products'],
        summary: 'Atualizar produto (ADMIN/MANAGER)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductRequest' },
            },
          },
        },
        responses: { 200: { description: 'Produto atualizado' } },
      },
      delete: {
        tags: ['Products'],
        summary: 'Remover produto (ADMIN/MANAGER)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Produto removido' } },
      },
    },
    '/api/v1/gateways': {
      get: {
        tags: ['Gateways'],
        summary: 'Listar gateways',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de gateways' } },
      },
    },
    '/api/v1/gateways/{id}/active': {
      patch: {
        tags: ['Gateways'],
        summary: 'Ativar/desativar gateway (ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GatewayActiveRequest' },
            },
          },
        },
        responses: { 200: { description: 'Gateway atualizado' } },
      },
    },
    '/api/v1/gateways/{id}/priority': {
      patch: {
        tags: ['Gateways'],
        summary: 'Alterar prioridade (ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GatewayPriorityRequest' },
            },
          },
        },
        responses: { 200: { description: 'Prioridade atualizada' } },
      },
    },
    '/api/v1/clients': {
      get: {
        tags: ['Clients'],
        summary: 'Listar clientes',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de clientes' } },
      },
    },
    '/api/v1/clients/{id}': {
      get: {
        tags: ['Clients'],
        summary: 'Detalhe do cliente com compras',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Detalhe de cliente' } },
      },
    },
    '/api/v1/users': {
      get: {
        tags: ['Users'],
        summary: 'Listar usuários (ADMIN/MANAGER)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de usuários' } },
      },
      post: {
        tags: ['Users'],
        summary: 'Criar usuário (ADMIN/MANAGER)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserRequest' },
            },
          },
        },
        responses: { 201: { description: 'Usuário criado' } },
      },
    },
    '/api/v1/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Detalhe de usuário',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Detalhe de usuário' } },
      },
      put: {
        tags: ['Users'],
        summary: 'Atualizar usuário',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserRequest' },
            },
          },
        },
        responses: { 200: { description: 'Usuário atualizado' } },
      },
      delete: {
        tags: ['Users'],
        summary: 'Remover usuário',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Usuário removido' } },
      },
    },
    '/api/v1/users/{id}/role': {
      patch: {
        tags: ['Users'],
        summary: 'Atualizar role do usuário',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserRoleRequest' },
            },
          },
        },
        responses: { 200: { description: 'Role atualizada' } },
      },
    },
  },
}

export default openApiDocument
