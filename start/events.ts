'use strict'
import Event from '@ioc:Adonis/Core/Event'
import Database from '@ioc:Adonis/Lucid/Database'

Event.on('new::registration', 'Auth.onNewRegister')
Event.on('new:passwordreset', 'Auth.newResetPassword')

Event.on('db:query', Database.prettyPrint)

// notify admin events
Event.on('notify::admin:setup:complete', 'Admin.onNewUserSetupComplete')

Event.on('notify::user::account::status::change', 'User.onAccountTypeChange')
Event.on('new::connected::social::ccount', 'User.newConnectedSocialAccount')
Event.on('new::request:email::or::phone::change', 'User.newChangeEmailOrPassword')
Event.on('new::influencer::assigned:campaign::status:changed', 'User.onCampaignAssignStatusChanged')

Event.on('new::influencer::accepted:campaign', 'User.campaignAcceptedByInfluencer')

// no processed events
Event.on('new::campaign::deliverable', 'General.pushDeliverableToBeTracked')
