'use strict'
import {
  column,
  BaseModel,
  belongsTo,
  BelongsTo,
} from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import Interest from './Interest'

export default class UserInterests extends BaseModel {
  public static table = 'user_interests'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public interestId: number

  @belongsTo(()=> Interest)
  public interest: BelongsTo<typeof Interest>
}
