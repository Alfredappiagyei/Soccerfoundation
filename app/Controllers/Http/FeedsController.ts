import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Feed, { SocialChannels } from 'App/Models/Feed'
import { isNil } from 'lodash'
import platforms from '../Services/platforms'

export default class FeedsController {
  public async index ({ request, params }: HttpContextContract) {
    const validationSchema = schema.create({
      page: schema.number.optional(),
      per_Page: schema.number.optional(),
      is_published: schema.boolean.optional(),
      channel: schema.enum.optional(Object.values(SocialChannels)),
    })
    const validatedData = await request.validate({
      schema: validationSchema,
    })

    const {
      page: unsedPage,
      per_Page: itempPerPage,
      is_published: isPublished = params.role !== 'admin' ? true : null,
      channel,
    } = validatedData

    const page = unsedPage || 1
    const perPage = itempPerPage || 20

    return Feed.query()
      .where(builder => {
        if (!isNil(isPublished)) {
          builder.where('is_published', isPublished)
        }
        if (!isNil(channel)) {
          builder.where('channel', channel)
        }
      })
      .preload('likes', builder => {
        builder.preload('user', userBuilder => {
          userBuilder.select('id', 'profile_url', 'first_name', 'last_name')
        })
      })
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  public async likeFeed ({ request, params, auth }: HttpContextContract) {
    const validationSchema = schema.create({
      id: schema.number([
        rules.required(),
        rules.exists({ table: 'feeds', column: 'id' }),
      ]),
      is_liked: schema.boolean([rules.required()]),
    })

    const validatedData = await request.validate({
      schema: validationSchema,
      data: {
        ...request.all(),
        ...params,
      },
    })
    const feed = await Feed.findOrFail(validatedData.id)
    if (validatedData.is_liked) {
      await feed.related('likes').updateOrCreate(
        { userId: auth.user?.id as number },
        {
          userId: auth.user?.id as number,
        }
      )
    } else {
      await feed
        .related('likes')
        .query()
        .where('user_id', auth.user?.id as number)
        .delete()
    }

    return Feed.query()
      .where('id', feed.id)
      .preload('likes', builder => {
        builder.preload('user', userBuilder => {
          userBuilder.select('id', 'profile_url', 'first_name', 'last_name')
        })
      })
      .firstOrFail()
  }

  public async getUserFeeds ({ request, auth }: HttpContextContract) {
    const validationSchema = schema.create({
      platform: schema.enum(Object.values(SocialChannels)),
      page: schema.string.optional({ trim: true }),
    })

    const validatedData = await request.validate({
      schema: validationSchema,
    })

    const user = auth.user

    const selectedSocialAccount = await user
      ?.related('userSocialAccounts')
      .query()
      .where('platform', validatedData.platform)
      .firstOrFail()

    const feeds = await platforms[validatedData.platform].getUserPosts({
      ...selectedSocialAccount?.toJSON(),
      ...validatedData,
    })
    return feeds
  }
}
