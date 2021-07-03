import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TokensSchema extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('role').unsigned().references('id').inTable('roles').notNullable()
      table.string('first_name').notNullable().index()
      table.string('last_name').notNullable().index()
      table.string('phone_number').unique().index().notNullable()
      table.string('email', 255).unique().index().notNullable()
      table.string('password', 180).notNullable()
      table.string('remember_me_token')
      table.string('country')
      table.string('city')
      table.string('instagram_handle').unique()
      table.string('twitter_handle').unique()
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
