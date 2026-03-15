import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'
import Client from '#models/client'
import Gateway from '#models/gateway'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clientId: number

  @column()
  declare gatewayId: number | null

  @column()
  declare externalId: string | null

  @column()
  declare productId: number

  @column()
  declare quantity: number

  @column()
  declare totalAmount: number

  @column()
  declare status: 'pending' | 'paid' | 'failed' | 'refunded'

  @column()
  declare cardLastNumbers: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @manyToMany(() => Product, {
    pivotTable: 'transaction_products',
  })
  declare products: ManyToMany<typeof Product>

  @belongsTo(() => Client)
  declare client: BelongsTo<typeof Client>

  @belongsTo(() => Gateway)
  declare gateway: BelongsTo<typeof Gateway>
}
