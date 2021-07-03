import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Notification extends BaseModel {
  public static table = 'notifications'

  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public userId: number

  @column()
  public message: string

  @column()
  public title: string

  @column({
    prepare: data=> typeof data === 'string' ? data: JSON.stringify(data),
  })
  public tags: Array<string>

  @column()
  public isFromAdmin?: boolean

  @column()
  public isRead?: boolean
}
