import User from '#models/user'
import {
  createManagedUserValidator,
  updateManagedUserValidator,
  updateUserRoleValidator,
} from '#validators/user_management'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class UsersController {
  async index({ serialize }: HttpContext) {
    const users = await User.query().orderBy('id', 'asc')
    return serialize(users.map((user) => UserTransformer.transform(user)))
  }

  async show({ params, serialize }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return serialize(UserTransformer.transform(user))
  }

  async store({ request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createManagedUserValidator)
    const user = await User.create(payload)

    return response.created(serialize(UserTransformer.transform(user)))
  }

  async update({ params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateManagedUserValidator)
    const user = await User.findOrFail(params.id)

    user.merge(payload)
    await user.save()

    return serialize(UserTransformer.transform(user))
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.delete()

    return response.noContent()
  }

  async updateRole({ params, request, serialize }: HttpContext) {
    const { role } = await request.validateUsing(updateUserRoleValidator)
    const user = await User.findOrFail(params.id)
    user.role = role
    await user.save()
    return serialize(UserTransformer.transform(user))
  }
}
