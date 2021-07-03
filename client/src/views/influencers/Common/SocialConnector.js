import React from 'react'
import { Button, CardTitle, Col, Row, Spinner } from 'reactstrap'
import { Facebook, Instagram, Twitter } from './socialButtons'
import request from '../../../helpers/request'
import useLocalStorageUser from '../../../hooks/useLocalStorageUser'
import SpinnerLoader from '../../../components/@vuexy/spinner/Loading-spinner'
import { startCase } from 'lodash'
import useQuery from "../../../hooks/useQuery";

export default function SocialConnector () {
  const [connectingPlatform, setConnecting] = React.useState('')
  const { item } = useLocalStorageUser()
  const { refetch: fetchSocialAccounts, data: socialAccounts=[], loading, updateData: setSocialAccounts  } = useQuery({
    endpointPath: '/api/influencers/social-accounts'
  })
  
  const onComplete = async payload => {
    try {
      setConnecting(payload.platform)
      const { data } = await request.post(
        '/api/influencers/social-accounts',
        payload
      )
      setConnecting('')
      setSocialAccounts([...socialAccounts, data])
    } catch (error) {
      setConnecting('')
    }
  }

  const isPlatformAdded = platform => {
    return socialAccounts.find(account => account.platform === platform)
  }

  const deleteAccount = async id => {
    await request
      .delete(`/api/influencers/social-accounts/${id}`)
      .then(({ data }) => {
        const filteredSocialAccounts = socialAccounts.filter(
          account => account?.id !== data?.id
        )
        setSocialAccounts(filteredSocialAccounts)
      })
  }

  if (loading) return <SpinnerLoader />

  return (
    <React.Fragment>
      <CardTitle> Manage Social Accounts </CardTitle>
      {connectingPlatform && (
        <div className='text-center'>
          <Spinner /> <br />
          Connecting... {connectingPlatform}
        </div>
      )}
      <Row>
        {socialAccounts.map(account => {
          return (
            <Col sm='12' key={account.id}>
              <div className='d-flex flex-wrap justify-content-between align-items-center mb-3'>
                <div className='social-media'>
                  <p className='mb-0'>
                    Account is connected with {startCase(account?.platform)}
                  </p>
                  <p className='text-bold-500'>{account?.external_name}</p>
                </div>
                <div className='disconnect'>
                  <Button.Ripple
                    color='danger'
                    outline
                    onClick={() => deleteAccount(account?.id)}
                  >
                    Disconnect
                  </Button.Ripple>
                </div>
              </div>
            </Col>
          )
        })}
      </Row>

      <div className='mb-5 d-flex justify-content-space'>
 
        {isPlatformAdded('twitter') ? null : (
          <Twitter userId={item.id} fetchSocialAccounts={fetchSocialAccounts} />
        )}

        {isPlatformAdded('instagram') ? null : (
          <Instagram userId={item.id} fetchSocialAccounts={fetchSocialAccounts} />
        )}

        {isPlatformAdded('facebook') ? null : (
          <Facebook onComplete={onComplete} />
        )}
      </div>
    </React.Fragment>
  )
}
