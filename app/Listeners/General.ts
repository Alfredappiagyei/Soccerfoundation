import { EventsList } from '@ioc:Adonis/Core/Event'
import { addJob } from 'App/Queue'

export default class General {
  public async pushDeliverableToBeTracked ({
    deliverable,
  }: EventsList['new::campaign::deliverable']) {
    const campaign = await deliverable
      .related('campaign')
      .query()
      .firstOrFail()
    return addJob({
      data: deliverable.toJSON() as any,
      endDate: campaign.maxDuration.toJSDate(),
    })
  }
}
