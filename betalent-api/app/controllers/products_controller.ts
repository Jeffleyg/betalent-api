import Product from '#models/product'
import { createProductValidator, updateProductValidator } from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProductsController {
  async index(_: HttpContext) {
    const products = await Product.query().orderBy('id', 'asc')
    return products
  }

  async show({ params }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    return product
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createProductValidator)
    const product = await Product.create(payload)
    return response.created(product)
  }

  async update({ params, request }: HttpContext) {
    const payload = await request.validateUsing(updateProductValidator)
    const product = await Product.findOrFail(params.id)
    product.merge(payload)
    await product.save()
    return product
  }

  async destroy({ params, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    await product.delete()
    return response.noContent()
  }
}
