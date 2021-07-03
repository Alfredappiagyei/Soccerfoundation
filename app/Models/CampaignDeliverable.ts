import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { MediaType, SocialChannels } from './Feed'
import Campaign from './Campaign'

export enum DeliverableType {
  POST='post',
  MANUAL='manual'
}

export default class CampaignDeliverable extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public retweetCount?: number

  @column()
  public totalEngagements?: string

  @column()
  public totalLikes?: number

  @column()
  public totalComments?: number

  @column()
  public engagementScore?: string

  @column()
  public engagementRate: number

  @column()
  public body: string

  @column.dateTime()
  public createdAtChannel?: DateTime

  @column.dateTime()
  public updatedAtChannel?: DateTime

  @column()
  public platform: SocialChannels

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
  public caption: string

  @column()
  public campaignId: number

  @column()
  public influencerId: number

  @belongsTo(()=> Campaign)
  public campaign: BelongsTo<typeof Campaign>

  @column()
  public type?: DeliverableType
}
