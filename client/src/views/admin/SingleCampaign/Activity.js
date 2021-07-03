import React from 'react'
import { AlertCircle } from 'react-feather'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'reactstrap'
import PerfectScrollBar from 'react-perfect-scrollbar'
import moment from 'moment'

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

export default function Activity ({ activities = [] }) {
  return (
    <Row>
      <Col lg={2} />
      <Col lg={7}>
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardBody>
            <PerfectScrollBar style={{ height: window.innerHeight }}>
              <ul className='activity-timeline timeline-left list-unstyled'>
                {activities.map(activity => (
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
      <Col lg={3} />
    </Row>
  )
}
