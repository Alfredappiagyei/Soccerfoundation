import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import { SupportedCurrencies } from 'App/Models/Wallet'
import { upperCase } from 'lodash'

export default class UserSeeder extends BaseSeeder {
  public async run () {
    const adminRole = await Role.query().where('name', 'ilike', '%admin%').first()
    await User.updateOrCreateMany('email', [
      {
        email: 'admin@useripple.com',
        password: 'united',
        role: adminRole?.id,
        phoneNumber: '233554135754',
        isPhoneNumberVerified: true,
        firstName: 'kwame',
        lastName: 'admin',
        profileUrl: 'https://useripple.com/assets/images/home/logo.png',
      },
    ])

    const allUsers = await User.all()
    await Promise.all(allUsers.map(user=>{
      const currency = SupportedCurrencies[upperCase(user.country)] ?? SupportedCurrencies.GHANA
      return user.related('wallet').updateOrCreate({userId: user.id}, {currency})
    }))
  }
}
