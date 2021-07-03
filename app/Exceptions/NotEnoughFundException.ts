import { Exception } from '@poppinss/utils'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NotEnoughFundException extends Exception {
  constructor (message: string = 'You dont have enough funds to perform this operation') {
    super(message, 403)
  }

  /**
   * Implement the handle method to manually handle this exception.
   * Otherwise it will be handled by the global exception handler.
   */
  public async handle (error: this, { response }: HttpContextContract) {
    response
      .status(403)
      .json({
        message:error.message,
        success:false,
      })
  }
}
