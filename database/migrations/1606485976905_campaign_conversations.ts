import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CampaignConversations extends BaseSchema {
  protected tableName = 'conversations'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamps(true)
      table.integer('campaign_id').unsigned().references('id').inTable('campaigns')
      table.text('message')
      table.jsonb('media').defaultTo([])
      table.boolean('is_from_brand').defaultTo(false)
      table.integer('influencer_id').unsigned().references('id').inTable('users')
      table.boolean('is_notified').defaultTo(false)
      table.boolean('is_broadcast').defaultTo(false)
      // table.boolean('is_read').defaultTo(false)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
