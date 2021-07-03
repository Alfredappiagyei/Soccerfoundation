import React from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import ReactDOM from 'react-dom'
import { Button } from 'reactstrap'
import { Menu, Send } from 'react-feather'
import { startCase } from 'lodash'
import useQuery from '../../../../hooks/useQuery'
import useMutation from '../../../../hooks/useMutation'
import { AvForm, AvInput } from 'availity-reactstrap-validation'
import useSocket from '../../../../hooks/useSocket'
import ProfileAvatar from '../../../../components/ProfileAvatar'
import SingleChatMessage from '../../../../components/SingleChatMessage'
import '../../../../assets/scss/pages/app-chat.scss'
import FileUploader from '../../../../components/FileUploader'


const SingleChatMessageMemorized = React.memo(SingleChatMessage)

export default function ChatRight ({ activeSelectedInfluencer, ...props }) {
  const { data: { conversation } = {} } = useSocket({
    topics: [`new::conversation::${props.singleCampaign.owner_id}`]
  })
  const chatArea = React.createRef()
  const formRef = React.createRef()

  const {
    data: { data: chatsList = [], meta = {} } = {},
    loadMore,
    refetch: fetchMessages,
    updateData
  } = useQuery({
    endpointPath: '/api/admin/conversations',
    initialLoad: false
  })
  const { makeRequest } = useMutation({
    endpointPath: '/api/admin/conversations'
  })

  React.useEffect(() => {
    scrollToBottom()
  }, [chatsList])

  React.useEffect(() => {
    if (!conversation) return
    updateData({ ...meta, data: [...chatsList, conversation] })
  }, [conversation])

  React.useEffect(() => {
    if (!activeSelectedInfluencer) return
    fetchMessages({
      campaign_id: props.singleCampaign?.id,
      influencer_id: activeSelectedInfluencer?.id
    })
  }, [activeSelectedInfluencer, props.singleCampaign])

  const scrollToBottom = () => {
    const chatContainer = ReactDOM.findDOMNode(chatArea.current)
    chatContainer.scrollTop = chatContainer.scrollHeight
  }

  const renderChatList = chatsList.map((chat, i) => (
    <SingleChatMessageMemorized chatPosition={`${chat.is_from_brand ? 'chat-right' : 'chat-left'}`} chat={chat} key={i} />
  ))

  const onSendMessage = async values=>{
    const createdMessage = await makeRequest({
      ...values,
      campaign_id: props.singleCampaign?.id,
      influencer_id: activeSelectedInfluencer?.id,
      is_from_brand: true
    })
    updateData({ ...meta, data: [...chatsList, createdMessage] })
  }

  return (
    <div className='content-right'>
      <div className='chat-app-window'>
        <div className={`active-chat d-block`}>
          <div className='chat_navbar'>
            <header className='chat_header d-flex justify-content-between align-items-center p-1'>
              <div className='d-flex align-items-center'>
                <div
                  className='sidebar-toggle d-block d-lg-none mr-1'
                  onClick={() => props.mainSidebar(true)}
                >
                  <Menu size={24} />
                </div>
                <ProfileAvatar
                  imgWidth={40}
                  imgHeight={40}
                  status='online'
                  onClick={() =>
                    props.handleReceiverSidebar(activeSelectedInfluencer)
                  }
                  className='avatar user-profile-toggle m-0 m-0 mr-1'
                  imageUrl={activeSelectedInfluencer?.profile_url}
                  firstName={activeSelectedInfluencer?.first_name}
                  lastName={activeSelectedInfluencer?.last_name}
                />
                <h6 className='mb-0'>
                  {startCase(activeSelectedInfluencer?.full_name)}
                </h6>
              </div>
            </header>
          </div>
          <PerfectScrollbar
            className='user-chats'
            options={{
              wheelPropagation: false
            }}
            ref={chatArea}
            onYReachStart={() => {
              if (meta.current_page === meta.last_page) return
              loadMore({
                campaign_id: props.singleCampaign?.id,
                influencer_id: activeSelectedInfluencer?.id,
                page: meta?.current_page + 1
              })
            }}
          >
            <div className='chats'>{renderChatList}</div>
          </PerfectScrollbar>
          <div className='chat-app-form'>
            <AvForm
              className='chat-app-input d-flex align-items-center'
              onValidSubmit={async (e, values) => {
                formRef.current.reset()
                onSendMessage(values)
              }}
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
              <FileUploader folder='conversations' onlyIcon showPreview={false} onComplete={media=> onSendMessage({ media })} />
              <Button color='primary'>
                <Send className='d-lg-none' size={15} />
                <span className='d-lg-block d-none'>Send</span>
              </Button>
            </AvForm>
          </div>
        </div>
      </div>
    </div>
  )
}
