import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersInterests extends BaseSchema {
  protected tableName = 'user_interests'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('interest_id').unsigned().references('id').inTable('interests').notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
