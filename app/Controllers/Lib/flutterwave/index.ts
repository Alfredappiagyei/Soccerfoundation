'use strict'
import Env from '@ioc:Adonis/Core/Env'
import got from 'got'
import { FlutterWaveVerifyTransactionResponse } from './types'

const FLUTTERWAVE_SEC_KEY = Env.get('FLUTTERWAVE_SEC_KEY')
const request = got.extend({
  prefixUrl: 'https://api.flutterwave.com/v3',
  headers: {
    Authorization: `Bearer ${FLUTTERWAVE_SEC_KEY}`,
    'Content-Type': 'application/json',
  },
  responseType: 'json',
})

export const verifyTransaction = (tranxId: number) =>
  request
    .get(`transactions/${tranxId}/verify`)
    .then(response => response.body as any as FlutterWaveVerifyTransactionResponse)

export const transfer = ({ currency, reference, network, phoneNumber, fullName, amount }:{
  currency: string
  reference: string
  network: string
  phoneNumber: string
  fullName: string
  amount: number
})=>request.post('transfers',{
  json: {
    currency,
    reference,
    account_bank: network,
    account_number: phoneNumber,
    beneficiary_name: fullName,
    callback_url: `${Env.get('APP_URL')}/api/wallets/transfer/callback`,
    amount,
  },
}).then(response=> response.body as any).catch(error=> {
  throw error.response.body
})

export const verifyTransfer = (id:number) =>request.get(`transfers/${id}`).then(response=> response.body as any)
