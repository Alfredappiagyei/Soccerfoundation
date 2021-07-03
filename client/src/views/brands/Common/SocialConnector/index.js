import React from 'react'
import { Button, CardTitle, Col, Row, Spinner } from 'reactstrap'
import { Facebook, Instagram, Twitter } from './../../../influencers/Common/socialButtons'
import request from '../../../../helpers/request'
import useLocalStorageUser from '../../../../hooks/useLocalStorageUser'
import SpinnerLoader from '../../../../components/@vuexy/spinner/Loading-spinner'
import { startCase } from 'lodash'
import { toast } from 'react-toastify'
import { getAxiosErrors } from '../../../../helpers/utils'

export default function SocialConnector () {
  const [connectingPlatform, setConnecting] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [socialAccounts, setSocialAccounts] = React.useState([])
  const { item } = useLocalStorageUser()
  const onComplete = async payload => {
    try {
      setConnecting(payload.platform)
      const { data } = await request.post(
        '/api/brands/social-accounts',
        payload,
      )
      setConnecting('')
      setSocialAccounts([...socialAccounts, data])
    } catch (error) {
      setConnecting('')
      const err = getAxiosErrors(error)
      toast.error(err)
    }
  }

  React.useEffect(() => {
    fetchSocialAccounts()
  }, [])

  const fetchSocialAccounts = () =>
    request.get('/api/brands/social-accounts').then(response => {
      setSocialAccounts(response.data)
      setLoading(false)
    })

  const isPlatformAdded = platform => {
    return socialAccounts.find(account => account.platform === platform)
  }

  const deleteAccount = async id => {
    await request
      .delete(`/api/brands/social-accounts/${id}`)
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
                  <p className='text-bold-500'>{account?.external_page_name || account?.external_name}</p>
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
          <Instagram userId={item.id} />
        )}

        {isPlatformAdded('facebook') ? null : (
          <Facebook onComplete={onComplete} isPageNeeded />
        )}
      </div>
    </React.Fragment>
  )
}
