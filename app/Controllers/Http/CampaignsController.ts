'use strict'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Campaign, {
  CampaignGender,
  CampaignStatues,
  CampaignType,
} from 'App/Models/Campaign'
import CampaignInfluencer, {
  CampaignInfluencerStatus,
} from 'App/Models/CampaignInfluencer'
import User, { ROLES } from 'App/Models/User'
import { sortBy } from 'lodash'
import Event from '@ioc:Adonis/Core/Event'
import { SupportedPlatforms } from 'App/Models/SocialAccount'

const expectedAmountForBarterType = 1000
export default class CampaignsController {
  /**
     * index
{}: Htt     */
  public async index ({ auth, request }: HttpContextContract) {
    const userRole = await auth.user
      ?.related('userRole')
      .query()
      .firstOrFail()

    const validationSchema = schema.create({
      page: schema.number.optional(),
      per_page: schema.number.optional(),
      campaign_influencer_status: schema.array
        .optional()
        .members(schema.enum(Object.values(CampaignInfluencerStatus))),
      type: schema.enum(Object.values(CampaignType)),
    })
    const validatedData = await request.validate({
      schema: validationSchema,
    })

    const { page = 1, per_page: itemPerPage = 20, type } = validatedData
    let baseQuery = auth.user?.related('campaigns').query()
    if (userRole?.name === ROLES.ADMIN) {
      baseQuery = Campaign.query() as any
    }
    if (userRole?.name === ROLES.INFLUENCER) {
      baseQuery = Campaign.query()
        .whereHas('influencers', builder => {
          builder.where('influencer_id', auth.user?.id as number)
          if (validatedData.campaign_influencer_status) {
            builder.whereIn('status', validatedData.campaign_influencer_status)
          }
        })
        .preload('influencers', builder =>
          builder
            .where('influencer_id', auth.user?.id as number)
            .select('amount', 'influencer_id', 'status')
        ) as any
    }

    return baseQuery?.orderBy('created_at', 'desc').paginate(page, itemPerPage)
  }

  public async show ({ params, auth }: HttpContextContract) {
    const user = auth.user
    const userRole = await auth.user
      ?.related('userRole')
      .query()
      .firstOrFail()

    const campaign = (
      await Campaign.query()
        .where('id', params.id)
        .preload('influencers', builder => {
          if (userRole?.name === ROLES.INFLUENCER) {
            builder.where('influencer_id', user?.id as number)
          }
        })
        .preload('activities', builder => {
          if (userRole?.name === ROLES.INFLUENCER) {
            builder.where('influencer_id', user?.id as number)
          }
          builder.orderBy('created_at', 'desc')
        })
        .firstOrFail()
    ).toJSON()

    const sortedCampaigns = sortBy(Object.keys(campaign), key => {
      return (campaign[key] || []).length
    }).reduce((acc, key) => {
      acc[key] = campaign[key] || []
      return acc
    }, {})

    return sortedCampaigns
  }

  public async update ({ request, params }: HttpContextContract) {
    const stringRule = schema.string.optional({ trim: true, escape: true })
    const validationSchema = schema.create({
      status: schema.enum.optional(Object.values(CampaignStatues)),
      id: schema.number([rules.exists({ table: 'campaigns', column: 'id' })]),
      min_age_group: schema.number.optional([rules.unsigned()]),
      max_age_group: schema.number.optional([
        rules.afterField('min_age_group'),
      ]),
      budget: schema.number.optional(),
      name: stringRule,
      category: schema.array.optional().members(stringRule),
      city: stringRule,
      company_name: stringRule,
      country: stringRule,
      description: stringRule,
      gender: schema.enum.optional(Object.values(CampaignGender)),
      goals: stringRule,
      max_duration: schema.date.optional({}, [
        rules.afterField('min_duration'),
      ]),
      min_duration: schema.date.optional(),
      notes: stringRule,
      objectives: schema.array.optional().members(stringRule),
      requirements: stringRule,
      social_platforms: schema.array
        .optional()
        .members(schema.enum(Object.values(SupportedPlatforms))),
      feature_image_url: schema.string.optional({trim: true }),
      media: schema.array
        .optional()
        .members(schema.object().members({
          url: schema.string(),
          type: schema.string(),
        })),
    })
    const validatedData = await request.validate({
      schema: validationSchema,
      data: {
        ...request.all(),
        ...params,
      },
    })
    const campaign = (await Campaign.query()
      .where('id', validatedData.id)
      .first()) as Campaign

    campaign.merge(validatedData as any)
    await campaign.save()
    await campaign.related('activities').create({
      description: 'New Campaign Details Updated',
      title: 'Campaign Updated',
    })
    return campaign
  }

  public async store ({ request, auth }: HttpContextContract) {
    const stringRule = schema.string({ trim: true, escape: true })
    const validationSchema = schema.create({
      min_age_group: schema.number([rules.unsigned()]),
      max_age_group: schema.number([rules.afterField('min_age_group')]),
      budget: schema.number(),
      name: stringRule,
      category: schema.array().members(stringRule),
      city: stringRule,
      company_name: stringRule,
      country: stringRule,
      description: stringRule,
      gender: schema.enum(Object.values(CampaignGender)),
      goals: stringRule,
      max_duration: schema.date({}, [rules.afterField('min_duration')]),
      min_duration: schema.date(),
      notes: stringRule,
      objectives: schema.array().members(stringRule),
      requirements: stringRule,
      social_platforms: schema
        .array()
        .members(schema.enum(Object.values(SupportedPlatforms))),
      feature_image_url: schema.string({trim: true }),
      media: schema.array
        .optional()
        .members(schema.object().members({
          url: schema.string(),
          type: schema.string(),
        })),
    })
    const validatedData = await request.validate({
      schema: validationSchema,
    })

    const user = auth.user as User

    const type =
      validatedData.budget > expectedAmountForBarterType
        ? CampaignType.CAMPAIGN
        : CampaignType.BARTER
    const campaign = await user.related('campaigns').create({
      ...validatedData,
      type,
      status: CampaignStatues.AWAITING_APPROVAL,
    })
    await campaign.related('activities').create({
      description: 'New Campaign created',
      title: 'Campaign Created',
    })
    return campaign
  }

  public async assignOrUnAssignInfluencer ({
    request,
    params,
  }: HttpContextContract) {
    const validationSchema = schema.create({
      amount: schema.number.optional([rules.requiredIfNotExists('status')]),
      influencer_id: schema.number([
        rules.exists({ table: 'users', column: 'id' }),
      ]),
      id: schema.number([rules.exists({ table: 'campaigns', column: 'id' })]),
      status: schema.enum.optional(
        [...Object.values(CampaignInfluencerStatus), 'unassigned'],
        [rules.requiredIfNotExists('amount')]
      ),
    })
    const validatedData = await request.validate({
      schema: validationSchema,
      messages: {
        'influencer_id.exists': 'User does not exist',
      },
      data: {
        ...request.all(),
        ...params,
      },
    })

    const campaign = (await Campaign.findOrFail(validatedData.id)) as Campaign
    let updatedOrAssignedCampaign: CampaignInfluencer
    if (validatedData.status) {
      const influencerCampaign = await campaign
        .related('influencers')
        .query()
        .where('influencer_id', validatedData.influencer_id)
        .firstOrFail()
      if (validatedData.status === 'unassigned') {
        await influencerCampaign.delete()
      } else {
        influencerCampaign.status = validatedData.status as any
        await influencerCampaign.save()
      }
      updatedOrAssignedCampaign = influencerCampaign
    } else {
      updatedOrAssignedCampaign = await campaign
        .related('influencers')
        .firstOrCreate(
          { influencerId: validatedData.influencer_id },
          {
            influencerId: validatedData.influencer_id,
            amount: validatedData.amount,
            status: CampaignInfluencerStatus.INVITED,
          }
        )
    }

    const influencer = await updatedOrAssignedCampaign
      .related('influencer')
      .query()
      .firstOrFail()

    if (validatedData?.status !== 'unassigned') {
      Event.emit('new::influencer::assigned:campaign::status:changed', {
        campaign_influencer: updatedOrAssignedCampaign,
        user: influencer,
      })
    }

    await campaign.related('activities').create({
      description: validatedData.status
        ? `Campaign status changed for ${influencer.full_name} to ${validatedData.status}`
        : `${influencer.full_name} invited to ${campaign.name}`,
      title: 'Campaign Status Changed',
      influencerId: validatedData.influencer_id,
    })

    return updatedOrAssignedCampaign
  }

  /**
   * acceptOrRejectCampaign
   */
  public async acceptOrRejectCampaign ({ auth, request }: HttpContextContract) {
    const user = auth.user
    const validationSchema = schema.create({
      campaign_id: schema.number([
        rules.exists({ table: 'campaigns', column: 'id' }),
        rules.exists({
          table: 'campaign_influencers',
          column: 'campaign_id',
          where: { influencer_id: user?.id },
        }),
      ]),
      status: schema.enum([
        CampaignInfluencerStatus.ACCEPTED,
        CampaignInfluencerStatus.REJECTED,
      ]),
    })
    const validatedData = await request.validate({
      schema: validationSchema,
      messages: {
        'campaign_id.exists': 'User does not belong to this campaign',
      },
    })
    const campaignInfluencer = await user
      ?.related('involvedCampaigns')
      .query()
      .where('campaign_id', validatedData.campaign_id).firstOrFail() as CampaignInfluencer
    campaignInfluencer.status = validatedData.status
    await campaignInfluencer?.save()
    if (campaignInfluencer.status === CampaignInfluencerStatus.ACCEPTED) {
      Event.emit('new::influencer::accepted:campaign', {
        campaign_influencer: campaignInfluencer,
      })
    }
    return campaignInfluencer
  }
}
