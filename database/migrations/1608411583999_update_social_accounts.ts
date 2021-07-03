import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SocialAccounts extends BaseSchema {
  protected tableName = 'social_accounts'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.string('external_link')
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('external_link')
    })
  }
}
