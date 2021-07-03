import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'

export default class RoleSeeder extends BaseSeeder {
  public async run () {
    await Role.updateOrCreateMany('name',[
      {
        name: 'influencer',
        display_name: 'Influencer',
      },
      {
        name: 'admin',
        display_name: 'Admin',
      },
      {
        name: 'brand',
        display_name: 'brand',
      },
    ] as {
      name: string
      display_name: string
    }[])
  }
}
