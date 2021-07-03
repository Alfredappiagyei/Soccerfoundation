import React from 'react'
import { Card, CardHeader, CardTitle, CardBody, Button } from 'reactstrap'
import { startCase } from 'lodash'
import socialList from '../../../constants/socialAccountsList'
import Empty from '../../../components/Empty'
import { history } from '../../../history'
import connectedAccount from '../../../assets/img/social_connected.png'

const expectedPlatformList = Object.values(socialList)
export default function SocialAccountList ({ socialAccounts }) {
  const notConnectedAccounts = expectedPlatformList.filter(
    platform => !socialAccounts.find(account => account.platform === platform)
  )

  const connectStats = () => {
    const connnected = notConnectedAccounts.map(account => (
      <>
        <p />
        <div className='d-flex justify-content-between align-items-center mb-1'>
          <div className='user-info d-flex align-items-center'>
            <Button.Ripple
              color='primary'
              onClick={() => history.push('/influencer/settings?tab=3')}
            >
              Connect {startCase(account)}
            </Button.Ripple>
          </div>
        </div>
      </>
    ))

    return (
      <>
        <div>
          {`${socialAccounts.length}/${expectedPlatformList.length}`} Accounts Connected{' '}
        </div>
        {connnected}
      </>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Accounts</CardTitle>
      </CardHeader>
      <CardBody>
        {notConnectedAccounts.length ? (
          connectStats()
        ) : (
          <Empty
            content='All social accounts connected'
            url={connectedAccount}
          />
        )}
      </CardBody>
    </Card>
  )
}
