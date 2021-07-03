import { Exception } from '@poppinss/utils'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UnAuthorizedException extends Exception {
  constructor (message: string = 'Sorry you are not allowed to view this page', status:number=401) {
    super(message, status)
  }

  /**
   * Implement the handle method to manually handle this exception.
   * Otherwise it will be handled by the global exception handler.
   */
  public async handle (error: this, { response }: HttpContextContract) {
    response
      .status(error.status)
      .json({
        message: error.message,
        success: false,
      })
  }
}
