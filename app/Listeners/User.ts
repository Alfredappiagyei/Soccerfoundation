'use strict'
import { EventsList } from '@ioc:Adonis/Core/Event'
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'
import moment from 'moment'
import sms from '../Controllers/Lib/sms'
import constants from './constants'
import platforms from 'App/Controllers/Services/platforms'
import Notification from 'App/Models/Notification'
import Logger from '@ioc:Adonis/Core/Logger'
import User from 'App/Models/User'
import Campaign from 'App/Models/Campaign'
import { CampaignInfluencerStatus } from 'App/Models/CampaignInfluencer'

const baseUrl = `${Env.get('APP_URL')}/assets/email/images`
export default class Influencer {
  public onAccountTypeChange ({
    user,
    message,
  }: EventsList['notify::user::account::status::change']) {
    Logger.info('sending new account status change for user', user)
    const newMessage =
      message || constants.accountChange(user.approved as boolean)

    const title = 'Account Status Changed'
    return Promise.all([
      this.saveNotification({
        title,
        message: newMessage,
        user,
        is_from_admin: true,
        tags: ['Profile Status'],
      }),
      sms
        .sendSms({
          message: constants.accountChange(user.approved as boolean),
          phoneNumber: user.phoneNumber,
        })
        .then(() => Logger.info('sms sent for user for account change', user)),
      Mail.send(async sender => {
        sender
          .from(Env.get('SENDER_EMAIL', 'no-reply@useripple.com') as string)
          .to(user.email)
          .subject(title)
          .htmlView('emails/influencer-notifications', {
            ...user,
            message: newMessage,
            title,
            year: moment().get('year'),
            login_url: `${Env.get('APP_URL')}/influencer/home`,
            base_url: baseUrl,
          })
      }),
    ])
  }

  public async newConnectedSocialAccount ({
    social_account: socialAccount,
  }: EventsList['new::connected::social::ccount']) {
    Logger.info('New social account connected, fetching all engagement stats')
    const analytics = await (platforms[
      socialAccount.platform
    ] as any).getEngagementStats({
      accessToken: socialAccount.externalAccessToken,
      accessTokenSecret: socialAccount.externalAccessTokenSecret,
      screenName: socialAccount.handle,
      userId: socialAccount.externalId,
      followersCount: socialAccount.numberOfFollowers,
    })

    socialAccount.merge(analytics)
    Logger.info('social stats gotten for new social account', analytics)

    await socialAccount.save()
  }

  public newChangeEmailOrPassword ({
    email,
    phone_number,
    otp,
  }: EventsList['new::request:email::or::phone::change']) {
    const notificationMessage = `Your Ripple Influence verification code is ${otp}`
    return phone_number
      ? sms.sendSms({
        message: notificationMessage,
        phoneNumber: phone_number,
      })
      : Mail.send(message => {
        message
          .from(Env.get('SENDER_EMAIL', 'no-reply@useripple.com') as string)
          .to(email as string)
          .subject('Verify New Useripple Email')
          .htmlView('emails/influencer-notifications', {
            message: notificationMessage,
            year: moment().get('year'),
            login_url: `${Env.get('APP_URL')}/influencer/home`,
            base_url: baseUrl,
          })
      })
  }

  public saveNotification ({
    title,
    user,
    message,
    is_from_admin = false,
    tags = [],
  }: EventsList['new::in::app::notification']) {
    return Notification.create({
      userId: user.id as number,
      message,
      title,
      isFromAdmin: is_from_admin,
      tags,
    })
  }

  public async onCampaignAssignStatusChanged ({
    campaign_influencer,
  }: EventsList['new::influencer::assigned:campaign::status:changed']) {
    const user = (await campaign_influencer
      .related('influencer')
      .query()
      .firstOrFail()) as User
    const campaign = await campaign_influencer
      .related('campaign')
      .query()
      .firstOrFail()
    const title = `Invite ${campaign_influencer.status}`
    const newMessage = `Your invite to ${campaign.name} campaign has been ${campaign_influencer.status}`
    return Promise.all([
      this.saveNotification({
        title: `Invite ${campaign_influencer.status}`,
        message: newMessage,
        user,
        is_from_admin: true,
        tags: ['Campaign Status'],
      }),
      sms
        .sendSms({
          message: newMessage,
          phoneNumber: user.phoneNumber,
        })
        .then(() =>
          Logger.info(
            'sms sent for user for campaign influencer status change',
            user
          )
        ),
      Mail.send(async sender => {
        sender
          .from(Env.get('SENDER_EMAIL', 'no-reply@useripple.com') as string)
          .to(user.email)
          .subject(title)
          .htmlView('emails/influencer-notifications', {
            ...user,
            message: newMessage,
            title,
            year: moment().get('year'),
            login_url: `${Env.get('APP_URL')}/influencer/home`,
            base_url: baseUrl,
          })
      }),
    ])
  }

  public async campaignAcceptedByInfluencer ({
    campaign_influencer,
  }: EventsList['new::influencer::accepted:campaign']) {
    const campaign = await Campaign.query()
      .where('id', campaign_influencer.campaignId)
      .preload('influencers', builder =>
        builder
          .where('status', CampaignInfluencerStatus.ACCEPTED)
          .preload('influencer')
      )
      .preload('owner')
      .firstOrFail()

    const influencers = campaign.influencers

    const canNotify = influencers.length === 1
    if (!canNotify) {
      return Logger.info('cannot send more than one accepted invite notification')
    }
    return this.sendNotification({
      inAppTitle: constants.inapp.campaign_accepted.title,
      inAppMessage: constants.inapp.campaign_accepted.message.replace(
        'INFLUENCER_NAME',
        influencers[0].influencer.full_name
      ),
      inAppTags: ['Campaign'],
      user: campaign.owner,
      smsMessage: constants.sms.campaign_accepted,
      emailSubject: constants.email.campaign_accepted.subject.replace(
        'CAMPAIGN_NAME',
        campaign.name
      ),
      emailMessage: constants.email.campaign_accepted.message.replace(
        'INFLUENCER_NAME',
        influencers[0].influencer.full_name
      ),
      emailTemplate: 'emails/influencer-notifications',
    })
  }

  private sendNotification ({
    inAppTitle,
    inAppMessage,
    user,
    inAppTags = [],
    smsMessage,
    emailSubject,
    emailMessage,
    emailTemplate,
    emailTitle,
  }: {
    inAppTitle: string
    inAppMessage: string
    user: User
    inAppTags: string[]
    smsMessage: string
    emailSubject: string
    emailMessage: string
    emailTemplate: string
    emailTitle?:string
  }) {
    return Promise.all([
      this.saveNotification({
        title: inAppTitle,
        message: inAppMessage,
        user,
        is_from_admin: true,
        tags: inAppTags,
      }),
      sms
        .sendSms({
          message: smsMessage,
          phoneNumber: user.phoneNumber,
        })
        .then(() => Logger.info('sms sent for user for account change', user)),
      Mail.send(async sender => {
        sender
          .from(Env.get('SENDER_EMAIL', 'no-reply@useripple.com') as string)
          .to(user.email)
          .subject(emailSubject)
          .htmlView(emailTemplate, {
            ...user,
            title: emailTitle,
            message: emailMessage,
            year: moment().get('year'),
            login_url: `${Env.get('APP_URL')}/influencer/home`,
            base_url: baseUrl,
          })
      }),
    ]).catch(Logger.error)
  }
}
