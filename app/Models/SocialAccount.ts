import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Feed from './Feed'
import User from './User'

export enum SupportedPlatforms {
  facebook = 'facebook',
  instagram = 'instagram',
  twitter = 'twitter'
}

export default class SocialAccount extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public userId: number

  @column()
  public platform: SupportedPlatforms

  @column()
  public externalId: string

  @column()
  public externalName: string

  @column()
  public externalUserName?: string

  @column()
  public externalAccessToken?: string

  @column()
  public totalEngagements?: string

  @column()
  public totalPosts?: string

  @column()
  public externalAccessTokenSecret?: string

  @column()
  public externalProfileUrl?: string

  @column()
  public numberOfFollowers?: string

  @column()
  public numberOfFriends?: number

  @column()
  public numberOfFollowing?: number

  @column()
  public engagementRate?: number

  @column()
  public handle?: string

  @column({
    prepare: data=> typeof data === 'string' ? data: JSON.stringify(data),
  })
  public recentContent?: Array<Feed>

  @column()
  public averageComments?: number

  @column()
  public averageLikes?: number

  @column()
  public totalLikes?: number

  @column()
  public totalComments?: number

  @column()
  public engagementScore?: string

  @column()
  public averageEarnings?: string

  @column()
  public averageEngagements?: number

  @column()
  public impressions?: number

  @column()
  public postInterests?: string

  @column()
  public type?: string

  @column()
  public externalLink: string

  @column()
  public minAge?: number

  @column()
  public maxAge?: number

  @column()
  public gender?: string

  @column()
  public isPrivate?: boolean

  @column()
  public isActive?: boolean

  @column()
  public externalPageUrl?: string

  @column()
  public externalPageId?: string

  @column()
  public externalPageAccessToken?: string

  @column()
  public externalPageName?: string

  @belongsTo(()=> User)
  public user: BelongsTo<typeof User>
}
