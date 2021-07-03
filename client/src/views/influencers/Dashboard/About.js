import React from 'react'
import { Card, CardHeader, CardTitle, CardBody } from 'reactstrap'
import { sumBy } from "lodash";

export default function About ({ user, socialAccounts}) {
  const reach = sumBy(socialAccounts, account=> account.number_of_followers || 0) 
  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardBody>
      <div className='mt-1'>
          <h6 className='mb-0'>Reach:</h6>
          <p>
            {reach}
          </p>
        </div>
        <div className='mt-1'>
          <h6 className='mb-0'>Location:</h6>
          <p>
            {user?.city}, {user?.country}
          </p>
        </div>
        <div className='mt-1'>
          <h6 className='mb-0'>Email:</h6>
          <p>{user?.email}</p>
        </div>
        {/* <div className='mt-1'>
          <h6 className='mb-0'>Website:</h6>
          <p>www.pixinvent.com</p>
        </div> */}
        {/* <div className='mt-1'>
          <Button color='primary' size='sm' className='btn-icon mr-25 p-25'>
            <Facebook />
          </Button>
          <Button color='primary' size='sm' className='btn-icon mr-25 p-25'>
            <Twitter />
          </Button>
          <Button color='primary' size='sm' className='btn-icon p-25'>
            <Instagram />
          </Button>
        </div> */}
      </CardBody>
    </Card>
  )
}
