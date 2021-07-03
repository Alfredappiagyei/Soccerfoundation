import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CampaignsInfluencers extends BaseSchema {
  protected tableName = 'campaign_influencers'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamps(true)
      table.integer('campaign_id').unsigned().references('id').inTable('campaigns')
      table.integer('influencer_id').unsigned().references('id').inTable('users')
      table.string('status').index()
      table.decimal('amount').defaultTo(0)
      table.boolean('is_invite_sent').defaultTo(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
