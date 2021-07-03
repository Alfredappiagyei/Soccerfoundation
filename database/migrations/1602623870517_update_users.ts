import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UpdateUsers extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, table=>{
      table.string('last_name').nullable().alter()
      table.string('first_name').nullable().alter()
    })
    this.schema.table(this.tableName, table=>{
      table.string('business_name')
      table.string('representative_name')
      table.decimal('budget')
      table.string('offering')
      table.string('business_description')
    })
  }

  public async down () {
    this.schema.table(this.tableName, table=>{
      table.dropColumn('business_name')
      table.dropColumn('representative_name')
      table.dropColumn('budget')
      table.dropColumn('offering')
      table.dropColumn('business_description')
    })
  }
}
