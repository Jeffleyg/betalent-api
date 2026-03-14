import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon';
import Transaction from './transaction';

export default class Client extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column.DateTime({autoCreate: true})
  declare createdAt: DateTime

  @column.DateTime({autoCreate: true, autoUpdate: true})
  declare updatedAt: DateTime

  @hasMany(() => Transaction)
  declare transactions: hasMany<typeof Transaction>
}
