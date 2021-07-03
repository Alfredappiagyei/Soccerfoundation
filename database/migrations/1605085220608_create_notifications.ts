import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CreateNotifications extends BaseSchema {
  protected tableName = 'notifications'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamps(true)
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.text('message').notNullable().index('message')
      table.jsonb('tags').defaultTo([])
      table.boolean('is_from_admin').defaultTo(false)
      table.string('title').notNullable()
      table.boolean('is_read').defaultTo(false)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
