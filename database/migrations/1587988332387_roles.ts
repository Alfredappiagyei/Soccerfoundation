import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Roles extends BaseSchema {
  protected tableName = 'roles'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.timestamps(true)
      table.string('name').notNullable().index()
      table.string('display_name').notNullable().index()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
