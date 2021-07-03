'use strict'

import { SupportedCurrencies } from 'App/Models/Wallet'

export type FlutterWaveVerifyTransactionResponse = {
  status: 'success' | 'failed'
  message: string
  data: {
    id: number
    tx_ref: string
    flw_ref: string
    device_fingerprint: string
    amount: number
    currency: SupportedCurrencies
    charged_amount: number
    app_fee: number
    merchant_fee: number
    processor_response: string
    auth_model: string
    ip: string
    narration: string
    status: 'successful' | 'failed'
    payment_type:
    | 'card'
    | 'mobilemoneygh'
    | 'account'
    | 'mpesa'
    | 'mobilemoneyrwanda'
    | 'mobilemoneyzambia'
    | 'mobilemoneytanzania'
    created_at: string
    account_id: number
    card?: {
      first_6digits: string
      last_4digits: string
      issuer: string
      country: string
      type: string
      token: string
      expiry: string
    }
    amount_settled: number
    customer: {
      id: number
      name: string
      phone_number: string
      email: string
      created_at: string
    }
  }
}
