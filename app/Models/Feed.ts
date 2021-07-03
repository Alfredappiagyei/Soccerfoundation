import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import FeedsLike from './FeedsLike'

export enum MediaType {
  IMAGE='image',
  VIDEO='video'
}

export enum SocialChannels {
  FACEBOOK ='facebook',
  TWITTER ='twitter',
  INSTAGRAM = 'instagram',
  CUSTOM='custom'
}

export default class Feed extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public caption: string

  @column()
  public body: string

  @column.dateTime()
  public createdAtChannel?: DateTime

  @column.dateTime()
  public updatedAtChannel?: DateTime

  @column()
  public channel: SocialChannels

  @column()
  public link: string

  @column()
  public externalId?: string

  @column({
    prepare: data=> typeof data === 'string' ? data: JSON.stringify(data),
  })
  public media: Array<{
    url: string,
    type: MediaType
  }>

  @column({
    prepare: data=> typeof data === 'string' ? data: JSON.stringify(data),
  })
  public author: {
    name: string,
    profile_image: string,
    profile_link: string,
  }

  @column()
  public isPublished?: boolean

  @column()
  public isSponsored?: boolean

  @hasMany(() => FeedsLike)
  public likes: HasMany<typeof FeedsLike>
}
