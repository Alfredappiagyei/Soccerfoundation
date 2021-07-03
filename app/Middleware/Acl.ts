import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UnAuthorizedException from 'App/Exceptions/UnAuthorizedException'

export default class Acl {
  public async handle (
    { auth }: HttpContextContract,
    next: () => Promise<void>,
    allowedRoles: string[],
  ) {
    const userRole = await auth.user?.related('userRole').query().firstOrFail()
    if(!allowedRoles.includes(userRole?.name as string)){
      throw new UnAuthorizedException('You are not authorized to access this resource', 403)
    }
    await next()
  }
}
