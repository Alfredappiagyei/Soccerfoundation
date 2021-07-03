import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class FeedsLikes extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.table(this.tableName, table => {
      table.string('website_url')
      table.string('company_size')
      table.text('business_description').alter()
    })
  }

  public async down () {
    this.schema.table(this.tableName, table => {
      table.dropColumn('website_url')
      table.dropColumn('company_size')
      table.string('business_description').alter()
    })
  }
}
