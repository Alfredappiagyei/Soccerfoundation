'use strict'

import { MessageContract } from '@ioc:Adonis/Addons/Mail'
import Application from '@ioc:Adonis/Core/Application'
import fs from 'fs'
const emailMediaPath = Application.publicPath('assets/email/images')

const emailMedia = fs.readdirSync(emailMediaPath)

export default function loadAttachments (message: MessageContract){
  emailMedia.forEach(fileName=>{
    message.embed(`${emailMediaPath}/${fileName}`, `images/${fileName}`, {})
  })
  return message
}
