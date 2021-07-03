'use strict'

import Route from '@ioc:Adonis/Core/Route'
import { ROLES } from 'App/Models/User'

Route.get('/media/:filename', 'GeneralsController.loadFile')
// general routes
Route.group(() => {
  Route.get('interests', 'GeneralsController.getAllHistory')
  Route.post('/media/upload', 'GeneralsController.fileUpload')
  Route.get('/notifications', 'GeneralsController.getNotification')
  Route.patch('/notifications/:id', 'GeneralsController.markNotificationAsRead')
}).middleware('auth')

// Both influencer and brand
Route.group(() => {
  Route.get(
    '/social-accounts/:platforms/auth',
    'SocialController.twitterRequestAuth'
  )
  Route.post('/social-accounts', 'SocialController.connectPlatform')
  Route.get('/social-accounts', 'SocialController.listSocialAccounts')
  Route.delete('/social-accounts/:id', 'SocialController.removeSocialAccount')
  // users
  Route.get('/me', 'UsersController.getProfile')
  Route.patch('/me', 'UsersController.updateProfile')
  Route.post('/complete_setup', 'UsersController.completeSetup').middleware([
    `acl:${ROLES.BRAND},${ROLES.INFLUENCER}`,
  ])
  Route.post('/me/share', 'UsersController.shareAccount')
  Route.get('/feeds', 'FeedsController.index')
  Route.get('/me/feeds', 'FeedsController.getUserFeeds')
  Route.patch('/feeds/:id/likes', 'FeedsController.likeFeed')
  Route.post(
    '/me/credentials/change',
    'UsersController.requestemailOrPasswordChange'
  )

  // transactions
  Route.get('/transactions', 'TransactionsController.index')

  // wallets
  Route.get('/wallets', 'WalletsController.index')
  Route.post('wallets/topup', 'WalletsController.topupAccount').middleware(
    `acl:${ROLES.BRAND}`
  )
  Route.post('wallets/transfer', 'WalletsController.transfer')
  Route.post(
    '/wallets/payout',
    'WalletsController.releaseFundsToInfluencer'
  ).middleware([`acl:${ROLES.BRAND},${ROLES.ADMIN}`])

  Route.get(
    '/campaigns/:campaign_id/deliverable/influencers',
    'CampaignDeliverablesController.getInfluencersWithDeliverableStats'
  ).middleware([`acl:${ROLES.BRAND},${ROLES.ADMIN}`])
  Route.resource(
    '/campaigns/:campaign_id/deliverable',
    'CampaignDeliverablesController'
  )

  Route.resource('campaigns', 'CampaignsController')
    .only(['store', 'index', 'update', 'show'])
    .middleware({
      store: `acl:${ROLES.BRAND}`,
      update: `acl:${ROLES.BRAND},${ROLES.ADMIN}`,
    })
  Route.post(
    '/conversations/broadcast',
    'ConversationsController.broadCast'
  ).middleware([`acl:${ROLES.BRAND},${ROLES.ADMIN}`])
  Route.resource('conversations', 'ConversationsController').only([
    'store',
    'index',
    'update',
  ])
  Route.post(
    '/campaigns/:id/assign-unassign',
    'CampaignsController.assignOrUnAssignInfluencer'
  )
  Route.post(
    '/campaigns/accept-reject',
    'CampaignsController.acceptOrRejectCampaign'
  ).middleware([`acl:${ROLES.INFLUENCER}`])
})
  .prefix('api/:role')
  .middleware(['auth', `acl:${ROLES.BRAND},${ROLES.INFLUENCER},${ROLES.ADMIN}`])

Route.post(
  'api/wallets/transfer/callback',
  'WalletsController.transferCallback'
)

Route.get(
  '/api/influencers/shared',
  'InfluencerUsersController.getSharedContent'
)

Route.get(
  '/api/influencers/social-accounts/:platform/callback',
  'SocialController.platformConnectCallback'
)
