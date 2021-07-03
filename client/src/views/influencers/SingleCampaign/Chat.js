import React from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Button, Card, CardBody, CardHeader } from 'reactstrap'
import { Send } from 'react-feather'
import senderImg from '../../../assets/img/portrait/small/avatar-s-2.jpg'
import useQuery from '../../../hooks/useQuery'
import Spinner from '../../../components/@vuexy/spinner/Loading-spinner'
import useMutation from '../../../hooks/useMutation'
import AvForm from 'availity-reactstrap-validation/lib/AvForm'
import AvInput from 'availity-reactstrap-validation/lib/AvInput'
import ReactDOM from 'react-dom'
import SingleChatMessage from '../../../components/SingleChatMessage'
import useSocket from '../../../hooks/useSocket'
import '../../../assets/scss/pages/app-chat.scss'
import FileUploader from '../../../components/FileUploader'

const SingleChatMessageMemorized = React.memo(SingleChatMessage)

export default function Chat ({ influencer, singleCampaign }) {
  const { data: { conversation } = {} } = useSocket({
    topics: [`new::conversation::${influencer?.influencer_id}`]
  })
  const chatArea = React.createRef()
  const formRef = React.createRef()

  const {
    data: { data: chatsList = [], meta } = {},
    loading,
    loadMore,
    updateData
  } = useQuery({
    endpointPath: '/api/influencers/conversations',
    initQuery: {
      campaign_id: influencer?.campaign_id,
      influencer_id: influencer?.influencer_id
    }
  })
  const { makeRequest } = useMutation({
    endpointPath: '/api/influencers/conversations'
  })

  const scrollToBottom = () => {
    const chatContainer = ReactDOM.findDOMNode(chatArea.current)
    chatContainer.scrollTop = chatContainer.scrollHeight
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [chatsList])

  React.useEffect(() => {
    if (!conversation) return
    updateData({ ...meta, data: [...chatsList, conversation] })
  }, [conversation])

  const onSendMessage = async values => {
    const createdMessage = await makeRequest({
      ...values,
      campaign_id: influencer?.campaign_id,
      influencer_id: influencer?.influencer_id,
      is_from_brand: false
    })
    updateData({ ...meta, data: [...chatsList, createdMessage] })
  }

  return (
    <Card className='chat-application chat-widget'>
      <CardHeader>
        <div className='chat_navbar'>
          <header className='chat_header d-flex justify-content-between align-items-center p-1'>
            <div className='d-flex align-items-center'>
              <div className='avatar user-profile-toggle m-0 m-0 mr-1'>
                <img src={singleCampaign?.feature_image_url} alt={senderImg} height='40' width='40' />
                <span className={'avatar-status-busy'} />
              </div>
              <h6 className='mb-0'>{singleCampaign?.name}</h6>
            </div>
          </header>
        </div>
      </CardHeader>
      <div className='chat-app-window'>
        <PerfectScrollbar
          className='user-chats'
          options={{
            wheelPropagation: false
          }}
          ref={chatArea}
          onYReachStart={() => {
            if (meta?.current_page === meta?.last_page) return
            loadMore({
              campaign_id: influencer?.campaign_id,
              influencer_id: influencer?.influencer_id,
              page: meta?.current_page + 1
            })
            console.log('reached the top')
          }}
        >
          <div className='chats'>
            {loading ? (
              <Spinner />
            ) : (
              chatsList.map(conversation => (
                <SingleChatMessageMemorized
                  chatPosition={`${
                    !conversation.is_from_brand ? 'chat-right' : 'chat-left'
                  }`}
                  chat={conversation}
                  key={conversation.id}
                />
              ))
            )}
          </div>
        </PerfectScrollbar>
        <div className='chat-footer'>
          <CardBody>
            <AvForm
              className='d-flex justify-content-around'
              onValidSubmit={async (e, values) => {
                formRef.current.reset()
                onSendMessage(values)
              }}
              ref={formRef}
            >
              <AvInput
                className='message mr-1 ml-50'
                name='message'
                placeholder='Type your message'
                required
                type='textarea'
                rows='1'
                cols='10'
                ref={formRef}
              />
              <FileUploader
                folder='conversations'
                onlyIcon
                showPreview={false}
                onComplete={media => onSendMessage({ media })}
              />
              <Button className='btn-icon' color='primary'>
                <Send size={15} />
              </Button>
            </AvForm>
          </CardBody>
        </div>
      </div>
    </Card>
  )
}
