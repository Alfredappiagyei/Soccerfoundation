import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Wallet, { SupportedCurrencies } from './Wallet'
import User from './User'

export enum TransactionStatuses {
  SUCCESFUL = 'sucessful',
  FAILED = 'failed',
  ESCROW = 'escrow',
  DISPUTED = 'disputed',
  PENDING = 'pending'
}

export enum CashFlow {
  INWARD = 'inward',
  OUTWARD = 'outward'
}

export enum Providers {
  FLUTTERWAVE = 'flutterwave'
}

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public walletId: number

  @column()
  public userId: number

  @column()
  public amount: number

  @column()
  public currency: SupportedCurrencies

  @column()
  public fees: number

  @column()
  public status: TransactionStatuses

  @column()
  public flow: CashFlow

  @column()
  public activity: string

  @column()
  public provider: Providers

  @column()
  public externalTransactionId: string

  @column()
  public accountNumber: string

  @column()
  public initialBalance: number

  @column()
  public settledAmount?: number

  @column()
  public totalCharge?:number

  @column()
  public finalBalance: number

  @column()
  public paymentType?: string

  @column()
  public description?: string

  @belongsTo(()=> Wallet)
  public wallet: BelongsTo<typeof Wallet>

  @column()
  public campaignId?: number

  @column()
  public influencerId?: number

  @belongsTo(()=> User,{
    foreignKey: 'influencerId',
  })
  public influencer: BelongsTo<typeof User>
}
