import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User, { ROLES } from 'App/Models/User'
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'
import { isNil } from 'lodash'
import { UserStatusTypes } from '../types'
import Event from '@ioc:Adonis/Core/Event'
import { SupportedPlatforms } from 'App/Models/SocialAccount'
import { CampaignInfluencerStatus } from 'App/Models/CampaignInfluencer'

export default class UsersController {
  public async listUsers ({ request }: HttpContextContract) {
    const validationSchema = schema.create({
      country: schema.string.optional({ trim: true }),
      city: schema.string.optional({ trim: true }),
      first_name: schema.string.optional({ trim: true }),
      last_name: schema.string.optional({ trim: true }),
      status: schema.string.optional(),
      approved: schema.boolean.optional(),
      page: schema.number.optional(),
      per_page: schema.number.optional(),
      role: schema.enum(Object.values(ROLES)),
      q: schema.string.optional(),
      connected_platforms: schema.array
        .optional()
        .members(schema.enum(Object.values(SupportedPlatforms))),
      campaign_id: schema.number.optional([
        rules.exists({ table: 'campaigns', column: 'id' }),
        rules.requiredIfExists('campaign_influencer_statuses'),
      ]),
      campaign_influencer_statuses: schema.array.optional([rules.requiredIfExists('campaign_id')]).members(
        schema.enum(
          Object.values(CampaignInfluencerStatus),
        )
      ),
      excluded: schema.array.optional().members(schema.number()),
      social_type: schema.string.optional(),
    })
    const validatedData = await request.validate({
      schema: validationSchema,
    })
    const page = validatedData.page || 1
    const perPage = validatedData.per_page || 20

    return User.query()
      .whereHas('userRole', builder => {
        builder.where('name', validatedData.role)
      })
      .where(builder => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const {
          role,
          page: unsedPage,
          per_page: itempPerPage,
          connected_platforms: connectedPlatforms,
          status,
          approved,
          campaign_id: campaignId,
          campaign_influencer_statuses: campaignInfluencerStatuses,
          social_type: socialType,
          excluded,
          q = '',
          ...rest
        } = validatedData
        if (!isNil(approved)) {
          builder.where('approved', approved)
        }
        if (!isNil(status)) {
          builder.where('status', status)
        }
        Object.keys(rest).forEach(key => {
          builder.where(key, 'ilike', `%${rest[key]}%`)
        })

        if (connectedPlatforms) {
          builder.whereHas('userSocialAccounts', builder2 => {
            builder2.where('platform', 'in', connectedPlatforms)
          })
        }
        if (campaignId && campaignInfluencerStatuses) {
          builder.whereHas('involvedCampaigns', builder2 => {
            builder2.whereIn('status', campaignInfluencerStatuses).where('campaign_id', campaignId)
          })
        }

        if (socialType) {
          builder.whereHas('userSocialAccounts', builder2=>{
            builder2.where('type', 'ilike', `%${socialType}%`)
          })
        }
        if (q) {
          builder.where('first_name', 'ilike', `%${q}%`).where('last_name', 'ilike', `%${q}%`)
        }
      })
      .whereNotIn('id', validatedData.excluded || [])
      .preload('userRole')
      .preload('userSocialAccounts', builder => {
        builder.select(
          'id',
          'numberOfFollowers',
          'averageLikes',
          'averageComments',
          'platform',
          'type'
        )
      })
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  public async singleInfluencerUser ({ params }: HttpContextContract) {
    const validationSchema = schema.create({
      id: schema.number(),
    })
    const validatedData = await validator.validate({
      schema: validationSchema,
      data: params,
    })
    return User.query()
      .where('id', validatedData.id)
      .preload('userInterests')
      .preload('userSocialAccounts')
      .firstOrFail()
  }

  /**
   * updateStatus
   */
  public async updateUserStatus ({ request }: HttpContextContract) {
    const validationSchema = schema.create({
      approved: schema.boolean([rules.required()]),
      user_id: schema.number([rules.exists({ table: 'users', column: 'id' })]),
      rejection_reason: schema.string.optional({ trim: true }, [
        rules.requiredWhen('approved', '=', false),
      ]),
    })
    const validatedData = await request.validate({
      schema: validationSchema,
      messages: {
        'users.exists': 'user does not exist',
      },
    })

    const user = await User.findOrFail(validatedData.user_id)
    if (validatedData.approved) {
      user.approved = validatedData.approved
      user.status = UserStatusTypes.ACTIVE
    } else {
      user.approved = false
      user.status = UserStatusTypes.REJECTED
      user.rejectionReason = validatedData.rejection_reason
    }

    await user.save()
    Event.emit('notify::user::account::status::change', {
      user: user,
      message: validatedData.rejection_reason as string,
    })
    return user.toJSON()
  }
}
