'use strict'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'
import Interest from 'App/Models/Interest'
import Env from '@ioc:Adonis/Core/Env'
import * as storage from '../Lib/disk'
import Media from 'App/Models/Media'
import md5 from 'md5'
import fs from 'fs'
import Notification from 'App/Models/Notification'
import { isNil } from 'lodash'

enum FileAccessTypes {
  influencer = 'influencer',
  brand = 'brand'
}

export default class GeneralsController {
  public getAllHistory ({ request }: HttpContextContract) {
    const isBrand = !!request.all()?.is_brand
    return Interest.query().where('is_for_brands', '=', isBrand)
  }

  public async fileUpload ({ request, auth }: HttpContextContract) {
    const userSchema = schema.create({
      file: schema.file({
        size: '50mb',
        extnames: [
          'jpg',
          'png',
          'jpeg',
          'mp4',
          'doc',
          'txt',
          'csv',
          'mpeg',
          'flv',
          'mp3',
          'pdf',
        ],
      }),
      is_secured: schema.boolean([rules.required()]),
      folder: schema.enum(['profile', 'campaign', 'feeds', 'conversations'], [rules.required()]),
    })

    const validatedData = await request.validate({
      schema: userSchema,
      messages: {
        'file.file.size': 'Image size must be under 50mb',
      },
    })
    const user = auth.user
    const role = await user
      ?.related('userRole')
      .query()
      .first()
    const fileName = md5(validatedData.file.clientName.replace(/\s/, ''))

    const fileResponse = await storage.upload({
      location: `${role?.name}/${user?.id}/${validatedData.folder}/${fileName}.${validatedData.file.extname}`,
      file: fs.readFileSync(validatedData.file.tmpPath as string),
      contentType: `${validatedData.file.type}/${validatedData.file.extname}`,
    })
    const actualFileUrl = this.formReturnUrl(
      `${fileName}.${validatedData.file.extname}`
    )
    await user?.related('userMedia').create({
      name: fileName,
      url: fileResponse.Location,
      type: validatedData.file.type,
      isSecured: validatedData.is_secured,
      externalKey: fileResponse.Key,
      allowedAccess: JSON.stringify([
        FileAccessTypes.brand,
        FileAccessTypes.influencer,
      ]),
    })
    return {
      url: actualFileUrl,
      type: validatedData.file.type,
    }
  }

  private formReturnUrl (fileName) {
    return `${Env.get('APP_URL')}/media/${fileName}`
  }

  public async loadFile ({ response, params, auth }: HttpContextContract) {
    const userSchema = schema.create({
      filename: schema.string({ trim: true }, [rules.required()]),
    })

    const validatedData = await validator.validate({
      schema: userSchema,
      messages: {
        filename: 'filename is required',
      },
      data: params,
    })
    try {
      const file = await Media.findByOrFail(
        'name',
        validatedData.filename.split('.')[0]
      )

      if (file.isSecured && !auth.isAuthenticated) {
        throw new Error('unauthorized to access this resource')
      }
      const externalObject = await storage.getObject(file.externalKey).promise()
      response.header('Content-type', externalObject.ContentType as string)
      response.header('Content-length', externalObject.ContentLength as number)
      response.header('cache-control', 'public, max-age=30000')
      return response.send(externalObject.Body)
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: error.message || 'file not found',
      })
    }
  }

  public async getNotification ({ request, auth }: HttpContextContract) {
    const userSchema = schema.create({
      is_read: schema.boolean.optional(),
      page: schema.number.optional(),
      per_page: schema.number.optional(),
      message: schema.string.optional({ trim: true, escape: true }),
    })

    const {
      page = 1,
      per_page: perPage = 20,
      is_read: isRead,
      message,
    } = await request.validate({
      schema: userSchema,
    })

    return auth.user
      ?.related('notifications')
      .query()
      .where(builder => {
        if (!isNil(isRead)) {
          builder.where('is_read', isRead)
        }
        if(!isNil(message)){
          builder.where('message', 'ilike', `%${message}%`)
        }
      })
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  public async markNotificationAsRead ({ params }: HttpContextContract){
    const userSchema = schema.create({
      id: schema.number([
        rules.exists({ table: 'notifications', column: 'id' }),
      ]),
    })

    const validated = await validator.validate({
      schema: userSchema,
      data:{
        ...params,
      },
    })
    const notification = await Notification.findOrFail(validated.id)
    notification.isRead = true
    await notification.save()
    return notification
  }
}
