import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Campaign, { CampaignType } from 'App/Models/Campaign'
import CampaignInfluencer, {
  CampaignInfluencerStatus,
} from 'App/Models/CampaignInfluencer'
import Transaction, { CashFlow } from 'App/Models/Transaction'
import User, { ROLES } from 'App/Models/User'

export default class DashboardController {
  /**
     * generalStats
{  }: Htt     */
  public async generalStats ({ request }: HttpContextContract) {
    const validationSchema = schema.create({
      from: schema.date.optional(),
      to: schema.date.optional(),
    })
    const validatedData = await request.validate({
      schema: validationSchema,
    })
    const [
      totalUsers,
      totalNotApprovedInfluencers,
      totalApprovedInfluencers,
      totalCampaigns,
      totalBarterCampaigns,
      totalAmountLoaded,
      totalAmountPaidOut,
    ] = await Promise.all([
      User.query()
        .where(builder => {
          if (validatedData.from && validatedData.to) {
            builder
              .where('created_at', '>=', validatedData.from as any)
              .where('created_at', '<=', validatedData.to as any)
          }
        })
        .countDistinct('id'),
      User.query()
        .where(builder => {
          if (validatedData.from && validatedData.to) {
            builder
              .where('created_at', '>=', validatedData.from as any)
              .where('created_at', '<=', validatedData.to as any)
          }
        })
        .whereHas('userRole', builder =>
          builder.where('name', ROLES.INFLUENCER)
        )
        .where('approved', false)
        .countDistinct('id'),
      User.query()
        .where(builder => {
          if (validatedData.from && validatedData.to) {
            builder
              .where('created_at', '>=', validatedData.from as any)
              .where('created_at', '<=', validatedData.to as any)
          }
        })
        .whereHas('userRole', builder =>
          builder.where('name', ROLES.INFLUENCER)
        )
        .where('approved', true)
        .countDistinct('id'),
      Campaign.query()
        .where(builder => {
          if (validatedData.from && validatedData.to) {
            builder
              .where('created_at', '>=', validatedData.from as any)
              .where('created_at', '<=', validatedData.to as any)
          }
        })
        .where('type', CampaignType.CAMPAIGN)
        .countDistinct('id'),
      Campaign.query()
        .where(builder => {
          if (validatedData.from && validatedData.to) {
            builder
              .where('created_at', '>=', validatedData.from as any)
              .where('created_at', '<=', validatedData.to as any)
          }
        })
        .where('type', CampaignType.BARTER)
        .countDistinct('id'),
      Transaction.query()
        .where(builder => {
          if (validatedData.from && validatedData.to) {
            builder
              .where('created_at', '>=', validatedData.from as any)
              .where('created_at', '<=', validatedData.to as any)
          }
        })
        .where('flow', CashFlow.INWARD)
        .sum('amount'),
      Transaction.query()
        .where(builder => {
          if (validatedData.from && validatedData.to) {
            builder
              .where('created_at', '>=', validatedData.from as any)
              .where('created_at', '<=', validatedData.to as any)
          }
        })
        .where('flow', CashFlow.OUTWARD)
        .whereNotNull('campaignId')
        .sum('amount'),
    ])

    return {
      total_users: totalUsers[0]?.count,
      total_influencers_not_approved: totalNotApprovedInfluencers[0]?.count,
      total_approved_influencers: totalApprovedInfluencers[0]?.count,
      total_campaigns: totalCampaigns[0]?.count,
      total_barter_campaigns: totalBarterCampaigns[0]?.count,
      total_amount_loaded: totalAmountLoaded[0]?.sum,
      total_amount_paid_out: totalAmountPaidOut[0]?.sum,
    }
  }
}
