import { Roles, type Role } from '#contracts/roles'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { roles?: Role[] } = {}) {
    const user = ctx.auth.getUserOrFail()
    const allowedRoles = options.roles ?? []
    const userRole = (user.role as Role | undefined) ?? Roles.USER

    if (allowedRoles.length === 0) {
      return next()
    }

    if (!allowedRoles.includes(userRole)) {
      return ctx.response.forbidden({ message: 'Você não tem permissão para esta ação.' })
    }

    return next()
  }
}
