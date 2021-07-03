import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SocialAccounts extends BaseSchema {
  protected tableName = 'social_accounts'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.string('external_page_url')
      table.string('external_page_id').index()
      table.string('external_page_access_token')
      table.string('external_page_name')
      table.string('external_user_name')
      table.integer('total_posts').unsigned()
      table.integer('average_engagements').unsigned()
      table.integer('total_likes').unsigned()
      table.integer('total_comments').unsigned()
      table.string('engagement_score')
      table.integer('total_engagements').unsigned()
      table.string('average_earnings').alter()
      table.string('type')
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('external_page_url')
      table.dropColumn('external_page_id')
      table.dropColumn('external_page_access_token')
      table.dropColumn('external_page_name')
      table.dropColumn('total_posts')
      table.dropColumn('average_engagements')
      table.dropColumn('total_likes')
      table.dropColumn('total_comments')
      table.dropColumn('engagement_score')
      table.dropColumn('external_user_name')
      table.dropColumn('total_engagements')
      table.dropColumn('type')
    })
  }
}
