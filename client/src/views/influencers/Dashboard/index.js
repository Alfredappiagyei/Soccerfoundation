import React from 'react'
import { Row, Col } from 'reactstrap'
import Sticky from 'react-sticky-el'
import About from './About'
import Myworth from './Myworth'
import Feed from './Feed'
import Barter from './Barter'
import SocialAccountList from './SocialAccountList'
import useQuery from '../../../hooks/useQuery'
import SpinnerLoader from '../../../components/@vuexy/spinner/Loading-spinner'
import '../../../assets/scss/pages/users-profile.scss'


export default function InfluencerDashboard (props) {
  const { loading, data: socialAccounts = [] } = useQuery({
    endpointPath: '/api/influencers/social-accounts'
  })
  if(loading) return <SpinnerLoader />
  return (
    <React.Fragment>
      <div id='user-profile'>
        <div id='profile-info'>
          <Row>
            <Col lg='3' md='12'>
              <Sticky>
                <About socialAccounts={socialAccounts} {...props} />
                <Myworth socialAccounts={socialAccounts}  />
              </Sticky>
            </Col>
            <Col lg='6' md='12'>
              <Feed {...props}/>
            </Col>
            <Col lg='3' md='12'>
              <Sticky>
                <Barter  />
                <SocialAccountList socialAccounts={socialAccounts} />
              </Sticky>
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  )
}
