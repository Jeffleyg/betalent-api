import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'
import Client from '#models/client'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clientId: number

  @column()
  declare gatewayId: number

  @column()
  declare totalAmount: number

  @column()
  declare status: 'pending' | 'paid' | 'failed' | 'refunded'

  @manyToMany(() => Product, {
    pivotTable: 'transaction_products',
  })
  declare products: ManyToMany<typeof Product>

  @belongsTo(() => Client)
  declare client: BelongsTo<typeof Client>
}
