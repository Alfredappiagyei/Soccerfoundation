import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class TransactionsController {
  public async index ({ request, auth }: HttpContextContract) {
    const validationSchema = schema.create({
      page: schema.number.optional(),
      per_page: schema.number.optional(),
    })

    const { page = 1, per_page: perPage = 20 } = await request.validate({
      schema: validationSchema,
    })

    return auth.user
      ?.related('transactions')
      .query()
      .preload('influencer', builder=> builder.select('first_name', 'last_name', 'id'))
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }
}
