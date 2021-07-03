import React from 'react'
import Sidebar from 'react-sidebar'
import InSidebar from './Sidebar'
import Content from './Content'
import useQuery from '../../../../hooks/useQuery'
import Spinner from '../../../../components/@vuexy/spinner/Loading-spinner'
import useMutation from '../../../../hooks/useMutation'
import Empty from '../../../../components/Empty'
import { Button } from 'reactstrap'
import '../../../../assets/scss/pages/app-ecommerce-shop.scss'
import connectedAccount from '../../../../assets/img/social_connected.png'

const mql = window.matchMedia(`(min-width: 992px)`)
export default function AssignInfluencer (props) {
  const [state, setState] = React.useState({
    sidebarDocked: mql.matches,
    sidebarOpen: false
  })

  const { data: { data, meta } = {}, loading, refetch } = useQuery({
    endpointPath: '/api/admin/users?role=influencer',
    initQuery: {
      excluded: props.addedInfluencers.map(campaign => campaign.influencer_id),
      connected_platforms: props?.singleCampaign?.social_platforms
    }
  })

  const { makeRequest } = useMutation({
    endpointPath: `/api/admin/campaigns/${props.campaignId}/assign-unassign`
  })

  React.useEffect(() => {
    mql.addEventListener('change', mediaQueryChanged)
    return () => {
      mql.removeEventListener('change', mediaQueryChanged)
      mediaQueryChanged()
    }
  }, [])

  const onAssign = async data => {
    await makeRequest(data)
    props.reloadCampaign()
  }

  const onSetSidebarOpen = open => {
    setState({ ...state, sidebarOpen: open })
  }

  const mediaQueryChanged = () => {
    setState({ ...state, sidebarDocked: mql.matches, sidebarOpen: false })
  }

  if (loading) return <Spinner />

  if (props.singleCampaign?.status === 'awaiting_approval') {
    return (
      <Empty
        content={
          <div>
            Campaign Not Approved <p />
            <Button
              size='sm'
              color='primary'
              onClick={() => props.setActiveTab('details')}
            >
              Change Status
            </Button>
          </div>
        }
        url={connectedAccount}
      />
    )
  }

  return (
    <React.Fragment>
      <div className='ecommerce-application'>
        <div
          className={`shop-content-overlay ${state.sidebarOpen ? 'show' : ''}`}
          onClick={() => onSetSidebarOpen(false)}
        ></div>
        <div className='sidebar-section'>
          <Sidebar
            sidebar={<InSidebar search={refetch} />}
            docked={state.sidebarDocked}
            open={state.sidebarOpen}
            sidebarClassName='sidebar-shop'
            touch={true}
            contentClassName='sidebar-children d-none'
          >
            ""
          </Sidebar>
        </div>
        <Content
          mainSidebar={onSetSidebarOpen}
          sidebar={state.sidebarOpen}
          influencers={data}
          meta={meta}
          refetch={refetch}
          onAssign={onAssign}
          {...props}
        />
      </div>
    </React.Fragment>
  )
}
