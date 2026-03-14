import Client from '#models/client'
import type { HttpContext } from '@adonisjs/core/http'

export default class ClientsController {
  async index(_: HttpContext) {
    const clients = await Client.query().orderBy('id', 'asc')
    return clients
  }

  async show({ params }: HttpContext) {
    const client = await Client.query()
      .where('id', params.id)
      .preload('transactions', (query) => {
        query.preload('gateway').preload('products')
      })
      .firstOrFail()

    return client
  }
}
