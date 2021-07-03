import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class FeedsLikes extends BaseSchema {
  protected tableName = 'feeds_likes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamps(true)
      table.integer('feed_id').unsigned().references('id').inTable('feeds')
      table.integer('user_id').unsigned().references('id').inTable('users')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
