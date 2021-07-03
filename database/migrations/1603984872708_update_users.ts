import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UpdateUsers extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.table(this.tableName, table => {
      table.boolean('approved').defaultTo(false)
      table.string('status').defaultTo('signed_up')
      // submitted, rejected, active, deactivated, blocked, signed_up
      table.string('influencer_type').index()
      table.text('rejection_reason')
    })
  }

  public async down () {
    this.schema.table(this.tableName, table => {
      table.dropColumn('approved')
      table.dropColumn('status')
      table.dropColumn('influencer_type')
      table.dropColumn('rejection_reason')
    })
  }
}
