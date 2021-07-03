import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import CampaignInfluencer from './CampaignInfluencer'
import CampaignActivity from './CampaignActivity'
import User from './User'

export enum CampaignGender {
  MALE = 'male',
  FEMALE= 'female',
  BOTH='both'
}

export enum CampaignType {
  BARTER ='barter',
  CAMPAIGN = 'campaign'
}

export enum CampaignStatues {
  APPROVED='approved',
  AWAITING_APPROVAL='awaiting_approval',
  REJECTED='rejected',
  ON_GOING = 'on_going',
  COMPLETED='completed',
  CANCELLED ='cancelled'
}

export default class Campaign extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public ownerId: string

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public companyName: string

  @column({
    prepare: value=> typeof value === 'string' ? value: JSON.stringify(value),
  })
  public objectives: string[]

  @column()
  public country: string

  @column()
  public city: string

  @column()
  public requirements: string

  @column()
  public goals: string

  @column()
  public notes: string

  @column({
    prepare: value=> typeof value === 'string' ? value: JSON.stringify(value),
  })
  public category: string[]

  @column()
  public minAgeGroup: number

  @column()
  public maxAgeGroup: number

  @column()
  public gender: CampaignGender

  @column.dateTime()
  public minDuration: DateTime

  @column.dateTime()
  public maxDuration: DateTime

  @column()
  public budget: number

  @column()
  public type: CampaignType

  @column()
  public status: CampaignStatues

  @column()
  public featureImageUrl: string

  @column({
    prepare: value=> typeof value === 'string' ? value: JSON.stringify(value),
  })
  public media:{
    url:string
    type: string
  }[]

  @column({
    prepare: value=> typeof value === 'string' ? value: JSON.stringify(value),
  })
  public socialPlatforms: string[]

  @hasMany(()=> CampaignInfluencer)
  public influencers: HasMany<typeof CampaignInfluencer>

  @hasMany(()=> CampaignActivity)
  public activities: HasMany<typeof CampaignActivity>
  @belongsTo(()=> User,{
    foreignKey: 'ownerId',
  })
  public owner: BelongsTo<typeof User>
}
