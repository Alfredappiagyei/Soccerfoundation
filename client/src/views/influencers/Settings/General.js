import React, { useState } from 'react'
import {
  Button,
  Media,
  Input,
  Label,
  Row,
  Col,
  Spinner as RSpinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Toast,
  ToastHeader,
  ToastBody
} from 'reactstrap'
import img from '../../../assets/img/portrait/small/avatar-s-11.jpg'
import {
  AvInput,
  AvGroup,
  AvFeedback,
  AvForm
} from 'availity-reactstrap-validation'
import InputMask from 'react-input-mask'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import Spinner from '../../../components/@vuexy/spinner/Loading-spinner'
import request from '../../../helpers/request'
import InterestSelector from '../Setup/InterestSelector'
import { getAxiosErrors } from '../../../helpers/utils'
import { startCase, uniq } from 'lodash'
import { toast } from 'react-toastify'
import useFileUploader from '../../../hooks/useFileUploader'
import Flatpickr from 'react-flatpickr'
import moment from 'moment'
import useMutation from '../../../hooks/useMutation'
import 'flatpickr/dist/themes/light.css'
import '../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss'
const countries = require('../../../assets/country_data.json')

export default function General () {
  const [formFields, setFormFields] = useState({})
  const [loading, setLoading] = useState(true)
  const [interests, setInterests] = useState([])
  const [updating, setUpdating] = useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const [
    changeEmailOrPhoneNumberType,
    setChangeEmailOrPhoneNumberType
  ] = React.useState('email')

  const onComplete = async file => {
    await updateProfile({
      profile_url: file
    })
    getProfile()
  }

  React.useEffect(() => {
    getProfile()
  }, [])

  const { onUpload } = useFileUploader({
    folder: 'profile',
    onComplete: onComplete
  })

  const toggleModal = () => {
    setShowModal(!showModal)
    getProfile()
  }

  const getProfile = () =>
    request
      .get('/api/influencers/me')
      .then(({ data }) => {
        setFormFields(data)
        setInterests(data.interests.map(interest => interest.interest_id))
      })
      .finally(() => setLoading(false))

  const updateProfile = async values => {
    setUpdating(true)
    try {
      await request.patch('/api/influencers/me', values)
      toast.success('Profile updated successfully')
      setUpdating(false)
    } catch (error) {
      const axiosErrors = getAxiosErrors(error)
      const message = uniq(axiosErrors?.map(err => err.message)).join('\n')
      toast.error(message)
      setUpdating(false)
    }
  }

  const updateFormFields = (name, value) =>
    setFormFields({ ...formFields, [name]: value })

  if (loading) return <Spinner />
  return (
    <React.Fragment>
      <Media>
        <Media className='mr-1' left href='#'>
          <Media
            className='rounded-circle'
            object
            src={formFields.profile_url || img}
            alt='User'
            height='64'
            width='64'
          />
        </Media>
        <Media className='mt-25' body>
          <div className='d-flex flex-sm-row flex-column justify-content-start px-0'>
            <Button.Ripple
              tag='label'
              className='mr-50 cursor-pointer'
              color='primary'
              outline
            >
              Upload Photo
              <Input
                type='file'
                name='file'
                multiple={false}
                accept=''
                id='uploadImg'
                hidden
                onChange={e => onUpload(e.target.files[0])}
              />
            </Button.Ripple>
          </div>
          <p className='text-muted mt-50'>
            <small>Allowed JPG, GIF or PNG. Max size of 800kB</small>
          </p>
        </Media>
      </Media>
      <AvForm
        className='mt-2'
        onSubmit={(e, errors, values) => {
          if (errors.length) return
          return updateProfile({
            city: formFields.city,
            interests,
            date_of_birth: Array.isArray(formFields.date_of_birth)
              ? formFields.date_of_birth[0]
              : formFields.date_of_birth,
            ...values
          })
        }}
      >
        <Row>
          <Col md='6' sm='12'>
            <AvGroup>
              <Label for='first_name'> First Name </Label>
              <AvInput
                id='first_name'
                name='first_name'
                type='text'
                required
                value={formFields.first_name}
              />
              <AvFeedback>Please enter valid first name</AvFeedback>
            </AvGroup>
          </Col>
          <Col md='6' sm='12'>
            <AvGroup>
              <Label for='last_name'> Last Name </Label>
              <AvInput
                id='last_name'
                name='last_name'
                type='text'
                required
                value={formFields.last_name}
              />
              <AvFeedback>Please enter valid last name</AvFeedback>
            </AvGroup>
          </Col>
          <Col md='6' sm='12'>
            <AvGroup>
              <Label for='email'> Email </Label>
              <div className='d-flex'>
                <AvInput
                  id='email'
                  name='email'
                  type='email'
                  required
                  disabled
                  value={formFields.email}
                />
                <Button
                  type='button'
                  className='mr-1 ml-1'
                  color='flat-primary'
                  onClick={() => {
                    setChangeEmailOrPhoneNumberType('email')
                    toggleModal()
                  }}
                >
                  Edit
                </Button>
              </div>

              <AvFeedback>Please enter valid email</AvFeedback>
            </AvGroup>
          </Col>

          <Col lg={6}>
            <AvGroup>
              <Label for='phone_number'>Phone Number</Label>
              <div className='d-flex'>
                <InputMask
                  id='phone_number'
                  className='form-control'
                  mask='+233 999 999 999'
                  placeholder='Enter Phone Number'
                  required
                  disabled
                  value={formFields.phone_number}
                  maskChar={null}
                  onChange={e =>
                    updateFormFields(
                      'phone_number',
                      e.target.value.replace(/\s/gi, '')
                    )
                  }
                />
                <Button
                  type='button'
                  className='mr-1 ml-1'
                  color='flat-primary'
                  onClick={() => {
                    setChangeEmailOrPhoneNumberType('phone_number')
                    toggleModal()
                  }}
                >
                  Edit
                </Button>
              </div>
            </AvGroup>
          </Col>

          <Col className='mb-3' md='12' sm='12'>
            <Label>Date of Birth</Label>
            <Flatpickr
              className='form-control'
              defaultValue={formFields?.date_of_birth}
              options={{
                altInput: true,
                altFormat: 'F j, Y',
                dateFormat: 'Y-m-d',
                minDate: moment()
                  .subtract(100, 'years')
                  .toDate(),
                maxDate: moment()
                  .subtract(18, 'years')
                  .toDate()
              }}
              onChange={date => updateFormFields('date_of_birth', date)}
            />
          </Col>

          <Col lg={6}>
            <AvGroup>
              <Label for='country'>Country</Label>
              <AvInput
                id='country'
                type='select'
                name='country'
                required
                placeholder='Country'
                value={formFields.country?.toLowerCase()}
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
              </AvInput>
              <AvFeedback>Please select country</AvFeedback>
            </AvGroup>
          </Col>

          <Col lg={6}>
            <AvGroup>
              <span>City</span>
              <GooglePlacesAutocomplete
                required
                selectProps={{
                  onChange: e => updateFormFields('city', e.label),
                  value: { label: formFields.city, value: formFields.city }
                }}
                autocompletionRequest={{
                  componentRestrictions: {
                    country: countries.find(
                      country => country.value === formFields?.country
                    )?.code
                  },
                  types: ['(regions)']
                }}
              />
            </AvGroup>
          </Col>

          <Col md='12' sm='12'>
            <AvGroup>
              <Label for='description'> About Me </Label>
              <AvInput
                id='description'
                name='description'
                type='textarea'
                required
                rows='11'
                cols='50'
                value={formFields.description}
              />
              <AvFeedback>Write short description about your self</AvFeedback>
            </AvGroup>
          </Col>

          <Col md='12' sm='12' className='mb-5'>
            <Label for='description'> Your interests</Label>
            <InterestSelector
              defaultValues={interests}
              showHeader={false}
              onChange={e => setInterests(e)}
            />
          </Col>

          <Col className='d-flex justify-content-start flex-wrap' sm='12'>
            <Button.Ripple
              disabled={updating}
              className='mr-50'
              type='submit'
              color='primary'
            >
              {updating ? <RSpinner size='sm' /> : 'Update Changes'}
            </Button.Ripple>
          </Col>
        </Row>
      </AvForm>
      {showModal && (
        <RequestEmailPhoneNumberChangeModal
          type={changeEmailOrPhoneNumberType}
          toggleModal={toggleModal}
        />
      )}
    </React.Fragment>
  )
}

const RequestEmailPhoneNumberChangeModal = ({
  toggleModal,
  type = 'email'
}) => {
  const [formFields, setFormFields] = React.useState({})
  const { loading, makeRequest, data, error } = useMutation({
    endpointPath: '/api/influencers/me/credentials/change'
  })

  const errorMessage = Array.isArray(error)
    ? error.map(err => err.message).join('\n')
    : error?.message ?? data?.message === 'submit'
    ? 'Credentials changed successfully'
    : error

  const submit = isVerification => (e, errors) => {
    if (errors.length) return
    const payload = {
      ...formFields,
      type: isVerification ? 'submit' : 'request'
    }
    makeRequest(payload)
  }

  const typeComponent = {
    email: (
      <AvGroup>
        <AvInput
          id='newEmail'
          name='email'
          type='email'
          required
          placeholder='Enter new email'
          onChange={e =>
            setFormFields({ ...formFields, email: e.target.value })
          }
        />
        <AvFeedback>Enter Email</AvFeedback>
      </AvGroup>
    ),
    phone_number: (
      <AvGroup>
        <InputMask
          id='phone_number'
          className='form-control'
          mask='+233 999 999 999'
          placeholder='Enter Phone Number'
          required
          maskChar={null}
          onChange={e =>
            setFormFields({ ...formFields, phone_number: e.target.value })
          }
        />
        <AvFeedback>Enter Phone number</AvFeedback>
      </AvGroup>
    )
  }

  const preVerificationCode = (
    <>
      {typeComponent[type]}
      <AvGroup>
        <AvInput
          name='password'
          type='password'
          required
          placeholder='Enter your password'
          onChange={e =>
            setFormFields({ ...formFields, password: e.target.value })
          }
        />
        <AvFeedback>Enter Password</AvFeedback>
      </AvGroup>
    </>
  )

  const confirmation = (
    <AvGroup>
      Please enter the Verification digit sent to your {startCase(type)}{' '}
      <code>{formFields.email || formFields.phone_number}</code>
      <p />
      <AvInput
        name='verification_code'
        required
        type='number'
        placeholder='Enter the verification sent to you'
        onChange={e =>
          setFormFields({ ...formFields, verification_code: e.target.value })
        }
      />
      <AvFeedback>Enter VerificationCode</AvFeedback>
    </AvGroup>
  )

  const isSuccessError = /success/gi.test(errorMessage)

  return (
    <Modal isOpen toggle={toggleModal}>
      <ModalHeader> Change {startCase(type)} </ModalHeader>
      <AvForm onSubmit={submit(!!data)}>
        <ModalBody>
          {' '}
          {errorMessage && (
            <Toast>
              <ToastHeader icon={isSuccessError ? 'success' : 'danger'}>
                {isSuccessError ? 'Credential updated ' : 'An Error Occurred'}
              </ToastHeader>
              <ToastBody>{errorMessage}</ToastBody>
            </Toast>
          )}
          {!data ? preVerificationCode : isSuccessError ? null : confirmation}
        </ModalBody>
        <ModalFooter>
          {!isSuccessError && (
            <Button color='primary' disabled={loading}>
              {loading ? <RSpinner size='sm' /> : 'Request Change'}
            </Button>
          )}
        </ModalFooter>
      </AvForm>
    </Modal>
  )
}
