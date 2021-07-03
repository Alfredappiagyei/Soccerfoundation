import moment from 'moment'
import React from 'react'
import { FileText } from 'react-feather'
import { Col, Row } from 'reactstrap'
import VideoPlayer from '../VideoPlayer'

const mediaType = {
  image: ({ url }) => (
    <img src={url} alt={url} className='img-fluid' />
  ),
  video: ({ url }) => (
    <>
      <VideoPlayer
        url={url}
        autoplay={false}
        controls
        sources={[
          {
            src: url
          }
        ]}
        allowPlayOnFocus={false}
        className='w-100'
      />
      <style>{`
    .video-js{
      width: 100%
    }
    `}</style>
    </>
  ),
  other: ({ url, chatPosition }) => {
    const fileNameSplit = url.split('/')
    const fileName = fileNameSplit[fileNameSplit.length - 1]
    return (
      <div className='d-flex'>
        <FileText size={14} />
        <a
          download
          href={url}
          className={'ml-1'}
          style={{ color: chatPosition === 'chat-right' ? 'white' : '' }}
        >
          {fileName}
        </a>
      </div>
    )
  }
}

export const MediaTypeComponent = ({ media = [], chatPosition }) => {
  return (
    <Row>
      {media.map(({ type, url }) => {
        const MediaComponent = mediaType[type] || mediaType.other
        return (
          <Col key={url} lg={media.length < 2 ? 12 : 6}>
            <MediaComponent url={url} chatPosition={chatPosition} />
          </Col>
        )
      })}
    </Row>
  )
}

const SingleChatMessage = ({ chat, chatPosition }) => (
  <div className={`chat ${chatPosition}`}>
    <div className='chat-body'>
      <div className='chat-content' style={{ width: '70%' }}>
        <p>{chat.message}</p>
        <div className='mt-2'>
          <MediaTypeComponent
            media={chat?.media}
            totalMedia={chat?.media?.length}
            chatPosition={chatPosition}
          />
        </div>
        <div className='mt-2 font-italic font-small-1'>
          {moment(chat.created_at).calendar()}{' '}
        </div>
      </div>
    </div>
  </div>
)

export default SingleChatMessage
