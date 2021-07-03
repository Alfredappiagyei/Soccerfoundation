/**
 * Contract source: https://git.io/JfefG
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import CampaignDeliverable from 'App/Models/CampaignDeliverable'
import CampaignInfluencer from 'App/Models/CampaignInfluencer'
import SocialAccount from 'App/Models/SocialAccount'
import User from 'App/Models/User'

declare module '@ioc:Adonis/Core/Event' {
  /*
  |--------------------------------------------------------------------------
  | Define typed events
  |--------------------------------------------------------------------------
  |
  | You can define types for events inside the following interface and
  | AdonisJS will make sure that all listeners and emit calls adheres
  | to the defined types.
  |
  | For example:
  |
  | interface EventsList {
  |   'new:user': UserModel
  | }
  |
  | Now calling `Event.emit('new:user')` will statically ensure that passed value is
  | an instance of the the UserModel only.
  |
  */
  interface EventsList {
    // eslint-disable-next-line max-len
    'new::registration': {
      user: { id: number; email: string; phoneNumber: string }
      role: { id: number; name: string },
      signed_url: string,
      otp: string
      send_email?: boolean
    },
    'new:passwordreset':{
      email: string
      id: number
      signed_url: string
    },
    'notify::admin:setup:complete': {
      user: User
    },
    'notify::user::account::status::change': {
      user: User,
      message:string
    },
    'new::connected::social::ccount':{
      social_account: SocialAccount
    },
    'new::request:email::or::phone::change':{
      user: User,
      email?: string,
      phone_number?: string,
      otp: string
    },
    'new::in::app::notification':{
      user: User,
      title: string,
      message: string,
      is_from_admin?: boolean
      tags?: Array<string>
    },
    'new::influencer::assigned:campaign::status:changed': {
      campaign_influencer: CampaignInfluencer,
      user: User
    },
    'new::influencer::accepted:campaign':{
      campaign_influencer: CampaignInfluencer
    },
    'new::campaign::deliverable':{
      deliverable: CampaignDeliverable
    }
  }
}
