import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import UserInterests from 'App/Models/UserInterests'
import Event from '@ioc:Adonis/Core/Event'
import { isNil, omitBy } from 'lodash'
import Hash from '@ioc:Adonis/Core/Hash'
import Redis from '@ioc:Adonis/Addons/Redis'
import { UserStatusTypes } from './types'
import { customAlphabet } from 'nanoid'
import moment from 'moment'
import Env from '@ioc:Adonis/Core/Env'
import { parseString } from '../Lib/utils'
import SocialAccount from 'App/Models/SocialAccount'

const generate = customAlphabet('0123456789', 6)

const formRedisSocialAccountsCached = id => `shared_profile_key_${id}`

export default class UsersController {
  public async updateProfile ({
    request,
    auth,
    response,
  }: HttpContextContract) {
    const validationSchema = schema.create({
      country: schema.string.optional({ trim: true }),
      city: schema.string.optional({ trim: true }),
      interests: schema.array
        .optional([rules.distinct('*')])
        .members(
          schema.number([rules.exists({ table: 'interests', column: 'id' })])
        ),
      business_description: schema.string.optional({ trim: true }),
      offering: schema.enum.optional(['service_based', 'physical_product']),
      business_name: schema.string.optional({ trim: true }),
      representative_name: schema.string.optional({ trim: true }),
      website_url: schema.string.optional({ trim: true }),
      company_size: schema.string.optional({ trim: true }),
      date_of_birth: schema.date.optional(),
      first_name: schema.string.optional({ trim: true }),
      last_name: schema.string.optional({ trim: true }),
      profile_url: schema.string.optional({ trim: true }),
      description: schema.string.optional({ trim: true }),
      old_password: schema.string.optional({ trim: true }),
      password: schema.string.optional({ trim: true }, [
        rules.requiredIfExists('old_password'),
        rules.confirmed(),
      ]),
    })
    const {
      interests,
      old_password: oldPassword,
      ...userDetails
    } = await request.validate({
      schema: validationSchema,
    })

    if (oldPassword) {
      const isValid = await Hash.verify(
        auth.user?.password as string,
        oldPassword
      )
      if (!isValid) {
        return response.status(400).json({
          message: 'password is not valid',
        })
      }
    }

    const user = auth.user as User

    await UserInterests.query()
      .where('user_id', user?.id)
      .delete()
    if (interests) {
      const userInterests: any = interests.map(interest => ({
        interest_id: interest,
      }))
      await user?.related('userInterests').createMany(userInterests)
    }

    user.merge(userDetails)
    await user.save()
    return this.transformUser(user)
  }

  public async getProfile ({ auth }: HttpContextContract) {
    return this.transformUser(auth.user)
  }

  private async transformUser (rawUser?: User) {
    const [a, role, hasConnectedSocialAccount] = await Promise.all([
      rawUser?.preload('userInterests', builder => {
        builder.preload('interest')
      }),
      rawUser
        ?.related('userRole')
        .query()
        .first(),
      rawUser
        ?.related('userSocialAccounts')
        .query()
        .count('* as total') as any,
      rawUser?.preload('wallet'),
    ])
    const user = rawUser?.toJSON() as any
    return {
      ...omitBy(user, isNil),
      has_connected_social_account: hasConnectedSocialAccount[0]?.total > 0,
      role,
    }
  }

  public async completeSetup ({ auth }: HttpContextContract) {
    const user = auth.user as User
    user.status = UserStatusTypes.SUBMITTED
    const updatedUser = await user?.save()
    Event.emit('notify::admin:setup:complete', {
      user: updatedUser.toJSON() as any,
    })
    return {
      message: 'completed',
    }
  }

  public async shareAccount ({ auth, request }: HttpContextContract) {
    const validationSchema = schema.create({
      social_accounts: schema.array([rules.required()]).anyMembers(),
    })
    const validatedData = await request.validate({
      schema: validationSchema,
    })
    await Redis.set(
      auth.user?.handle as string,
      JSON.stringify(validatedData.social_accounts.map(account => account.id))
    )
    await Redis.del(formRedisSocialAccountsCached(auth.user?.id))
    return {
      url: `${Env.get('APP_URL')}/profile/${auth.user?.handle}`,
    }
  }

  public async getSharedContent ({ request }: HttpContextContract) {
    const validationSchema = schema.create({
      handle: schema.string({ trim: true }, [
        rules.exists({ table: 'users', column: 'handle' }),
      ]),
    })
    const validatedData = await request.validate({
      schema: validationSchema,
      messages: {
        'handle.unique': 'The user does not exist',
      },
    })
    const noSerielizedUser = await User.query()
      .where('handle', validatedData.handle)
      .preload('userInterests', builder => builder.preload('interest'))
      .first()
    const user = (noSerielizedUser as User).serialize({
      fields: {
        pick: ['profile_url', 'interests', 'description', 'id', 'full_name'],
      },
    })

    const redisKey = formRedisSocialAccountsCached(user?.id)

    const redisSocialAccounts = parseString(
      await Redis.get(validatedData.handle)
    )
    const oldAccounts = parseString(await Redis.get(redisKey))
    if (oldAccounts) {
      return oldAccounts
    }
    const socialAccounts = await SocialAccount.query()
      .whereHas('user', builder => {
        builder.where('handle', validatedData.handle)
      })
      .where(builder => {
        if (redisSocialAccounts) {
          builder.whereIn('id', redisSocialAccounts)
        }
      })

    const userAccounts = {
      social_accounts: socialAccounts.map(account =>
        account.serialize({
          fields: {
            omit: [
              'external_access_token_secret',
              'external_access_token',
              'external_page_access_token',
            ],
          },
        })
      ),
      user,
    }

    await Redis.set(redisKey, JSON.stringify(userAccounts), 'EX', 60 * 60)
    return userAccounts
  }

  /**
   * changeEmailOrPassword
   */
  public async requestemailOrPasswordChange ({
    request,
    auth,
    response,
  }: HttpContextContract) {
    const validationSchema = schema.create({
      email: schema.string.optional({ trim: true }, [
        rules.requiredIfNotExists('phone_number'),
        rules.email(),
        rules.unique({ table: 'users', column: 'email' }),
      ]),
      password: schema.string({ trim: true }, [rules.required()]),
      phone_number: schema.string.optional({ trim: true }, [
        rules.requiredIfNotExists('email'),
        rules.phone(),
        rules.unique({ table: 'users', column: 'phone_number' }),
      ]),
      type: schema.enum(['request', 'submit'], [rules.required()]),
      verification_code: schema.string.optional({ trim: true }, [
        rules.requiredWhen('type', '=', 'submit'),
      ]),
    })
    const validatedData = await request.validate({
      schema: validationSchema,
      messages: {
        'email.unique': 'Email already belongs to another user',
        'phone_number.unique': 'Phone Number already belongs to another user',
      },
    })

    const isValid = await Hash.verify(
      auth.user?.password as string,
      validatedData.password
    )
    if (!isValid) {
      return response.status(400).json({
        message: 'Password is not valid',
      })
    }
    const user = auth.user as User
    const otp = generate()

    if (validatedData.type === 'request') {
      user.phoneVerificationCode = otp
      ;(user.phoneVerificationExpireDate = moment()
        .add(15, 'minutes')
        .toDate()),
      await user?.save()

      Event.emit('new::request:email::or::phone::change', {
        user: auth.user as any,
        email: validatedData.email,
        phone_number: validatedData.phone_number,
        otp,
      })
    } else {
      if (
        moment().isAfter(moment(user.phoneVerificationExpireDate)) ||
        user.phoneVerificationCode !== validatedData.verification_code
      ) {
        return response.status(400).json({
          message: 'Invalid verification code',
          success: false,
        })
      }
      user.phoneVerificationCode = null as any
      user.phoneVerificationExpireDate = null as any
      if (validatedData.email) {
        user.email = validatedData.email
      }
      if (validatedData.phone_number) {
        user.phoneNumber = validatedData.phone_number
      }
      await user.save()
    }

    return {
      message: validatedData.type,
    }
  }
}
