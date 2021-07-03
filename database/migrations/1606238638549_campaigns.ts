import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Campaigns extends BaseSchema {
  protected tableName = 'campaigns'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamps(true)
      table.integer('owner_id').unsigned().references('id').inTable('users')
      table.string('name').notNullable().index()
      table.text('description').notNullable()
      table.string('company_name').notNullable()
      table.jsonb('objectives').defaultTo([])
      table.string('country').notNullable()
      table.string('city').notNullable()
      table.text('requirements')
      table.text('goals')
      table.text('notes') //the do`s and donts of the campaign or extra note for this campaign
      table.jsonb('category')
      table.integer('max_age_group').unsigned()
      table.integer('min_age_group').unsigned()
      table.string('gender')
      table.dateTime('min_duration')
      table.dateTime('max_duration')
      table.decimal('budget').unsigned()
      table.string('status')
      table.string('type').index()
      table.json('social_platforms').defaultTo([])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
