import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Transactions extends BaseSchema {
  protected tableName = 'transactions'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.integer('campaign_id').unsigned().references('id').inTable('campaigns')
      table.integer('influencer_id').unsigned().references('id').inTable('users')
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('campaign_id')
      table.dropColumn('influencer_id')
    })
  }
}
