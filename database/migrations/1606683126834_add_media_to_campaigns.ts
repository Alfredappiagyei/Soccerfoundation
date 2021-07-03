import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Campaigns extends BaseSchema {
  protected tableName = 'campaigns'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.string('feature_image_url')
      table.jsonb('media').defaultTo([])
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('feature_image_url')
      table.dropColumn('media')
    })
  }
}
