import Gateway from '#models/gateway'
import { updateGatewayActiveValidator, updateGatewayPriorityValidator } from '#validators/gateway'
import type { HttpContext } from '@adonisjs/core/http'

export default class GatewaysController {
  async index(_: HttpContext) {
    const gateways = await Gateway.query().orderBy('priority', 'asc')
    return gateways
  }

  async setActive({ params, request }: HttpContext) {
    const gateway = await Gateway.findOrFail(params.id)
    const payload = await request.validateUsing(updateGatewayActiveValidator)

    gateway.isActive = payload.isActive
    await gateway.save()

    return gateway
  }

  async setPriority({ params, request }: HttpContext) {
    const gateway = await Gateway.findOrFail(params.id)
    const payload = await request.validateUsing(updateGatewayPriorityValidator)

    gateway.priority = payload.priority
    await gateway.save()

    return gateway
  }
}
