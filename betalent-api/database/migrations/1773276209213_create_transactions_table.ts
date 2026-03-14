import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('client_id').unsigned().references('id').inTable('clients')
      table.integer('gateway_id').unsigned().references('id').inTable('gateways')
      table.string('external_id').nullable() // ID que vem da API do gateway
      table.enum('status', ['pending', 'paid', 'failed', 'refunded']).defaultTo('pending')
      table.integer('product_id').unsigned().references('id').inTable('products')
      table.integer('quantity').notNullable()
      table.integer('total_amount').notNullable()
      table.string('card_last_numbers', 4).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
