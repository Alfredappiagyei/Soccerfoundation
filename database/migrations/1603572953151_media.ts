import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Media extends BaseSchema {
  protected tableName = 'media'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamps(true)
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.boolean('is_secured').defaultTo(true)
      table.string('url').notNullable().index()
      table.string('name').notNullable()
      table.string('type').notNullable()
      table.jsonb('allowed_access').defaultTo([])
      table.string('external_key').notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
