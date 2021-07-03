'use strict'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { router, setQueues, BullAdapter } from 'bull-board'
import express from 'express'
import {queue as postsQueue} from 'App/Queue'
import util from 'util'
const delay = util.promisify(setTimeout)

const expressApp = express()
setQueues([new BullAdapter(postsQueue)])

expressApp.use('/api/admin/monitor', router)

export default class QueuesUi {
  public index ({request, response}: HttpContextContract) {
    expressApp(request.request, response.response)
    return delay(1000)
  }
}
