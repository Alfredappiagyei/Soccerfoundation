import React from 'react'
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Row,
  Col
} from 'reactstrap'
import classnames from 'classnames'
import { useParams } from 'react-router-dom'
import InfluencerChat from './InfluencerChat'
import Details from './Details'
import Activity from './Activity'
import AssignInfluencer from './AssignInfluencer'
import { history } from '../../../history'
import queryString from 'query-string'
import useQuery from '../../../hooks/useQuery'
import useMutation from '../../../hooks/useMutation'
import Spinner from '../../../components/@vuexy/spinner/Loading-spinner'
import EditCampaign from '../../brands/Campaign/Add'
import Deliverable from './Deliverable'

export default function SingleCampaign (props) {
  const { id } = useParams()
  const params = queryString.parse(history?.location.search)
  const [activeTab, setTab] = React.useState( params.tab || 'activity')

  const { data: singleCampaign, loading: loadingCampaign, refetch: reloadCampaign } = useQuery({
    endpointPath: `/api/brands/campaigns/${id}`
  })

  const { makeRequest: updateCampaign } = useMutation({
    endpointPath: `/api/brands/campaigns/${id}`,
    method: 'put'
  })

  const setActiveTab = (tab)=>{
    setTab(tab)
    history.replace(`/${props.user?.role.name}/campaigns/${id}?tab=${tab}`)
  }

  if(loadingCampaign) return <Spinner />

  const formEditDetails = ()=>{
    const  { activities, influencers, updated_at, created_at , min_duration, max_duration, min_age_group, max_age_group, ...rest } = singleCampaign

    return {
      age_range: [min_age_group, max_age_group],
      duration: [min_duration, max_duration],
      ...rest
    }
  }

  return (
    <Row>
      <Col xs={12}>
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
              className={classnames({
                active: activeTab === 'assign_influencers'
              })}
              onClick={() => {
                setActiveTab('assign_influencers')
              }}
            >
              ASSIGN INFLUENCERS
            </NavLink>
          </NavItem>
          
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === 'message_influencer'
              })}
              onClick={() => {
                setActiveTab('message_influencer')
              }}
            >
              MESSAGE INFLUENCER
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
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
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === 'edit'
              })}
              onClick={() => {
                setActiveTab('edit')
              }}
            >
              EDIT DETAILS
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent className='py-50' activeTab={activeTab}>
        <TabPane tabId='assign_influencers'>
            <AssignInfluencer setActiveTab={setActiveTab} singleCampaign={singleCampaign} reloadCampaign={reloadCampaign} addedInfluencers={singleCampaign?.influencers || []} campaignId={id} queryParams={params} />
          </TabPane>
          <TabPane tabId='activity'>
            <Activity activities={singleCampaign?.activities} />
          </TabPane>
          <TabPane tabId='message_influencer'>
            <InfluencerChat singleCampaign={singleCampaign} />
          </TabPane>
          <TabPane tabId='details'>
            <Details id={id} updateCampaign={updateCampaign} singleCampaign={singleCampaign}  />
          </TabPane>
          <TabPane tabId='delivery'>
            <Deliverable updateCampaign={updateCampaign} singleCampaign={singleCampaign} />
          </TabPane>
          <TabPane tabId='edit'>
              <EditCampaign  onUpdateComplete={reloadCampaign} editDetails={formEditDetails()}  />
          </TabPane>

        </TabContent>
      </Col>
    </Row>
  )
}
