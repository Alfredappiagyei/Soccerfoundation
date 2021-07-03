import React from 'react'
import Sidebar from 'react-sidebar'
import ChatRight from './ChatRight'
import ChatSideBar from './ChatSidebar'
import SingleInfluencerStats from './SingleInfluencerStats'
import useQuery from '../../../../hooks/useQuery'
import Spinner from '../../../../components/@vuexy/spinner/Loading-spinner'

import '../../../../assets/scss/pages/app-chat.scss'
import BroadCast from './BroadCast'

const mql = window.matchMedia(`(min-width: 992px)`)

export default function InfluencerChat (props) {
  const [chatState, setChatState] = React.useState({
    userProfile: false,
    sidebarDocked: mql.matches,
    sidebarOpen: false,
    activeSelectedInfluencer: null,
    receiverProfile: false,
    userSidebar: false,
    influencerToShowDetails: null,
    showModal: false
  })
  const { data: { data: influencers=[], meta: influencersMeta }={}, loading, loadMore } = useQuery({
    endpointPath: '/api/admin/users?role=influencer',
    initQuery: {
        campaign_influencer_statuses: ['paid', 'disputed', 'selected', 'completed'],
        campaign_id: props.singleCampaign.id
    }
  })

  const selectedInfluencer  = chatState.activeSelectedInfluencer || influencers[0]

  const setState = data => setChatState({ ...chatState, ...data })

  // mounted = false
  const handleUserSidebar = status => {
    if (status === 'open') {
      setState({
        userProfile: true
      })
    } else {
      setState({
        userProfile: false
      })
    }
  }
  const onSelectActiveInfluencer = (influencer) => {
      if(influencer === chatState.activeSelectedInfluencer ) return 
      setState({
        activeSelectedInfluencer: influencer
      })
  }

  React.useEffect(() => {
    mql.addEventListener('change', mediaQueryChanged)
    return () => {
      mql.addEventListener('change', mediaQueryChanged)
    }
  })

  const onSetSidebarOpen = open => {
    setState({ sidebarOpen: open })
  }

  const mediaQueryChanged = () => {
    setState({ sidebarDocked: mql.matches, sidebarOpen: false })
  }

  const handleShowInfluencerStats = influencer => {
       setState({
        influencerToShowDetails: influencer
        })
  }

  if(loading) return <Spinner />

  return (
    <div className='chat-application position-relative'>
      <div
        className={`chat-overlay ${
          chatState.influencerToShowDetails ||
          chatState.userSidebar ||
          chatState.sidebarOpen
            ? 'show'
            : 'd-none'
        }`}
        onClick={() => {
          handleUserSidebar('close')
          onSetSidebarOpen(false)
          handleShowInfluencerStats()
        }}
      />
      <Sidebar
        sidebar={
          <ChatSideBar
            activeSelectedInfluencer={selectedInfluencer}
            handleUserSidebar={handleUserSidebar}
            mainSidebar={onSetSidebarOpen}
            influencers={influencers}
            onSelectActiveInfluencer={onSelectActiveInfluencer}
            loadMore={loadMore}
            influencersMeta={influencersMeta}
            toggle={()=> setState({ showModal: !chatState.showModal })}
          />
        }
        docked={chatState.sidebarDocked}
        open={chatState.sidebarOpen}
        touch={false}
        sidebarClassName='chat-sidebar'
        contentClassName='sidebar-children d-none'
      >
        ""
      </Sidebar>
      <ChatRight
        activeSelectedInfluencer={selectedInfluencer}
        handleReceiverSidebar={handleShowInfluencerStats}
        mainSidebar={onSetSidebarOpen}
        mql={mql}
        singleCampaign={props.singleCampaign}
      />
      <SingleInfluencerStats
        activeUser={chatState.activeUser}
        influencerToShowDetails={chatState.influencerToShowDetails}
        handleShowInfluencerStats={handleShowInfluencerStats}
      />
      <BroadCast {...props} showModal={chatState.showModal} toggle={()=> setState({ showModal: !chatState.showModal })} />
    </div>
  )
}
