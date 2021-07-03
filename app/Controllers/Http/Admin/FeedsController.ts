'use strict'

import Redis from '@ioc:Adonis/Addons/Redis'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator'
import platforms from 'App/Controllers/Services/platforms'
import Feed, { MediaType, SocialChannels } from 'App/Models/Feed'
import SocialAccount from 'App/Models/SocialAccount'

const totalFeedCacheInSeconds = 30 * 60
export default class FeedsController {
  /**
     * store
{}: Htt     */
  public async store ({ request }: HttpContextContract) {
    const validationSchema = schema.create({
      caption: schema.string.optional({ trim: true }),
      body: schema.string.optional({ trim: true }),
      link: schema.string.optional({ trim: true }),
      media: schema.array([rules.required()]).members(
        schema.object([rules.required()]).members({
          url: schema.string({ trim: true }, [rules.required()]),
          type: schema.enum(Object.values(MediaType)),
        })
      ),
      author: schema.object([rules.required()]).members({
        name: schema.string({ trim: true }, [rules.required()]),
        profile_image: schema.string.optional({ trim: true }),
        profile_link: schema.string.optional({ trim: true }),
      }),
      channel: schema.enum(Object.values(SocialChannels), [rules.required()]),
      external_id: schema.string.optional({ trim: true }, [
        rules.requiredWhen('channel', 'in', [
          SocialChannels.FACEBOOK,
          SocialChannels.TWITTER,
          SocialChannels.INSTAGRAM,
        ]),
        rules.unique({ table: 'feeds', column: 'external_id' }),
      ]),
    })

    const validatedData = await request.validate({
      schema: validationSchema,
      messages: {
        'external_id.unique': 'Post already added',
        'external_id.requiredWhen': 'external_id is required',
      },
    })
    const feedToCreate = platforms[validatedData.channel as string]
      .reUploadMediaToS3
      ? await platforms[validatedData.channel as string].reUploadMediaToS3(
        validatedData
      )
      : validatedData
    return Feed.create(feedToCreate as any)
  }

  public async update ({ request, params }: HttpContextContract) {
    const validationSchema = schema.create({
      id: schema.number([
        rules.required(),
        rules.exists({ table: 'feeds', column: 'id' }),
      ]),
      is_published: schema.boolean([rules.required()]),
    })

    const validatedData = await validator.validate({
      schema: validationSchema,
      data: {
        ...request.all(),
        ...params,
      },
    })
    const feed = await Feed.findOrFail(validatedData.id)
    feed.isPublished = validatedData.is_published
    await feed.save()
    return feed
  }

  public async destroy ({ params }: HttpContextContract) {
    const validationSchema = schema.create({
      id: schema.number([
        rules.required(),
        rules.exists({ table: 'feeds', column: 'id' }),
      ]),
    })

    const validatedData = await validator.validate({
      schema: validationSchema,
      data: params,
    })
    const feed = await Feed.findOrFail(validatedData.id)
    await feed.delete()
    return feed
  }

  public async searchSocialFeed ({ request }: HttpContextContract) {
    const validationSchema = schema.create({
      channel: schema.enum(Object.values(SocialChannels), [rules.required()]),
      text: schema.string({ trim: true }),
      page: schema.string.optional({ trim: true }),
    })

    const validatedData = await request.validate({
      schema: validationSchema,
    })
    const textKey = `${validatedData.text}_${validatedData.channel}`
    const cachedFeeds = await Redis.get(textKey)
    if(cachedFeeds) {
      return JSON.parse(cachedFeeds)
    }
    const selectedSocialAccount = await SocialAccount.query().orderBy('id', 'desc').first()

    const feeds = await platforms[validatedData.channel].searchFeeds({
      ...validatedData,
      socialAccessToken: selectedSocialAccount?.externalAccessToken,
    })
    Redis.set(textKey, JSON.stringify(feeds), 'ex', totalFeedCacheInSeconds)
    return feeds
  }
}
