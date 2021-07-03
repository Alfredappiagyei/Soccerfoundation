import React from 'react'
import { Card, CardHeader, CardTitle, CardBody, Row, Col } from 'reactstrap'
import '../../../assets/scss/pages/authentication.scss'
import Wizard from '../../../components/@vuexy/wizard/WizardComponent'
import { Home, Briefcase } from 'react-feather'
import SocialConnector from '../Common/SocialConnector'
import MiniAbout from './About'
import request from '../../../helpers/request'
import Tracker from './Tracker'
import { history } from '../../../history'

export default function Setup (props) {
  const [activeStep] = React.useState(0)
  const defautInterests = (props?.user?.interests || [])?.map(
    userInterest => userInterest.interest_id
  )
  const [interests, setInterests] = React.useState(defautInterests)

  React.useEffect(() => {
    if (props.user.status === 'active') {
      history.push('/brands')
    }
  }, [])

  const updateProfile = async (_, forms) => {
    try {
      await request.patch('/api/brands/me', {
        interests,
        ...forms
      })
    } catch (error) {
      console.log(error)
      // const axiosErrors = getAxiosErrors(error)
      // const message = uniq(axiosErrors?.map(err => err.message)).join('\n')
      // toast.error(message)
    }
  }

  const onComplete = async () => {
    await request.post(
      '/api/brands/complete_setup',
      {}
    )
    window.location.reload()
  }

  return (
    <Row className='m-0 justify-content-center'>
      <Col sm={8}>
        <Card className='rounded-0 mb-0 px-2 py-1'>
          <CardHeader className='pb-1'>
            <CardTitle>
              <h4 className='mb-0'>Complete Setup</h4>
            </CardTitle>
          </CardHeader>
          <p className='px-2 auth-title'>Let setup your account</p>
          <CardBody className='pt-1 pb-0'>
            <Wizard
              activeStep={activeStep}
              steps={[
                {
                  content: (
                    <MiniAbout
                      {...props}
                      interests={interests}
                      setInterests={setInterests}
                    />
                  ),
                  title: <Home size={20} />
                },
                {
                  content: <SocialConnector {...props} />,
                  title: <Briefcase size={20} />
                }
              ]}
              finishBtnText='Finish'
              onFinish={() => {
                onComplete()
              }}
              onNext={updateProfile}
              disableNextButton={props.user.status === 'submitted'}
              validate
            ></Wizard>
          </CardBody>
        </Card>
      </Col>

      <Col xs={4}>
        <Tracker user={props.user} />
      </Col>
    </Row>
  )
}
