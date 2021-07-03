'use strict'

import { EventsList } from '@ioc:Adonis/Core/Event'
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'
import constants from './constants'
import moment from 'moment'
import sms from '../Controllers/Lib/sms'

const baseUrl = `${Env.get('APP_URL')}/assets/email/images`

export default class Auth {
  public async onNewRegister ({user, signed_url, otp, send_email=true }: EventsList['new::registration']) {
    return Promise.all([
      // eslint-disable-next-line max-len
      sms.sendSms({ message: constants.formSmsNotificationMessage(otp), phoneNumber: user.phoneNumber }).then(console.log),
      send_email && Mail.send((message) => {
        message
          .from(Env.get('SENDER_EMAIL', 'no-reply@useripple.com') as string)
          .to(user.email)
          .subject('Verify Your Email Address')
          .htmlView('emails/verify-email', { signed_url, year: moment().get('year'), base_url: baseUrl })
      }),
    ])
  }

  public newResetPassword (user: EventsList['new:passwordreset']) {
    Mail.send((message) => {
      message
        .from(Env.get('SENDER_EMAIL', 'no-reply@useripple.com') as string)
        .to(user.email)
        .subject('Reset Password')
        .htmlView('emails/forget-password', { ...user, year: moment().get('year'), base_url: baseUrl })
    })
  }
}
