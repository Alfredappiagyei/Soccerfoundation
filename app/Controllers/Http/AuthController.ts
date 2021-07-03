'use strict'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Route from '@ioc:Adonis/Core/Route'
import Event from '@ioc:Adonis/Core/Event'
import Database from '@ioc:Adonis/Lucid/Database'
import UserModel from 'App/Models/User'
import Interests from 'App/Models/Interest'
import Role from 'App/Models/Role'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import queryString from 'querystring'
import { formatPhoneNumber, handleGenerator } from '../Lib/utils'
import { customAlphabet } from 'nanoid'
import moment from 'moment'
import Redis from '@ioc:Adonis/Addons/Redis'
import Logger from '@ioc:Adonis/Core/Logger'
import { SupportedCurrencies } from 'App/Models/Wallet'

const generate = customAlphabet('0123456789', 6)

const RESET_PASSWORD_REDIS_PREFIX = 'reset-password'

export default class AuthController {
  public async registerBrandView ({ view }: HttpContextContract) {
    const interests = await Interests.query().where('is_for_brands', true)
    return view.render('register-brand', { interests })
  }

  public async register ({ request }: HttpContextContract) {
    const brandRequiredRule = rules.requiredWhen('role', '=', 'brand')

    const validationSchema = schema.create({
      role: schema.enum(['influencer', 'brand'], [rules.required()]),
      email: schema.string({ trim: true }, [
        rules.required(),
        rules.email(),
        rules.unique({ table: 'users', column: 'email' }),
      ]),
      password: schema.string({ trim: true }, [rules.required()]),
      business_name: schema.string.optional({ trim: true }, [
        brandRequiredRule,
      ]),
      representative_name: schema.string.optional({ trim: true }, [
        brandRequiredRule,
      ]),
      phone_number: schema.string({ trim: true }, [
        rules.phone(),
        rules.unique({ table: 'users', column: 'phone_number' }),
        rules.required(),
      ]),
      country: schema.string({ trim: true }, [rules.required()]),
      city: schema.string({ trim: true }, [rules.required()]),
      offering: schema.enum.optional(
        ['service_based', 'physical_product'],
        [brandRequiredRule]
      ),
      business_description: schema.string.optional({ trim: true }),
      interests: schema.array
        .optional([rules.distinct('*')])
        .members(
          schema.number([
            rules.exists({ table: 'interests', column: 'id' }),
            brandRequiredRule,
          ])
        ),
      first_name: schema.string.optional({ trim: true }, [
        rules.requiredWhen('role', '=', 'influencer'),
      ]),
      last_name: schema.string.optional({ trim: true }, [
        rules.requiredWhen('role', '=', 'influencer'),
      ]),
    })

    const {
      interests = [],
      phone_number: phoneNumber,
      ...brandDetails
    } = await request.validate({
      schema: validationSchema,
      messages: {
        'email.required': 'email is required',
        'email.unique': 'The email is already in use',
        'email.email': 'Email format is not valid',
        'password.required': 'password is required',
        'phone_number.unique': 'Phone number already exists',
        'business_name.required': 'Business name is required',
        'city.required': 'City is required',
      },
    })
    const trx = await Database.transaction()
    const role = await Role.query()
      .where('name', '=', request.all().role)
      .first()
    const otp = generate()
    const user = await UserModel.create(
      {
        phoneNumber: formatPhoneNumber(phoneNumber)
          .internationWithoutPlus as string,
        ...brandDetails,
        role: role?.id,
        phoneVerificationCode: otp,
        phoneVerificationExpireDate: moment()
          .add(15, 'minutes')
          .toDate(),
        handle: `${handleGenerator(
          brandDetails.first_name as string,
          brandDetails.last_name as string
        )}`,
      },
      {
        client: trx,
      }
    )
    user.useTransaction(trx)
    const currency =
      SupportedCurrencies[user.country.toUpperCase()] ??
      SupportedCurrencies.GHANA
    user.related('wallet').updateOrCreate({ userId: user.id }, { currency })
    const transformedInterests = interests.map(interest => ({
      interest_id: interest,
    }))
    await user.related('userInterests').createMany(transformedInterests as any)
    const roleFromDb = await user
      .related('userRole')
      .query()
      .first()
    Event.emit('new::registration', {
      user,
      role: roleFromDb as any,
      signed_url: `${Env.get('APP_URL')}${Route.makeSignedUrl('verifyEmail', {
        qs: {
          user_id: user.id,
        },
        expiresIn: '24hrs',
      })}` as string,
      otp,
    })
    await trx.commit()
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      id: user.id,
      role: {
        name: roleFromDb?.name,
        display_name: roleFromDb?.name,
        id: roleFromDb?.id,
      },
    }
  }

  public async verifyEmail ({ request, response }: HttpContextContract) {
    let httpResponse = {
      success: false,
      message: '',
    }
    const validationSchema = schema.create({
      user_id: schema.number([
        rules.required(),
        rules.exists({ table: 'users', column: 'id' }),
      ]),
      signature: schema.string({ trim: true }, [rules.required()]),
    })

    return request
      .validate({
        schema: validationSchema,
        messages: {
          'user_id.required': 'email is required',
          'user_id.exists': 'This email does not exist',
          'signature.required': 'signature is required',
        },
      })
      .then(async data => {
        const user = await User.findOrFail(data.user_id)
        if (user.isEmailVerified) {
          throw new Error('email already verified')
        }
        if (!request.hasValidSignature()) {
          throw new Error('invalid signature')
        }
        httpResponse = {
          success: true,
          message: 'Email Address Verified Successfully',
        }
      })
      .catch(error => {
        Logger.error(error)
        const errMessage = error.messages?.email[0] ?? error.message
        httpResponse = {
          success: false,
          message: errMessage,
        }
      })
      .finally(() => {
        response.redirect(
          `/verify-email?${queryString.stringify(httpResponse)}`
        )
      })
  }

  public async login ({ request, auth }: HttpContextContract) {
    const validationSchema = schema.create({
      email: schema.string.optional({ trim: true }, [
        rules.email(),
        rules.exists({ table: 'users', column: 'email' }),
      ]),
      phone_number: schema.string.optional({ trim: true }, [
        rules.phone(),
        rules.exists({ table: 'users', column: 'phone_number' }),
      ]),
      password: schema.string({ trim: true }, [rules.required()]),
    })

    const loginDetails = await request.validate({
      schema: validationSchema,
      messages: {
        'email.required': 'email is required',
        'email.exists': 'user does not exist',
        'phone_number.exists': 'user does not exist',
        'email.email': 'Email format is not valid',
        'password.required': 'password is required',
      },
    })
    const emailOrPassword: string =
      (loginDetails?.email as string) || (loginDetails?.phone_number as string)

    const user: User = await auth.attempt(
      emailOrPassword,
      loginDetails.password
    )

    const roleFromDb = await this.sendOtp(user)

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      id: user.id,
      role: {
        name: roleFromDb?.name,
        display_name: roleFromDb?.name,
        id: roleFromDb?.id,
      },
      isPhoneNumberVerified: user.isPhoneNumberVerified,
    }
  }

  /**
   * sendOtp
user: User   */
  public async sendOtp (user: User) {
    const roleFromDb = await user
      .related('userRole')
      .query()
      .first()
    if (!user.isPhoneNumberVerified) {
      const otp = generate()
      Event.emit('new::registration', {
        user,
        role: roleFromDb as any,
        signed_url: `${Env.get('APP_URL')}${Route.makeSignedUrl('verifyEmail', {
          qs: {
            user_id: user.id,
          },
          expiresIn: '24hrs',
        })}` as string,
        otp,
        send_email: false,
      })
      user.phoneVerificationCode = otp
      user.phoneVerificationExpireDate = moment()
        .add(15, 'minutes')
        .toDate()
      await user.save()
    }
    return roleFromDb
  }

  /**
   * resendOtp
   */
  public async resendOtp ({ request }: HttpContextContract) {
    const validationSchema = schema.create({
      user_id: schema.number([
        rules.required(),
        rules.exists({ table: 'users', column: 'id' }),
      ]),
    })

    const validatedDetails = await request.validate({
      schema: validationSchema,
      messages: {
        'user_id.required': 'user_id is required',
        'user_id.exists': 'user does not exist',
      },
    })
    const user = await User.findOrFail(validatedDetails.user_id)
    await this.sendOtp(user)
    return validatedDetails
  }

  public async verifyOtp ({ request, response, auth }: HttpContextContract) {
    const validationSchema = schema.create({
      otp: schema.string({ trim: true }, [rules.required()]),
      user_id: schema.number([
        rules.required(),
        rules.exists({ table: 'users', column: 'id' }),
      ]),
    })

    const otpDetails = await request.validate({
      schema: validationSchema,
      messages: {
        'otp.required': 'otp is required',
        'user_id.required': 'user_id is required',
        'user_id.exists': 'user does not exist',
      },
    })

    const user = await User.findOrFail(otpDetails.user_id)
    if (
      moment().isAfter(moment(user.phoneVerificationExpireDate)) ||
      user.phoneVerificationCode !== otpDetails.otp
    ) {
      return response.status(400).json({
        message: 'Invalid top',
        success: false,
      })
    }
    user.phoneVerificationCode = null as any
    user.phoneVerificationExpireDate = null as any
    user.isPhoneNumberVerified = true
    await user.save()
    await auth.login(user)
    const roleFromDb = await user
      .related('userRole')
      .query()
      .first()

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      id: user.id,
      role: {
        name: roleFromDb?.name,
        display_name: roleFromDb?.name,
        id: roleFromDb?.id,
      },
    }
  }

  public async requestPasswordChange ({ request }: HttpContextContract) {
    const validationSchema = schema.create({
      email: schema.string({ trim: true }, [rules.required(), rules.email()]),
    })

    const requestDetails = await request.validate({
      schema: validationSchema,
      messages: {
        'email.required': 'email is required',
        'email.exists':
          'If the email you entered is correct, a verification link has been sent to that email',
      },
    })
    const user = await User.findBy('email', requestDetails.email)
    if (!user) {
      return
    }

    const signedUrl = `${Env.get('APP_URL')}${Route.makeSignedUrl(
      'resetPassword',
      {
        qs: {
          user_id: user.id,
          salt: generate(),
        },
      }
    )}`.replace(/\/auth/gi, '')

    Event.emit('new:passwordreset', {
      id: user.id,
      email: user.email,
      signed_url: signedUrl,
    })
    await Redis.set(
      `${RESET_PASSWORD_REDIS_PREFIX}_${user.id}`,
      JSON.stringify(signedUrl),
      'EX',
      60 * 15
    )
  }

  /**
   * resetPassword
   */
  public async resetPassword ({ request, response }: HttpContextContract) {
    const validationSchema = schema.create({
      user_id: schema.string({ trim: true }, [
        rules.required(),
        rules.exists({ table: 'users', column: 'id' }),
      ]),
      signature: schema.string({ trim: true }, [rules.required()]),
      password: schema.string({ trim: true }, [
        rules.required(),
        rules.confirmed(),
      ]),
    })

    const requestDetails = await request.validate({
      schema: validationSchema,
      messages: {
        'user_id.required': 'user_id is required',
        'user_id.exists': 'user does not exist',
        'password.required': 'password is require',
        'password.confirmed': 'confirmation password does not match password',
      },
    })
    const user = await User.findOrFail(requestDetails.user_id)
    const redisKey = `${RESET_PASSWORD_REDIS_PREFIX}_${user.id}`
    const savedSignatureUrl = await Redis.get(redisKey)
    if (!savedSignatureUrl || !request.hasValidSignature()) {
      response.status(400).json({
        success: false,
        message: 'Invalid token',
      })
    }
    user.password = requestDetails.password
    await user.save()

    await Redis.del(redisKey)
  }

  public async logout ({ auth }: HttpContextContract) {
    await auth.logout()
  }
}
