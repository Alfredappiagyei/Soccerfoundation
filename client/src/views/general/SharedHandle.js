import React from 'react'
import { Col, Row } from 'reactstrap'
import useQuery from '../../hooks/useQuery'
import Spinner from '../../components/@vuexy/spinner/Loading-spinner'
import SocialStats from '../influencers/SocialStats'
import Empty from '../../components/Empty'
import UserNotFoundImage from '../../assets/img/error_user.png'
import '../../assets/scss/pages/authentication.scss'


export default function SharedHandle ({ location, match }) {
  const { data={}, loading, error: errors } = useQuery({
    endpointPath: '/api/influencers/shared',
    initQuery: {
      handle: match?.params?.handle
    }
  })


  const error = Array.isArray(errors)
    ? errors.map(err => err?.message).join('\n')
    : errors


    if (loading) return <Spinner />

  return (
    // <FullpageLayout>
      <Row className='m-0 justify-content-center'>
        <Col
          sm='10'
          xl='10'
          lg='10'
          md='10'
          className='d-flex justify-content-center'
        >
          {error ? <Empty content={<h3> {error} </h3> } url={UserNotFoundImage} imgWidth={400} /> : (
              <div className='mt-5'>
                  <SocialStats isShared existingSocialAccounts={data.social_accounts} user={data?.user} />
              </div>
          )}
        </Col>
      </Row>
    // </FullpageLayout>
  )
}
