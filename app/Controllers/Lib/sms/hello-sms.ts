'use strict'
import got from 'got'
import Env from '@ioc:Adonis/Core/Env'
import crypto from 'crypto'
import moment from 'moment'
import { formatPhoneNumber } from '../utils'

const SMS_CLIENT_ID = Env.get('SMS_CLIENT_ID')
const SMS_CLIENT_SECRET = Env.get('SMS_CLIENT_SECRET')
const createAuthKey = ()=>{
  const shasum = crypto.createHash('sha1')
  shasum.update(`${SMS_CLIENT_ID}${SMS_CLIENT_SECRET}${moment().format('YYYYMMDDHH')}`)
  return shasum.digest('hex')
}

export const sendSms = ({ phoneNumber, message }:{
  phoneNumber: string
  message: string
})=>got.post('https://helliomessaging.com/api/v2/sms',{
  json: {
    clientId: SMS_CLIENT_ID,
    applicationSecret: SMS_CLIENT_SECRET,
    senderId: Env.get('SMS_SENDER_NAME', 'UseRipple'),
    msisdn: formatPhoneNumber(phoneNumber).internationWithoutPlus,
    message,
    authKey: createAuthKey(),
  },
  responseType: 'json',
}).then(response=> response.body)

