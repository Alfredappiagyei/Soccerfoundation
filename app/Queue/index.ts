'use strict'
import Queue from 'bull'
import Redis from '@ioc:Adonis/Addons/Redis'
import CampaignDeliverable from 'App/Models/CampaignDeliverable'
import queueProcessor from './process'

const oneDayToMilliseconds = 1000 * 60 * 60 * 12

const queue = new Queue('MONITOR POSTS QUEUE', {
  redis: Redis.options,
})

const addJob = ({ data, endDate }:{
  data: CampaignDeliverable
  endDate: Date
})=>queue.add(data,{
  repeat:{
    every: oneDayToMilliseconds,
    endDate,
  },
  jobId: data.id,
  attempts: 3,
})

queue.process(queueProcessor)

export { addJob, queue }
