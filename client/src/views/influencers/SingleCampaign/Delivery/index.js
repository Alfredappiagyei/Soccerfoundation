import React from 'react'
import { Col, Row, Spinner } from 'reactstrap'
import Feed from '../../../../components/Feed'
import useQuery from '../../../../hooks/useQuery'
import SubmitDeliverable from './SubmitDeliverable'
import PerfectScrollbar from 'react-perfect-scrollbar'
import Empty from '../../../../components/Empty'



export default function Delivery (props){
    const {
        data: { data: feeds = [], meta } = {},
        loading,
        loadMore,
        refetch
      } = useQuery({
        endpointPath: `/api/influencers/campaigns/${props.singleCampaign?.id}/deliverable`,
      })

      const paginate = () => {
        if (meta && !meta.next_page) return
        return loadMore({
          page: meta?.next_page + 1,
        })
      }
    

      const loader = (
        <div className='text-center mb-3'>
          <Spinner size='sm' /> <br /> loading...
        </div>
      )

      const renderItems = () => {
        if (loading) return loader
        if (!feeds.length)
          return (
            <Empty
              content='No posts found'
              url='https://pixinvent.com/demo/vuexy-react-admin-dashboard-template/demo-1/static/media/graphic-1.58c221eb.png'
            />
          )
        return (
          <PerfectScrollbar onYReachEnd={paginate}>
            {feeds.map(feed => (
              <Feed
                feed={feed}
                key={feed.id}
                showPublish={false}
                showSubmit={false}
                showViewFeed={false}
              />
            ))}
            <div className='mt-5 pt-5' />
          </PerfectScrollbar>
        )
      }


    return (
      <Row>
          <Col lg={6} xs={12}>
            {renderItems()}
          </Col>
          <Col lg={6} xs={12}>
              <SubmitDeliverable loadDeliverables={refetch} {...props} />
          </Col>
      </Row>
    )
}