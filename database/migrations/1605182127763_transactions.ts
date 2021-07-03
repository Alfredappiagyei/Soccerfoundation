import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Transactions extends BaseSchema {
  protected tableName = 'transactions'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamps(true)
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('currency').notNullable()
      table.integer('wallet_id').unsigned().references('id').inTable('wallets')
      table.decimal('amount').notNullable().defaultTo(0)
      table.decimal('fees').defaultTo(0)
      table.decimal('total_charge').defaultTo(0)
      table.decimal('settled_amount').defaultTo(0)
      table.string('status').notNullable() //successful, failed, escrow, disputed
      table.string('flow').notNullable().index() // inward, outward
      table.string('activity').notNullable()
      table.string('external_transaction_id')
      table.decimal('initial_balance').notNullable()
      table.decimal('final_balance').notNullable()
      table.string('provider')
      table.string('account_number')
      table.text('description')
      table.string('payment_type') //mtnv, visa, mpesa etc, 
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
