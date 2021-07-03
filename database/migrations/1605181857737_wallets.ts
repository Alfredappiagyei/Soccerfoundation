import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Wallets extends BaseSchema {
  protected tableName = 'wallets'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamps(true)
      table.decimal('balance').defaultTo(0)
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('currency').notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
