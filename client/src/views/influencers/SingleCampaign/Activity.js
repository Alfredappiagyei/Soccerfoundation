import React from 'react'
import { AlertCircle } from 'react-feather'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Media,
  Row
} from 'reactstrap'
import PerfectScrollBar from 'react-perfect-scrollbar'
import moment from 'moment'
import useMutation from '../../../hooks/useMutation'
import { startCase } from 'lodash'

const OfferSingleItem = ({ title, value, veritical = false }) => (
  <dl className={`${veritical ? '' : 'd-flex'} justify-content-between mt-1`}>
    <dt>{title}</dt>
    <dd> {value}</dd>
  </dl>
)

const SingleActivity = ({ activity }) => (
  <li>
    <div className='timeline-icon bg-primary'>
      <AlertCircle size={16} />
    </div>
    <div className='timeline-info'>
      <p className='font-weight-bold mb-0'>{activity.title}</p>
      <span className='font-small-3'>{activity.description}</span>
    </div>
    <small className='text-muted'>
      {moment(activity.created_at).calendar()}
    </small>
  </li>
)

const SingleActivityMemorized = React.memo(SingleActivity)

export default function Activity ({ singleCampaign, reloadCampaign }) {
  const { makeRequest } = useMutation({
    endpointPath: '/api/influencers/campaigns/accept-reject'
  })
  const campaignInfluencer = singleCampaign?.influencers[0]
  const isInvited = campaignInfluencer?.status === 'invited'

  const acceptOrReject = status=>makeRequest({
    status,
    campaign_id: singleCampaign?.id
  }).then(()=> reloadCampaign())

  return (
    <Row>
      <Col lg={9}>
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardBody>
            <PerfectScrollBar style={{ height: window.innerHeight }}>
              <ul className='activity-timeline timeline-left list-unstyled'>
                {singleCampaign?.activities?.map(activity => (
                  <SingleActivityMemorized
                    activity={activity}
                    key={activity.id}
                  />
                ))}
              </ul>
            </PerfectScrollBar>
          </CardBody>
        </Card>
      </Col>

      <Col lg={3}>
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardBody>
            <Media>
              <Media className='mr-1' left href='#'>
                <Media
                  className='rounded-circle'
                  object
                  alt='User'
                  src='https://pixinvent.com/demo/vuexy-react-admin-dashboard-template/demo-1/static/media/macbook-pro.e723c891.png'
                  height='64'
                  width='64'
                />
              </Media>
              <Media className='mt-25' body>
                <p className='mt-50'>
                  <dt>{singleCampaign?.name}</dt>
                </p>
              </Media>
            </Media>
            <OfferSingleItem
              veritical
              title='Duration'
              value={
                <div>
                  From {moment(singleCampaign?.min_duration).calendar()} to{' '}
                  {moment(singleCampaign?.max_duration).calendar()}
                </div>
              }
            />
            <OfferSingleItem
              title='Status'
              value={
                <Badge color='primary' className='ml-3'>
                  {startCase(campaignInfluencer?.status)}
                </Badge>
              }
            />
            <OfferSingleItem
              title='Company name'
              value={singleCampaign?.company_name}
            />
            <OfferSingleItem
              title='Amount'
              value={campaignInfluencer?.amount}
            />
            <OfferSingleItem
              title='Description'
              veritical
              value={<div>{singleCampaign?.description}</div>}
            />
            {isInvited && (
              <div className='d-flex justify-content-between'>
                <Button.Ripple color='primary' onClick={()=> acceptOrReject('rejected')}>Reject</Button.Ripple>{' '}
                <Button.Ripple color='info' onClick={()=> acceptOrReject('accepted')}>Accept</Button.Ripple>{' '}
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}
