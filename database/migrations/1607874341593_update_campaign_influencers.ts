import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CampaignInfluencers extends BaseSchema {
  protected tableName = 'campaign_influencers'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.decimal('amount_paid')
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('amount_paid')
    })
  }
}
