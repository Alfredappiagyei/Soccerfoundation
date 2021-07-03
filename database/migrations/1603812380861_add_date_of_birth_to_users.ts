import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddDateOfBirthToUsers extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.dateTime('date_of_birth')
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('date_of_birth')
    })
  }
}
