import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UpdateInterests extends BaseSchema {
  protected tableName = 'interests'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.boolean('is_for_brands').defaultTo(false)
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('is_for_brands')
    })
  }
}
