import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Feeds extends BaseSchema {
  protected tableName = 'feeds'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.string('external_id').index()
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('external_id')
    })
  }
}
