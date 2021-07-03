import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export enum SupportedCurrencies {
  GHANA ='GHS',
  NIGERIA='NGN',
  KENYA='KES',
  UGANDA='UGX'
}

export default class Wallet extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public userId: number

  @column()
  public balance: number

  @column()
  public currency: SupportedCurrencies
}
