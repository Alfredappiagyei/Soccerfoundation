import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SocialAccounts extends BaseSchema {
  protected tableName = 'social_accounts'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamps(true)
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('platform').index().notNullable()
      table.string('external_id').index().notNullable()
      table.string('external_name').notNullable()
      table.string('external_access_token')
      table.string('external_access_token_secret')
      table.string('external_profile_url')
      table.integer('number_of_followers').unsigned()
      table.integer('number_of_friends').unsigned()
      table.integer('number_of_following').unsigned()
      table.decimal('engagement_rate').unsigned()
      table.decimal('average_comments').unsigned()
      table.decimal('average_likes').unsigned()
      table.decimal('average_earnings').unsigned()
      table.jsonb('recent_content').defaultTo([])
      table.integer('impressions').unsigned()
      table.jsonb('post_interests').defaultTo([])
      table.decimal('min_age')
      table.decimal('max_age')
      table.string('gender')
      table.boolean('is_private').defaultTo(false)
      table.boolean('is_active').defaultTo(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
