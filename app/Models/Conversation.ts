import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Conversation extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public message: string

  @column({
    prepare: value=> typeof value === 'string' ? value: JSON.stringify(value),
  })
  public media: {
    url: string
    type: string
  }[]

  @column()
  public influencerId: number

  @column()
  public campaignId: number

  @column()
  public isFromBrand: boolean

  @column()
  public isNotified: boolean

  @column()
  public isBroadcast?: boolean
}
