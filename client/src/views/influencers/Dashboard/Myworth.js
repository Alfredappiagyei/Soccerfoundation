import React from 'react'
import { Card, CardHeader, CardTitle, CardBody } from 'reactstrap'
import ProfileAvatar from '../../../components/ProfileAvatar';

export default function Myworth ({ socialAccounts = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Worth</CardTitle>
      </CardHeader>
      <CardBody className='suggested-block'>
        {socialAccounts.map(account => (
          <div
            className='d-flex justify-content-start align-items-center mb-1'
            key={account.id}
          >
            <div className='avatar mr-50'>
              <ProfileAvatar firstName={account?.external_name}  imageUrl={account?.external_profile_url} />
            </div>
            <div className='user-page-info'>
              <p>{account?.external_name}</p>
              <span className='font-small-2'>{account.type}</span>
            </div>
            <div className='ml-auto'>
              {account?.average_earnings}
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  )
}
