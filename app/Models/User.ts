import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  hasMany,
  HasMany,
  belongsTo,
  BelongsTo,
  computed,
  hasOne,
  HasOne,
} from '@ioc:Adonis/Lucid/Orm'
import UserInterests from 'App/Models/UserInterests'
import Role from 'App/Models/Role'
import Media from 'App/Models/Media'
import SocialAccount from 'App/Models/SocialAccount'
import Notification from './Notification'
import Wallet from './Wallet'
import Transaction from './Transaction'
import Campaign from './Campaign'
import CampaignInfluencer from './CampaignInfluencer'
import CampaignDeliverable from './CampaignDeliverable'

export enum ROLES {
  ADMIN='admin',
  BRAND='brand',
  INFLUENCER='influencer'
}

export default class User extends BaseModel {
  public static table = 'users'

  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public firstName: string

  @column()
  public lastName: string

  @column()
  public role: number

  @column()
  public country: string

  @column()
  public city: string

  @column()
  public instagramHandle: string

  @column()
  public twitterHandle: string

  @column({ serializeAs: null })
  public rememberMeToken?: string

  @column()
  public phoneNumber: string

  @column()
  public businessDescription: string

  @column()
  public offering: string

  @column()
  public profileUrl: string

  @column()
  public budget: number

  @column()
  public representativeName: number

  @column()
  public businessName: string

  @column()
  public isEmailVerified: boolean

  @column()
  public isPhoneNumberVerified: boolean

  @column()
  public phoneVerificationExpireDate: Date

  @column()
  public phoneVerificationCode: string

  @column()
  public approved?: boolean

  @column()
  public influencerType?: string

  @column()
  public rejectionReason?: string

  @column()
  public status: string

  @column()
  public companySize?: string

  @column()
  public websiteUrl?: string

  @column()
  public description: string

  @column()
  public handle: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public dateOfBirth: DateTime

  @computed()
  public get full_name (){
    return `${this.lastName} ${this.firstName}`
  }

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @hasMany(() => UserInterests,{
    serializeAs: 'interests',
  })
  public userInterests: HasMany<typeof UserInterests>

  @belongsTo(() => Role, {
    foreignKey: 'role',
  })
  public userRole: BelongsTo<typeof Role>

  @belongsTo(()=> Role,{
    foreignKey: 'role',
    onQuery: (builder)=> builder.where('name', '!=', ROLES.ADMIN),
  })
  public nonAdminRole: BelongsTo<typeof Role>

  @hasMany(() => Media)
  public userMedia: HasMany<typeof Media>

  @hasMany(() => SocialAccount)
  public userSocialAccounts: HasMany<typeof SocialAccount>

  @hasMany(()=> Notification)
  public notifications: HasMany<typeof Notification>

  @hasOne(()=> Wallet)
  public wallet: HasOne<typeof Wallet>

  @hasMany(()=> Transaction)
  public transactions: HasMany<typeof Transaction>

  @hasMany(()=> Campaign,{
    foreignKey: 'ownerId',
  })
  public campaigns: HasMany<typeof Campaign>

  @hasMany(()=> CampaignInfluencer,{
    foreignKey: 'influencerId',
  })
  public involvedCampaigns: HasMany<typeof CampaignInfluencer>

  @hasMany(()=> CampaignDeliverable, {
    foreignKey: 'influencerId',
  })
  public campaignDeliverables: HasMany<typeof CampaignDeliverable>
}
