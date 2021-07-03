'use strict'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Campaign from 'App/Models/Campaign'
import Conversation from 'App/Models/Conversation'
import { ROLES } from 'App/Models/User'
import wsServer from '../../../wsServer'

export default class ConversationsController {
  public async index ({ request, auth }: HttpContextContract) {
    const {
      campaign_id: campaignId,
      influencer_id: influencerId,
      ...rest
    } = request.all()
    const user = auth.user
    const userRole = await user
      ?.related('userRole')
      .query()
      .firstOrFail()
    const getInfluencerId = {
      influencer_id:
        userRole?.name === ROLES.INFLUENCER ? user?.id : influencerId,
    }
    const validationSchema = schema.create({
      influencer_id: schema.number([
        rules.exists({ table: 'users', column: 'id' }),
        rules.exists({
          table: 'campaign_influencers',
          column: 'influencer_id',
          where: { campaign_id: campaignId },
        }),
      ]),
      campaign_id: schema.number([
        rules.exists({ table: 'campaigns', column: 'id' }),
      ]),
      owner_id: schema.number.optional([
        rules.exists({
          table: 'campaigns',
          column: 'owner_id',
          where: { campaign_id: campaignId },
        }),
      ]),
      page: schema.number.optional(),
      per_page: schema.number.optional(),
    })

    const validatedData = await request.validate({
      schema: validationSchema,
      messages: {
        'influencer_id.exists': 'User does belong to campaign',
        'campaign_id.exists': 'campaign does not exist',
        'owner_id.exists': 'campaign does not belong to brand',
      },
      data: {
        campaign_id: campaignId,
        ...getInfluencerId,
        ...rest,
        ...(userRole?.name === ROLES.BRAND ? { owner_id: user?.id } : {}),
      },
    })

    return Conversation.query()
      .where('campaign_id', validatedData.campaign_id)
      .where('influencer_id', validatedData.influencer_id)
      .orderBy('created_at', 'asc')
      .paginate(validatedData.page || 1, validatedData.per_page || 20)
  }

  public async store ({ request, auth }: HttpContextContract) {
    const {
      campaign_id: campaignId,
      influencer_id: influencerId,
      ...rest
    } = request.all()
    const user = auth.user
    const userRole = await user
      ?.related('userRole')
      .query()
      .firstOrFail()
    const getInfluencerId = {
      influencer_id:
        userRole?.name === ROLES.INFLUENCER ? user?.id : influencerId,
    }
    const validationSchema = schema.create({
      message: schema.string.optional({ trim: true, escape: true }, [
        rules.requiredIfNotExists('media'),
      ]),
      influencer_id: schema.number.optional([
        rules.exists({ table: 'users', column: 'id' }),
        rules.exists({
          table: 'campaign_influencers',
          column: 'influencer_id',
          where: { campaign_id: campaignId },
        }),
      ]),
      campaign_id: schema.number([
        rules.exists({ table: 'campaigns', column: 'id' }),
      ]),
      owner_id: schema.number.optional([
        rules.exists({
          table: 'campaigns',
          column: 'owner_id',
          where: { campaign_id: campaignId },
        }),
      ]),
      media: schema.array
        .optional([rules.requiredIfNotExists('message')])
        .members(schema.object().members({
          url: schema.string(),
          type: schema.string(),
        })),
      is_from_brand: schema.boolean(),
    })
    const validatedData = await request.validate({
      schema: validationSchema,
      messages: {
        'influencer_id.exists': 'User does not exist',
        'campaign_id.exists': 'campaign does not exist',
      },
      data: {
        campaign_id: campaignId,
        ...getInfluencerId,
        ...rest,
        ...(userRole?.name === ROLES.BRAND ? { owner_id: user?.id } : {}),
      },
    })

    const { owner_id: ownerId, ...conversationProps } = validatedData
    const campaign = await Campaign.query()
      .where('id', validatedData.campaign_id)
      .preload('owner')
      .firstOrFail()
    const createdConversation = await Conversation.create(conversationProps)

    wsServer.emit(
      `new::conversation::${
        validatedData.is_from_brand
          ? validatedData.influencer_id
          : campaign.owner.id
      }`,
      {
        conversation: createdConversation,
      }
    )
    return createdConversation
  }

  public async broadCast ({ request }: HttpContextContract) {
    const requestBody = request.all()
    const validationSchema = schema.create({
      influencers: schema.array().members(
        schema.number([
          rules.exists({ table: 'users', column: 'id' }),
          rules.exists({
            table: 'campaign_influencers',
            column: 'influencer_id',
            where: { campaign_id: requestBody.campaign_id },
          }),
        ])
      ),
      campaign_id: schema.number([
        rules.exists({ table: 'campaigns', column: 'id' }),
      ]),
      message: schema.string.optional({ trim: true, escape: true }, [
        rules.requiredIfNotExists('media'),
      ]),
      media: schema.array
        .optional([rules.requiredIfNotExists('message')])
        .members(schema.object().members({
          url: schema.string(),
          type: schema.string(),
        })),
    })

    const { influencers, ...rest } = await request.validate({
      schema: validationSchema,
      messages: {
        'influencers.exists': 'User does not belong to this campaign',
      },
    })
    const conversations = await Conversation.createMany(
      influencers.map(influencer_id => ({
        ...rest,
        influencer_id,
        is_from_brand: true,
        isBroadcast: true,
      }))
    )

    conversations.map(conversation => {
      wsServer.emit(`new::conversation::${conversation.influencerId}`, {
        conversation,
      })
    })
    return conversations
  }
}
