import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Button,
  CustomInput,
  Spinner
} from 'reactstrap'
import Checkbox from '../../../components/@vuexy/checkbox/CheckboxesVuexy'
import { Check } from 'react-feather'
import { history } from '../../../history'
import InputMask from 'react-input-mask'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import request from '../../../helpers/request'
import registerImg from '../../../assets/img/pages/register.png'
import authLogo from '../../../assets/img/logo/logo-full.png'
import { toast } from 'react-toastify'
import { getAxiosErrors } from '../../../helpers/utils'
import uniq from 'lodash/uniq'
import VerifyOtpModal from './VerifyOtpModal'

const countries = require('../../../assets/country_data.json')

export default function RegisterBrand (props) {
  const [formFields, setFormFields] = useState({})
  const [isCreating, setIsCreating] = useState(false)
  const [userId, setUserId] = useState()

  const updateFormFields = (name, value) =>
    setFormFields({ ...formFields, [name]: value })

  const onSubmit = async e => {
    e.preventDefault()
    setIsCreating(true)
    try {
      const { data } = await request.post('/auth/register', {
        ...formFields,
        role: 'brand'
      })
      setIsCreating(false)
      setUserId(data?.id)
    } catch (error) {
      setIsCreating(false)
      const axiosErrors = getAxiosErrors(error)
      const message = uniq(axiosErrors?.map(err => err.message)).join('\n')
      toast.error(message)
    }
  }

  const redirectAfterOtp = roleName => {
    window.location.href = `/${roleName}/setup`
  }

  return (
    <Row className='m-0 justify-content-center'>
      {userId && <VerifyOtpModal redirect={redirectAfterOtp} userId={userId} />}
      <Col
        sm='8'
        xl='9'
        lg='10'
        md='8'
        className='d-flex justify-content-center'
      >
        <Card className='bg-authentication rounded-0 mb-0 w-100 blue-background'>
          <Row className='m-0'>
            <Col
              lg='6'
              className='d-lg-block d-none text-center align-self-center px-0 py-0'
            >
              <img className='mr-1' src={registerImg} alt='registerImg' />
            </Col>
            <Col lg='6' md='12' className='p-0'>
              <Card className='rounded-0 mb-0 p-2'>
                <CardHeader className='pb-1 pt-50'>
                  <CardTitle>
                    <h4>
                      <img
                        src={authLogo}
                        className='mb-0 auth-brand-logo'
                        alt='logo'
                      />
                      Create Account
                    </h4>
                  </CardTitle>
                </CardHeader>
                <p className='px-2 auth-title mb-0'>
                  Fill the below form to create a new account.
                </p>
                <CardBody className='pt-1 pb-50'>
                  <Form onSubmit={onSubmit}>
                    <Row>
                      <Col lg={6}>
                        <span>Business Name</span>
                        <FormGroup className='form-label-group'>
                          <Input
                            type='text'
                            placeholder='Business Name'
                            required
                            onChange={e =>
                              updateFormFields('business_name', e.target.value)
                            }
                          />
                        </FormGroup>
                      </Col>
                      <Col lg={6}>
                        <span>Representative Name</span>
                        <FormGroup className='form-label-group'>
                          <Input
                            type='text'
                            placeholder='Representative Name'
                            required
                            onChange={e =>
                              updateFormFields(
                                'representative_name',
                                e.target.value
                              )
                            }
                          />
                        </FormGroup>
                      </Col>

                      <Col lg={6}>
                        <FormGroup className='form-group'>
                          <Label>Email</Label>
                          <Input
                            type='email'
                            placeholder='Email'
                            required
                            onChange={e =>
                              updateFormFields('email', e.target.value)
                            }
                          />
                        </FormGroup>
                      </Col>

                      <Col lg={6}>
                        <FormGroup className='form-group'>
                          <Label>Phone Number</Label>
                          <InputMask
                            className='form-control'
                            mask='+233 999 999 999'
                            placeholder='Enter Phone Number'
                            required
                            onChange={e =>
                              updateFormFields(
                                'phone_number',
                                e.target.value.replace(/\s/gi, '')
                              )
                            }
                            maskChar={null}
                          />
                        </FormGroup>
                      </Col>

                      <Col lg={6}>
                        <FormGroup className='form-label-group'>
                          <span>Country</span>
                          <CustomInput
                            type='select'
                            name='select'
                            required
                            id='customSelect'
                            placeholder='Country'
                            onChange={e =>
                              updateFormFields('country', e.target.value)
                            }
                          >
                            <option></option>
                            {countries.map(country => {
                              return (
                                <option
                                  key={country.name}
                                  value={country.value.toLowerCase()}
                                >
                                  {country.name}
                                </option>
                              )
                            })}
                          </CustomInput>
                        </FormGroup>
                      </Col>

                      <Col lg={6}>
                        <FormGroup className='form-label-group'>
                          <span>City</span>
                          <GooglePlacesAutocomplete
                            selectProps={{
                              onChange: e => updateFormFields('city', e.label)
                            }}
                            autocompletionRequest={{
                              componentRestrictions: {
                                country: countries.find(
                                  country =>
                                    country.value === formFields?.country
                                )?.code
                              },
                              types: ['(regions)']
                            }}
                          />
                        </FormGroup>
                      </Col>

                      <Col lg={6}>
                        <span>Offering</span>
                        <FormGroup className='form-label-group'>
                          <Input
                            type='select'
                            placeholder='Offering'
                            required
                            onChange={e =>
                              updateFormFields('offering', e.target.value)
                            }
                          >
                            <option></option>
                            <option value='service_based'>Service Based</option>
                            <option value='physical_product'>
                              Product Based
                            </option>
                          </Input>
                        </FormGroup>
                      </Col>
                      <Col lg={6}>
                        <Label>Password</Label>
                        <FormGroup className='form-group'>
                          <Input
                            type='password'
                            placeholder='Password'
                            required
                            onChange={e =>
                              updateFormFields('password', e.target.value)
                            }
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <FormGroup>
                      <Checkbox
                        color='primary'
                        icon={<Check className='vx-icon' size={16} />}
                        label=' I accept the terms & conditions.'
                        defaultChecked={true}
                        required
                      />
                    </FormGroup>
                    <div className='d-flex justify-content-between'>
                      <span
                        className='d-flex float-left  purple-text'
                        style={{ cursor: 'pointer' }}
                        color='primary'
                        onClick={e => history.push('/login')}
                      >
                        Login: I already have an account.
                      </span>
                      <Button.Ripple
                        disabled={isCreating}
                        color='primary'
                        type='submit'
                      >
                        {isCreating ? (
                          <>
                            <Spinner color='white' size='sm' />
                            <span className='ml-50'>Processing...</span>
                          </>
                        ) : (
                          'Register'
                        )}
                      </Button.Ripple>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  )
}
