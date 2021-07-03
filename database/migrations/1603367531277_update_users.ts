import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UpdateUsers extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.boolean('is_email_verified').defaultTo(false)
      table.boolean('is_phone_number_verified').defaultTo(false)
      table.dateTime('phone_verification_expire_date')
      table.string('phone_verification_code')
      table.string('profile_url')
      table.text('description')
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('is_email_verified')
      table.dropColumn('is_phone_number_verified')
      table.dropColumn('phone_verification_expire_date')
      table.dropColumn('phone_verification_code')
      table.dropColumn('profile_url')
      table.dropColumn('description')
    })
  }
}
