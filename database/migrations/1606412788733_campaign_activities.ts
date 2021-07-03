import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CampaignActivities extends BaseSchema {
  protected tableName = 'campaign_activities'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamps(true)
      table.integer('campaign_id').unsigned().references('id').inTable('campaigns')
      table.text('description')
      table.string('title')
      table.integer('influencer_id').unsigned().references('id').inTable('users')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
