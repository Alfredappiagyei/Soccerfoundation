import React from 'react'
import {
  Button,
  Card,
  CardBody,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Spinner
} from 'reactstrap'
import { Mail, Lock, Check } from 'react-feather'
import { history } from '../../../history'
import Checkbox from '../../../components/@vuexy/checkbox/CheckboxesVuexy'
import loginImg from '../../../assets/img/pages/login.png'
import authLogo from '../../../assets/img/logo/logo-full.png'
import '../../../assets/scss/pages/authentication.scss'
import request from '../../../helpers/request'
import { uniq } from 'lodash'
import { getAxiosErrors } from '../../../helpers/utils'
import { toast } from 'react-toastify'
import useLocalStorageUser from '../../../hooks/useLocalStorageUser'
import VerifyOtpModal from '../Register/VerifyOtpModal'
import InputMask from 'react-input-mask'
import { isValidNumber } from 'libphonenumber-js'

function Login (props) {
  const [formFields, setFormFields] = React.useState({
    emailOrPhoneNumber: '',
    password: ''
  })
  const [logging, setlogin] = React.useState(false)
  const { item, setItem } = useLocalStorageUser()
  const [userId, setUserId] = React.useState()

  const updateForm = (name, value) =>
    setFormFields({ ...formFields, [name]: value })

  const onLogin = async e => {
    e.preventDefault()
    try {
      setlogin(true)
      const payload = {
        password: formFields.password,
        ...(isValidNumber(formFields.emailOrPhoneNumber)
          ? { phone_number: formFields.emailOrPhoneNumber }
          : { email: formFields.emailOrPhoneNumber })
      }
      const { data } = await request.post('/auth/login', payload)
      setlogin(false)
      if (data.isPhoneNumberVerified) {
        setItem(JSON.stringify(data))
        return redirect(data.role.name)
      }
      setUserId(data.id)
    } catch (error) {
      const axiosErrors = getAxiosErrors(error)
      const message = axiosErrors?.map
        ? uniq(axiosErrors?.map(err => err.message)).join('\n')
        : axiosErrors ?? error.message
      toast.error(message)
      setlogin(false)
    }
  }

  const redirect = roleName => {
    return (window.location.href = `/${roleName}/home`)
  }

  const isNumber = () => {
    const value = formFields.emailOrPhoneNumber
      .replace(/\s/gi, '')
      .replace('+', '')
    return value && Number.isInteger(Number(value))
  }

  return (
    <Row className='m-0 justify-content-center'>
      {userId && <VerifyOtpModal userId={userId} redirect={redirect} />}
      <Col
        sm='8'
        xl='8'
        lg='10'
        md='8'
        className='d-flex justify-content-center'
      >
        <Card className='bg-authentication login-card rounded-0 mb-0 w-100'>
          <Row className='m-0'>
            <Col
              lg='6'
              className='d-lg-block d-none text-center align-self-center px-1 py-0'
            >
              <img src={loginImg} alt='loginImg' />
            </Col>
            <Col lg='6' md='12' className='p-0'>
              <Card className='rounded-0 mb-0 px-2'>
                <CardBody>
                 <h4><img src={authLogo} className="auth-brand-logo" alt="logo"/>Login</h4>
                  <p>Welcome back!</p>
                  <Form onSubmit={onLogin}>
                    {isNumber() ? (
                      <FormGroup className='form-label-group'>
                        <InputMask
                          className='form-control'
                          mask='+233 999 999 999'
                          placeholder='Enter Phone Number or Email'
                          required
                          type='text'
                          maskChar={null}
                          value={formFields.emailOrPhoneNumber}
                          autoFocus
                          onChange={e =>
                            updateForm('emailOrPhoneNumber', e.target.value)
                          }
                        />
                        <Label>Phone Number</Label>
                      </FormGroup>
                    ) : (
                      <FormGroup className='form-label-group position-relative has-icon-left'>
                        <Input
                          type='email'
                          placeholder='Enter Phone Number or Email'
                          required
                          autoFocus
                          onChange={e =>
                            updateForm('emailOrPhoneNumber', e.target.value)
                          }
                          value={formFields.emailOrPhoneNumber}
                        />
                        <div className='form-control-position'>
                          <Mail size={15} />
                        </div>
                        <Label>Email</Label>
                      </FormGroup>
                    )}
                    <FormGroup className='form-label-group position-relative has-icon-left'>
                      <Input
                        type='password'
                        placeholder='Password'
                        required
                        onChange={e => updateForm('password', e.target.value)}
                      />
                      <div className='form-control-position'>
                        <Lock size={15} />
                      </div>
                      <Label>Password</Label>
                    </FormGroup>
                    <FormGroup className='d-flex justify-content-between align-items-center'>
                      <Checkbox
                        color='primary'
                        icon={<Check className='vx-icon' size={16} />}
                        label='Remember me'
                      />
                      <div
                        className='float-right purple-text'
                        style={{ cursor: 'pointer' }}
                        onClick={e => history.push('/forgot-password')}
                      >
                        Forgot Password?
                      </div>
                    </FormGroup>
                    <Button
                      disabled={logging}
                      color='primary'
                      type='submit'
                      className='w-100'
                    >
                      {logging ? (
                        <>
                          <Spinner color='white' size='sm' />
                          <span className='ml-50'>Processing...</span>
                        </>
                      ) : (
                        'Login'
                      )}
                    </Button>
                  </Form>
                </CardBody>
                <div className='auth-footer'>
                  <div className='divider'>
                    <div className='divider-text'>OR</div>
                  </div>
                  <div className='footer-btn'>
                    <Button
                      className='w-100'
                      color='primary'
                      outline
                      type='button'
                      onClick={() => history.push('/register?role=influencer')}
                    >
                      Signup as Influencer 
                    </Button>

                    <Button
                     className='w-100'
                      color='info'
                      outline
                      type='button'
                      onClick={() => history.push('/register?role=brand')}
                    >
                      Signup as Brand
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  )
}
export default Login
