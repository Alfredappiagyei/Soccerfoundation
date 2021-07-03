import React from 'react'
import videojs from 'video.js'
import VisibilitySensor from 'react-visibility-sensor'

import 'video.js/dist/video-js.css'

export default function VideoPlayer (props) {
  const ref = React.useRef()
  const [videoJsInstance, setVideoJsInstance] = React.useState()

  React.useEffect(() => {
   const vInstance= videojs(ref.current, props, function onPlayerReady () {
      console.log('onPlayerReady')
    })
    setVideoJsInstance(vInstance)
  }, [])

  const onChange = isVisible => {
      if(videoJsInstance && props.allowPlayOnFocus){
          if(isVisible){
            videoJsInstance.play()
          }else{
            videoJsInstance.pause()
          }
      }
  }

  return (
    <VisibilitySensor onChange={onChange}>
      <div data-vjs-player className={props.className}>
        <video ref={ref} className='video-js'></video>
      </div>
    </VisibilitySensor>
  )
}
