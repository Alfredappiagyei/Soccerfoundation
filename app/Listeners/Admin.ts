'use strict'

import { EventsList } from '@ioc:Adonis/Core/Event'
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'
import moment from 'moment'

export default class Admin {
  public onNewUserSetupComplete ({
    user,
  }: EventsList['notify::admin:setup:complete']) {
    Mail.send(async message => {
      message
        .from(Env.get('SENDER_EMAIL', 'no-reply@useripple.com') as string)
        .to(Env.get('AMIN_EMAIL', 'admin@useripple.com') as string)
        .subject('New User Complete Setup')
        .htmlView('emails/admin-template', {
          ...user,
          year: moment().get('year'),
        })
    })
  }
}
