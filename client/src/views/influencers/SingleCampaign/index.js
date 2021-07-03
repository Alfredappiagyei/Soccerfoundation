import React from 'react'
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap'
import Sticky from 'react-sticky-el'
import classnames from 'classnames'
import Activity from './Activity'
import Chat from './Chat'
import Details from './Details'
import { useParams } from 'react-router-dom'
import Spinner from '../../../components/@vuexy/spinner/Loading-spinner'
import useQuery from '../../../hooks/useQuery'
import queryString from 'query-string'
import { history } from '../../../history'
import Delivery from './Delivery'


export default function SingleCampaign (props) {
  const params = queryString.parse(history?.location.search)
  const [activeTab, setTab] = React.useState(params.tab || 'activity')

  const { id } = useParams()
  const {
    data: singleCampaign,
    loading: loadingCampaign,
    refetch: reloadCampaign
  } = useQuery({
    endpointPath: `/api/influencers/campaigns/${id}`
  })

  const campaignInfluencer = singleCampaign?.influencers[0]
  const isInvitedOrRejected = ['invited', 'rejected', 'accepted'].includes(campaignInfluencer?.status)


  const setActiveTab = tab => {
    setTab(tab)
    history.replace(`/influencer/campaigns/${id}?tab=${tab}`)
  }

  if (loadingCampaign) return <Spinner />

  return (
    <>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === 'activity'
              })}
              onClick={() => {
                setActiveTab('activity')
              }}
            >
              ACTIVITY
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              disabled={isInvitedOrRejected}
              className={classnames({
                active: activeTab === 'details'
              })}
              onClick={() => {
                setActiveTab('details')
              }}
            >
              DETAILS
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              disabled={isInvitedOrRejected}
              className={classnames({
                active: activeTab === 'chat'
              })}
              onClick={() => {
                setActiveTab('chat')
              }}
            >
              CHAT
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              disabled={isInvitedOrRejected}
              className={classnames({
                active: activeTab === 'delivery'
              })}
              onClick={() => {
                setActiveTab('delivery')
              }}
            >
              DELIVERY
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent className='py-50' activeTab={activeTab}>
          <TabPane tabId='activity'>
            <Activity reloadCampaign={reloadCampaign} singleCampaign={singleCampaign} />
          </TabPane>
          <TabPane tabId='details'>
            <Details  singleCampaign={singleCampaign}/>
          </TabPane>
          <TabPane tabId='chat'>
            <Chat influencer={campaignInfluencer} singleCampaign={singleCampaign} />
          </TabPane>
          <TabPane tabId='delivery'>
            <Delivery singleCampaign={singleCampaign} />
          </TabPane>
        </TabContent>
</>
  )
}
