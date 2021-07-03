'use strict'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator'
import SocialAccount, { SupportedPlatforms } from 'App/Models/SocialAccount'
import { isNil, omitBy } from 'lodash'
import Env from '@ioc:Adonis/Core/Env'
import Event from '@ioc:Adonis/Core/Event'
import { omitNil } from '../Lib/utils'
import platforms from '../Services/platforms'
import client from '../Lib/twitter'
import { ROLES } from 'App/Models/User'
import Logger from '@ioc:Adonis/Core/Logger'

export default class SocialController {
  public async connectPlatform ({
    request,
    auth,
    params,
    response,
  }: HttpContextContract) {
    const userSchema = schema.create({
      role: schema.enum(
        Object.values(ROLES).map(item => `${item}s`),
        [rules.required()]
      ),
      platform: schema.enum(Object.values(SupportedPlatforms), [
        rules.required(),
      ]),
      external_id: schema.string({ trim: true }, [
        rules.required(),
        rules.unique({ table: 'social_accounts', column: 'external_id' }),
      ]),
      external_name: schema.string({ trim: true }, [rules.required()]),
      external_access_token: schema.string({ trim: true }, [rules.required()]),
      external_profile_url: schema.string.optional({ trim: true }, [
        rules.requiredWhen('platform', '=', SupportedPlatforms.facebook),
      ]),
      min_age: schema.number.optional([
        rules.requiredWhen('platform', '=', SupportedPlatforms.facebook),
      ]),
      max_age: schema.number.optional(),
      gender: schema.string.optional({ trim: true }, [
        rules.requiredWhen('platform', '=', SupportedPlatforms.facebook),
      ]),
      external_page_url: schema.string.optional({ trim: true }, [
        rules.requiredWhen('role', '=', `${ROLES.BRAND}s`),
      ]),
      external_page_id: schema.string.optional({ trim: true }, [
        rules.requiredWhen('role', '=', `${ROLES.BRAND}s`),
        rules.unique({ table: 'social_accounts', column: 'external_page_id' }),
      ]),
      external_page_access_token: schema.string.optional({ trim: true }, [
        rules.requiredWhen('role', '=', `${ROLES.BRAND}s`),
      ]),
      external_page_name: schema.string.optional({ trim: true }, [
        rules.requiredWhen('role', '=', `${ROLES.BRAND}s`),
      ]),
      external_link: schema.string.optional(),
    })

    try {
      const { role, ...validatedData } = await validator.validate({
        schema: userSchema,
        data: {
          ...request.all(),
          ...params,
        },
        messages: {
          'external_id.unique': 'Social account already exists',
        },
      })
      const transformed = await (platforms[
        validatedData.platform
      ] as any).transformUserPayload(validatedData)

      const socialAccount = await auth.user
        ?.related('userSocialAccounts')
        .create(transformed)
      this.pushConnectedAccountToGetStats(socialAccount as SocialAccount)
      return socialAccount
    } catch (error) {
      const errorMap = Object.keys(error.messages).reduce((acc, key) => {
        acc += `\n${error.messages[key][0]}`
        return acc
      }, '')
      return response.status(400).json({
        message: errorMap,
      })
    }
  }

  public async listSocialAccounts ({ auth }: HttpContextContract) {
    const accounts = await auth.user
      ?.related('userSocialAccounts')
      .query()
      .orderBy('id', 'desc')

    return accounts?.map(account => {
      const accountJson = account.toJSON()
      accountJson.externalAccessToken = null
      accountJson.external_access_token = null
      return omitBy(accountJson, isNil)
    })
  }

  public async removeSocialAccount ({
    auth,
    params,
    response,
  }: HttpContextContract) {
    const user = auth.user
    const socialAccount = await user
      ?.related('userSocialAccounts')
      .query()
      .where('id', '=', params.id)
      .first()
    if (!socialAccount) {
      return response.status(400).json({
        success: false,
        message: 'account does not exist',
      })
    }
    await socialAccount?.delete()
    const accountJson = socialAccount.toJSON()
    accountJson.externalAccessToken = null
    accountJson.external_access_token = null
    return omitNil(accountJson)
  }

  public async platformConnectCallback ({
    request,
    params,
    response,
  }: HttpContextContract) {
    let message = ''
    try {
      const userSchema = schema.create({
        code: schema.string.optional({ trim: true }, [
          rules.requiredWhen('platform', '=', SupportedPlatforms.instagram),
        ]),
        state: schema.number([
          rules.required(),
          rules.exists({ table: 'users', column: 'id' }),
        ]),
        platform: schema.enum(Object.values(SupportedPlatforms), [
          rules.required(),
        ]),
        oauth_token: schema.string.optional({ trim: true }, [
          rules.requiredWhen('platform', '=', SupportedPlatforms.twitter),
        ]),
        oauth_verifier: schema.string.optional({ trim: true }, [
          rules.requiredWhen('platform', '=', SupportedPlatforms.twitter),
        ]),
      })

      const validatedData = await validator.validate({
        schema: userSchema,
        data: {
          ...request.all(),
          ...params,
        },
        messages: {
          'state.exists': 'user does not exist',
        },
      })
      const transformed = await (platforms[
        validatedData.platform
      ] as any).getAndTransformUser({
        code: validatedData.code,
        redirectUri: Env.get('NODE_ENV') === 'production' ? `${Env.get('APP_URL')}${request.url()}`: `https://localhost:3333${request.url()}`,
        ...validatedData,
      })
      const socialAccount = await SocialAccount.firstOrCreate(
        { externalId: transformed.external_id || transformed.externalId, platform: validatedData.platform,
        },
        {
          ...transformed,
          platform: validatedData.platform,
          userId: validatedData.state,
        }
      )
      this.pushConnectedAccountToGetStats(socialAccount)
      message = `${validatedData.platform} account connected successfully`
    } catch (error) {
      message =
        'An error occurred connecting your account. Contact Support if this persists'
    }
    return response.redirect(`/influencer/settings?message=${message}&tab=3`)
  }

  public async twitterRequestAuth ({ auth }: HttpContextContract) {
    const user = auth.user
    const url = await client().getAuthUrl(user?.id as number)
    return {
      url,
    }
  }
  private pushConnectedAccountToGetStats (socialAccount: SocialAccount) {
    Logger.info('Pushing account', socialAccount, 'to_get_stats')
    Event.emit('new::connected::social::ccount', {
      social_account: socialAccount,
    })
  }
}
