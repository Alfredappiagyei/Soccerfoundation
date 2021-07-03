import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Row,
  Col,
  FormGroup,
  Form,
  Input,
  Button,
  Label,
  Spinner
} from 'reactstrap'
import fgImg from '../../../assets/img/pages/forgot-password.png'
import authLogo from '../../../assets/img/logo/logo-full.png'
import { history } from '../../../history'
import '../../../assets/scss/pages/authentication.scss'
import request from '../../../helpers/request'

export default function RequestPasswordRequest () {
  const [email, setEmail] = useState()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const onSubmit = e => {
    e.preventDefault()
    setLoading(true)
    return request
      .post('/auth/forgot-password', {
        email
      })
      .finally(() => {
        setEmailSent(true)
        setLoading(false)
      })
  }
  return (
    <Row className='m-0 justify-content-center'>
      <Col
        sm='8'
        xl='7'
        lg='10'
        md='8'
        className='d-flex justify-content-center'
      >
        <Card className='bg-authentication rounded-0 mb-0 w-100 white-background'>
          <Row className='m-0'>
            <Col
              lg='6'
              className='d-lg-block d-none text-center align-self-center'
            >
              <img src={fgImg} alt='fgImg' />
            </Col>
            <Col lg='6' md='12' className='p-0'>
              <Card className='rounded-0 mb-0 px-2 py-1'>
                <CardHeader className='pb-1'>
                  <CardTitle>
                    <img src={authLogo} className="auth-brand-logo" alt="logo"/>
                    <h4 className='mb-0'>

                      {emailSent
                        ? 'Recovery instructions Sent'
                        : 'Recover your password'}
                    </h4>
                  </CardTitle>
                </CardHeader>
                <p
                  className='px-2 auth-title'
                  style={{
                    marginBottom: emailSent ? 120 : 0,
                    marginTop: emailSent ? 50 : 0,
                    alignItems: 'center'
                  }}
                >
                  {emailSent
                    ? 'If the email you entered is correct, a verification link has been sent to your email. Please follow the instructions to reset your password'
                    : "Please enter your email address and we'll send you instructions on how to reset your password."}
                </p>
                {emailSent ? null : (
                  <CardBody className='pt-1 pb-0'>
                    <Form onSubmit={onSubmit}>
                      <FormGroup className='form-label-group'>
                        <Input
                          type='email'
                          placeholder='Email'
                          required
                          onChange={e => setEmail(e.target.value)}
                        />
                        <Label>Email</Label>
                      </FormGroup>
                      <div className='float-md-left d-block mb-1'>
                        <Button.Ripple
                          color='primary'
                          outline
                          className='px-75 btn-block'
                          onClick={() => history.push('/login')}
                        >
                          Back to Login
                        </Button.Ripple>
                      </div>
                      <div className='float-md-right d-block mb-1'>
                        <Button.Ripple
                          disabled={loading}
                          color='primary'
                          type='submit'
                          className='px-75 btn-block'
                        >
                          {loading ? <Spinner size='sm' /> : 'Recover Password'}
                        </Button.Ripple>
                      </div>
                    </Form>
                  </CardBody>
                )}
              </Card>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  )
}
