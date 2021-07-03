import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Media extends BaseModel {
  public static table = 'media'

  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public userId: string

  @column()
  public isSecured: boolean

  @column()
  public url: string

  @column()
  public name: string

  @column()
  public type: string

  @column()
  public allowedAccess: string

  @column()
  public externalKey: string
}
