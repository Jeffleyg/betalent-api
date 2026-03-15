/* eslint-disable @adonisjs/prefer-lazy-controller-import */
/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import AccessTokenController from '#controllers/access_token_controller'
import NewAccountController from '#controllers/new_account_controller'
import ProfileController from '#controllers/profile_controller'
import PaymentsController from '#controllers/payments_controller'
import ProductsController from '#controllers/products_controller'
import UsersController from '#controllers/users_controller'
import GatewaysController from '#controllers/gateways_controller'
import ClientsController from '#controllers/client_controller'
import { Roles } from '#contracts/roles'
import openApiDocument from '#start/openapi'

router.get('/api/docs/openapi.json', () => openApiDocument)

router.get('/api/docs', ({ response }) => {
  return response.type('text/html').send(`
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>beTalent API - Swagger</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      html { box-sizing: border-box; overflow-y: scroll; }
      *, *:before, *:after { box-sizing: inherit; }
      body { margin: 0; background: #fafafa; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api/docs/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        persistAuthorization: true,
      })
    </script>
  </body>
</html>
`)
})

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router.post('payments', [PaymentsController, 'store'])

    router
      .group(() => {
        router.post('signup', [NewAccountController, 'store'])
        router.post('login', [AccessTokenController, 'store'])
        router.post('logout', [AccessTokenController, 'destroy']).use(middleware.auth())
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('/profile', [ProfileController, 'show'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [ProductsController, 'index'])
        router.get('/:id', [ProductsController, 'show'])
        router
          .post('/', [ProductsController, 'store'])
          .use(middleware.role({ roles: [Roles.ADMIN, Roles.MANAGER] }))
        router
          .put('/:id', [ProductsController, 'update'])
          .use(middleware.role({ roles: [Roles.ADMIN, Roles.MANAGER] }))
        router
          .delete('/:id', [ProductsController, 'destroy'])
          .use(middleware.role({ roles: [Roles.ADMIN, Roles.MANAGER] }))
      })
      .prefix('products')
      .as('products')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [UsersController, 'index'])
        router.get('/:id', [UsersController, 'show'])
        router.post('/', [UsersController, 'store'])
        router.put('/:id', [UsersController, 'update'])
        router.delete('/:id', [UsersController, 'destroy'])
        router.patch('/:id/role', [UsersController, 'updateRole'])
      })
      .prefix('users')
      .as('users')
      .use(middleware.auth())
      .use(middleware.role({ roles: [Roles.ADMIN, Roles.MANAGER] }))

    router
      .group(() => {
        router.get('/', [ClientsController, 'index'])
        router.get('/:id', [ClientsController, 'show'])
      })
      .prefix('clients')
      .as('clients')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [GatewaysController, 'index'])
        router.patch('/:id/active', [GatewaysController, 'setActive'])
        router.patch('/:id/priority', [GatewaysController, 'setPriority'])
      })
      .prefix('gateways')
      .as('gateways')
      .use(middleware.auth())
      .use(middleware.role({ roles: [Roles.ADMIN] }))

    router
      .group(() => {
        router.get('/', [PaymentsController, 'index'])
        router.get('/:id', [PaymentsController, 'show'])
        router
          .post('/:id/refund', [PaymentsController, 'refund'])
          .use(middleware.role({ roles: [Roles.ADMIN, Roles.FINANCE] }))
      })
      .prefix('payments')
      .as('payments')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
