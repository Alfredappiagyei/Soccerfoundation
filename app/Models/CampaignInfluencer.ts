import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Campaign from './Campaign'

export enum CampaignInfluencerStatus {
  INVITED = 'invited',
  ACCEPTED = 'accepted',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  PAID = 'paid',
  DISPUTED = 'disputed',
  SELECTED='selected'
}

export default class CampaignInfluencer extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public amount: number

  @column()
  public influencerId: number

  @column()
  public campaignId: number

  @column()
  public status: CampaignInfluencerStatus

  @column()
  public isInviteSent: boolean

  @belongsTo(()=> User, {
    foreignKey: 'influencerId',
  })
  public influencer: BelongsTo<typeof User>

  @belongsTo(()=> Campaign, {
    foreignKey: 'campaignId',
  })
  public campaign: BelongsTo<typeof Campaign>

  @column()
  public amountPaid: number
}
