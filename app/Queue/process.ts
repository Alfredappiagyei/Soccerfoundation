'use strict'

import { Job } from 'bull'
import SocialAccount from 'App/Models/SocialAccount'
import Campaign from 'App/Models/Campaign'
import platforms from 'App/Controllers/Services/platforms'
import CampaignDeliverable from 'App/Models/CampaignDeliverable'
import Database from '@ioc:Adonis/Lucid/Database'

export default async function processJob (job: Job) {
  const trx = await Database.transaction()
  const jobData = job.data
  const deliverable = await CampaignDeliverable.findByOrFail('id', jobData.id, {
    client: trx,
  })
  const account = await SocialAccount.query({ client: trx })
    .where('userId', jobData.influencer_id)
    .where('platform', jobData.platform)
    .firstOrFail()
  await Campaign.query({ client: trx })
    .whereHas('influencers', builder =>
      builder.where('influencer_id', jobData.influencer_id)
    )
    .where('id', jobData.campaign_id)
    .firstOrFail()
  const stats = await (platforms[account.platform] as any).getSinglePostStats({
    externalAccessToken: account.externalAccessToken,
    externalAccessSecret: account.externalAccessTokenSecret,
    platformId: jobData.external_id,
  })

  deliverable.merge(stats)
  await deliverable.save()
  await trx.commit()
}
