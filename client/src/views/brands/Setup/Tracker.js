import moment from 'moment'
import React from 'react'
import {  Check } from 'react-feather'
import { Card, CardBody, CardHeader, CardTitle } from 'reactstrap'

export default function Tracker ({user}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>
      <CardBody>
        <ul className='activity-timeline timeline-left list-unstyled'>
        <li>
            <div className='timeline-icon bg-success'>
            <Check size={16} />
            </div>
            <div className='timeline-info'>
              <p className='font-weight-bold mb-0'>Signed Up</p>
              {/* <span className='font-small-3'>
                Bonbon macaroon jelly beans gummi bears jelly lollipop apple
              </span>  */}
            </div>
  <small className='text-muted'>{moment(user.created_at).calendar()}</small>
          </li>
          <li>
            <div className={`timeline-icon bg-${user.status === 'submitted'? 'success': 'gray'}`}>
            <Check size={16} color={user.status === 'submitted' ?'white': 'black'} />
            </div>
            <div className='timeline-info'>
              <p className='font-weight-bold mb-0'>Submit Profile</p>
              {/* <span className='font-small-3'>
                Bonbon macaroon jelly beans gummi bears jelly lollipop apple
              </span> */}
            </div>
            {/* <small className='text-muted'>{moment(user.updated_at).calendar()}</small> */}
          </li>
          <li>
          <div className={`timeline-icon bg-${user.approved ? 'success': 'gray'}`}>
            <Check size={16} color={user.approved ? 'white': "black"} />
            </div>
            <div className='timeline-info'>
              <p className='font-weight-bold mb-0'>Awaiting Approval</p>
              {/* <span className='font-small-3'>
                Cupcake gummi bears soufflé caramels candy
              </span> */}
            </div>
            {/* <small className='text-muted'>{moment(user.updated_at).calendar()}</small> */}
          </li>
          <li>
          <div className={`timeline-icon bg-${user.approved ? 'success': 'gray'}`}>
            <Check size={16} color={user.approved ? 'white': "black"} />
            </div>
            <div className='timeline-info'>
              <p className='font-weight-bold mb-0'>Dashboard Access</p>
              {/* <span className='font-small-3'>
                Candy ice cream cake. Halvah gummi bears
              </span> */}
            </div>
            {/* <small className='text-muted'>{moment(user.updated_at).calendar()}</small> */}
          </li>
        </ul>
      </CardBody>
    </Card>
  )
}
