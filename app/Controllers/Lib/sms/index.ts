'use strict'

import * as helloSms from './hello-sms'
import Env from '@ioc:Adonis/Core/Env'

const providerToUse = {
  helloSms,
}

const provider = Env.get('SMS_PROVIDER', 'helloSms') as string

export default providerToUse[provider] as {
  sendSms: ({
    message,
    phoneNumber,
  }: {
    message: string
    phoneNumber: string
  }) => Promise<{
    responseCode: number
    status: number
    message: number
  }>
}
