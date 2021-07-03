import React from 'react'
import { io } from 'socket.io-client'
import sound from '../assets/sharp-592.mp3'

const path =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3333' : '/'

const socket = io(path, {
  autoConnect: true,
  auth:{
      cookie: window.Cookies.get('userripple')
  }
})

export default function useSocket ({ topics = [], playSoundOnNewMessage=true }) {
  const [data, setData] = React.useState()

  React.useEffect(() => {
    subscribeToEvents()
  }, [])

  const subscribeToEvents = () =>
    topics.map(topic =>
      socket.on(topic, newContent => {
        setData(newContent)
        playSoundOnNewMessage && playSound()
      })
    )

    const playSound = ()=>{
     const audio =   new Audio(sound)
     return audio.play()
    }

  return { data }
}
