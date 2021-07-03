import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import CampaignDeliverable, {
  DeliverableType,
} from 'App/Models/CampaignDeliverable'
import { MediaType, SocialChannels } from 'App/Models/Feed'
import User, { ROLES } from 'App/Models/User'
import Event from '@ioc:Adonis/Core/Event'
import CampaignInfluencer, {
  CampaignInfluencerStatus,
} from 'App/Models/CampaignInfluencer'
import platforms from '../Services/platforms'

export default class CampaignDeliverablesController {
  public async store ({ auth, request, params }: HttpContextContract) {
    const user = auth.user
    const data = request.all()
    const validationSchema = schema.create({
      caption: schema.string.optional({ trim: true }),
      body: schema.string.optional({ trim: true }),
      link: schema.string.optional({ trim: true }, [
        rules.unique({ table: 'campaign_deliverables', column: 'link' }),
      ]),
      media: schema.array([rules.required()]).members(
        schema.object([rules.required()]).members({
          url: schema.string({ trim: true }, [rules.required()]),
          type: schema.enum(Object.values(MediaType)),
        })
      ),
      author: schema.object.optional().members({
        name: schema.string({ trim: true }, [rules.required()]),
        profile_image: schema.string.optional({ trim: true }),
        profile_link: schema.string.optional({ trim: true }),
      }),
      platform: schema.enum.optional(Object.values(SocialChannels)),
      external_id: schema.string.optional({ trim: true, escape: true }, [
        rules.unique({ table: 'campaign_deliverables', column: 'external_id' }),
      ]),
      campaign_id: schema.number([
        rules.exists({ table: 'campaigns', column: 'id' }),
        rules.exists({
          table: 'campaign_influencers',
          column: 'campaign_id',
          where: { influencer_id: user?.id },
        }),
      ]),
      created_at_channel: schema.date.optional(),
      type: schema.enum.optional(Object.values(DeliverableType)),
    })

    const validatedData = await request.validate({
      schema: validationSchema,
      messages: {
        'external_id.unique': 'Post already added',
        'external_id.requiredWhen': 'external_id is required',
        'campaign_id.exists': 'Campaign does not exist',
        'link.exists': 'Post already added',
      },
      data: {
        ...data,
        ...params,
      },
    })
    const deliverableToCreate = platforms[validatedData.platform as string]
      .reUploadMediaToS3
      ? await platforms[validatedData.platform as string].reUploadMediaToS3(
        validatedData
      )
      : validatedData
    const deliverable = await user
      ?.related('campaignDeliverables')
      .create(deliverableToCreate as any)

    // push to queue
    if (deliverable?.type === DeliverableType.POST) {
      Event.emit('new::campaign::deliverable', {
        deliverable: deliverable as CampaignDeliverable,
      })
    }
    return deliverable
  }

  public async index ({ request, auth, params }: HttpContextContract) {
    const user = auth.user
    const data = request.all()
    const userRole = await auth.user
      ?.related('userRole')
      .query()
      .firstOrFail()
    const validationSchema = schema.create({
      page: schema.number.optional(),
      per_page: schema.number.optional(),
      campaign_id: schema.number([
        rules.exists({ table: 'campaigns', column: 'id' }),
        rules.exists({
          table: 'campaign_influencers',
          column: 'campaign_id',
          where: { influencer_id: user?.id },
        }),
      ]),
      influencer_id: schema.number.optional([
        rules.exists({ table: 'users', column: 'id' }),
      ]),
    })
    const {
      page = 1,
      per_page: perPage = 20,
      campaign_id: campaignId,
      influencer_id: influencerId,
    } = await request.validate({
      schema: validationSchema,
      messages: {
        'campaign_id.exists': 'Campaign does not exist',
        'influencer_id.exists': 'User does not exist',
      },
      data: {
        ...data,
        ...params,
      },
    })
    let baseQuery = user?.related('campaignDeliverables').query()
    if (userRole?.name !== ROLES.INFLUENCER) {
      baseQuery = CampaignDeliverable.query().where(
        'influencer_id',
        influencerId as any
      ) as any
    }
    return baseQuery
      ?.whereHas('campaign', builder =>
        builder.where('campaign_id', campaignId)
      )
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * getInfluencersDeliverableStats
   */
  public async getInfluencersWithDeliverableStats ({
    request,
    params,
  }: HttpContextContract) {
    const validationSchema = schema.create({
      page: schema.number.optional(),
      per_page: schema.number.optional(),
      campaign_id: schema.number([
        rules.exists({ table: 'campaigns', column: 'id' }),
      ]),
      q: schema.string.optional({ trim: true, escape: true }),
    })

    const {
      page = 1,
      per_page: perPage = 20,
      campaign_id: campaignId,
      q,
    } = await request.validate({
      schema: validationSchema,
      data: {
        ...request.all(),
        ...params,
      },
    })

    const [users, usersCount] = await Promise.all([
      User.query()
        .whereHas('campaignDeliverables', builder => {
          builder.where('campaign_id', campaignId)
        })
        .withCount('campaignDeliverables', query => {
          query.as('total_deliverables')
        })
        .withCount('campaignDeliverables', query => {
          query.as('total_likes')
        })
        .preload('campaignDeliverables', builder =>
          builder.orderBy('created_at', 'desc')
        )
        .where(builder => {
          if (q) {
            builder
              .orWhere('first_name', 'ilike', `%${q}%`)
              .orWhere('last_name', 'ilike', `%${q}%`)
          }
        })
        .preload('involvedCampaigns', builder =>
          builder.where('campaign_id', campaignId)
        )
        .paginate(page, perPage),
      CampaignInfluencer.query()
        .where('campaign_id', campaignId)
        .whereNotIn('status', [
          CampaignInfluencerStatus.CANCELLED,
          CampaignInfluencerStatus.REJECTED,
          CampaignInfluencerStatus.DISPUTED,
        ])
        .countDistinct('id'),
    ])

    const { data, ...rest } = users.toJSON()

    return {
      data: data.map(user => {
        const userNoJson = (user as any).toJSON()
        userNoJson.total_deliverables = user.$extras['total_deliverables']
        return userNoJson
      }),
      stats: {
        total: usersCount[0].count,
        total_submitted: rest.meta.total,
      },
      ...rest,
    }
  }
}
