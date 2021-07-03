'use strict'
import {Server, Socket } from 'socket.io'
import AdonisServer from '@ioc:Adonis/Core/Server'
import Http from 'http'
import CorsConfig from '../config/cors'
import Logger from '@ioc:Adonis/Core/Logger'

let wsSocket

const handleConnections = (wsSocket: Socket)=>{
  Logger.info('New Ws Connection established', wsSocket.id)
  console.log(wsSocket.id, 'connected')
}

if (!wsSocket) {
  wsSocket = new Server(AdonisServer?.instance as Http.Server, {
    cors: CorsConfig,
    serveClient: false,
  })

  // wsSocket.use((socket: Socket, next)=>{
  // //auth coming soon
  //   next()
  // })

  wsSocket.on('connection', handleConnections)
  wsSocket.on('close', wsSocket=>{
    Logger.error('Ws Connection closed', wsSocket.id)
  })
}

export default wsSocket as Socket
