import React from 'react'
import { Card, CardHeader, CardTitle, CardBody, Row, Col } from 'reactstrap'
import '../../../assets/scss/pages/authentication.scss'
import Wizard from '../../../components/@vuexy/wizard/WizardComponent'
import { Home, Briefcase } from 'react-feather'
import InterestSelector from './InterestSelector'
import SocialConnector from '../Common/SocialConnector'
import request from '../../../helpers/request'
import { uniq } from 'lodash'
import { getAxiosErrors } from '../../../helpers/utils'
import { toast } from 'react-toastify'
import Tracker from './Tracker'
import { history } from '../../../history'

export default function Setup ({ user }) {
  const [activeStep] = React.useState(0)
  const defautInterests = (user?.interests || [])?.map(
    userInterest => userInterest.interest_id
  )
  const [interests, setInterests] = React.useState(defautInterests)

  console.log(interests);

  React.useEffect(() => {
    if (user.status === 'active') {
      history.push('/influencer')
    }
  }, [])

  const updateProfile = async () => {
    try {
      await request.patch('/api/influencers/me', {
        interests
      })
    } catch (error) {
      const axiosErrors = getAxiosErrors(error)
      const message = uniq(axiosErrors?.map(err => err.message)).join('\n')
      toast.error(message)
    }
  }

  const onComplete = async () => {
    await request.post('/api/influencers/complete_setup', {})
    window.location.reload()
  }

  return (
    <Row className='m-0 justify-content-center'>
      <Col sm={8}>
        <Card className='rounded-0 mb-0 px-2 py-1'>
          <CardHeader className='pb-1'>
            <CardTitle>
              <h4 className='mb-0'>A few steps to complete your setup</h4>
            </CardTitle>
          </CardHeader>
          <CardBody className='pt-1 pb-0'>
            <Wizard
              activeStep={activeStep}
              steps={[
                {
                  content: (
                    <InterestSelector
                     onChange={setInterests}
                      defaultValues={defautInterests}
                    />
                  ),
                  title: <Home size={20} />
                },
                {
                  content: <SocialConnector role={user?.Role?.name} />,
                  title: <Briefcase size={20} />
                }
              ]}
              finishBtnText='Finish'
              onFinish={() => {
                onComplete()
              }}
              onNext={updateProfile}
              disableNextButton={user.status === 'submitted'}
            ></Wizard>
          </CardBody>
        </Card>
      </Col>

      <Col xs={4}>
        <Tracker user={user} />
      </Col>
    </Row>
  )
}
