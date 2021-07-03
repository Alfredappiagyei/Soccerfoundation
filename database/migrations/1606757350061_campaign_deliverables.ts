import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CampaignDeliverables extends BaseSchema {
  protected tableName = 'campaign_deliverables'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamps(true)
      table.string('platform').index()
      table.text('caption')
      table.text('body')
      table.dateTime('created_at_channel')
      table.dateTime('updated_at_channel')
      table.string('channel').index()
      table.text('link')
      table.jsonb('media').defaultTo([])
      table.jsonb('author').defaultTo(JSON.stringify({
        name: '',
        profile_image: '',
        profile_link: '',
      }))
      table.integer('total_likes').unsigned()
      table.integer('total_comments').unsigned()
      table.string('engagement_score')
      table.integer('total_engagements').unsigned()
      table.integer('retweet_count').unsigned()
      table.decimal('engagement_rate').unsigned()
      table.integer('campaign_id').unsigned().references('id').inTable('campaigns')
      table.integer('influencer_id').unsigned().references('id').inTable('users')
      table.string('external_id')
      table.string('type').defaultTo('post').index()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
