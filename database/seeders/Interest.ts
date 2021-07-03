/* eslint-disable max-len */
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Interest from 'App/Models/Interest'

// eslint-disable-next-line max-len
const INTERESTS_INFLUENCER_LIST = 'Fashion , Food , Music & Entertainment, Baby, Humor, Beauty, Travel, Holiday, Animals, Health & Fitness, Sport, Automotive, Art & Design, Technology, Lifestyle, Business, Photography'

const BRANDS_INTERESTS = 'Aerospace,Transport,Computer,Banking,Telecommunication,,Agriculture,Construction,Education,Pharmaceutical,Food,Health care,Hospitality, Entertainment,News Media,Energy,Insurance,Manufacturing, Music, Mining, Software, Electronics, Security, Others'

export default class InterestSeeder extends BaseSeeder {
  public async run () {
    // eslint-disable-next-line max-len
    const influencerList = INTERESTS_INFLUENCER_LIST.split(',').map(interest=> ({ name: interest, is_for_brands: false }))
    await Interest.updateOrCreateMany('name',influencerList)

    const brandsList = BRANDS_INTERESTS.split(',').map(interest=> ({ name: interest, is_for_brands: true }))
    await Interest.updateOrCreateMany('name',brandsList)
  }
}
