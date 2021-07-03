import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Feeds extends BaseSchema {
  protected tableName = 'feeds'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamps(true)
      table.text('caption')
      table.text('body')
      table.dateTime('created_at_channel')
      table.dateTime('updated_at_channel')
      table.string('channel').index()
      table.text('link')
      table.jsonb('media').defaultTo([])
      table.jsonb('author').defaultTo(JSON.stringify({
        name: '',
        profile_image: '',
        profile_link: '',
      }))
      table.boolean('is_published').defaultTo(false)
      table.boolean('is_sponsored').defaultTo(false)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
