import React from 'react'
import {
  Button,
  FormGroup,
  Row,
  Col,
  Spinner,
  Toast,
  ToastHeader,
  ToastBody
} from 'reactstrap'
import { Formik, Field, Form } from 'formik'
import * as Yup from 'yup'
import useMutation from '../../../hooks/useMutation'
import { toast } from 'react-toastify'

const formSchema = Yup.object().shape({
  old_password: Yup.string().required('Required'),
  password: Yup.string().required('Required'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required')
})

export default function ChangePassword () {
  const { loading, data, makeRequest, error } = useMutation({
    endpointPath: '/api/influencers/me'
  })

  React.useEffect(() => {
    showError()
  }, [error])

  const showError = () => {
    if (!error) return
    const errMessage = Array.isArray(error)
      ? error.map(error => error?.message)
      : error?.message ?? error
    toast.error(errMessage)
  }

  return (
    <React.Fragment>
      {data && (
        <Toast>
          <ToastHeader icon='success'>Password Change</ToastHeader>
          <ToastBody>Your password has been changed successfully</ToastBody>
        </Toast>
      )}
      <Row className='pt-1'>
        <Col sm='12'>
          <Formik
            initialValues={{
              old_password: '',
              password: '',
              password_confirmation: ''
            }}
            validationSchema={formSchema}
          >
            {({ errors, touched, values }) => (
              <Form
                onSubmit={e => {
                  e.preventDefault()
                  makeRequest(values)
                }}
              >
                <FormGroup>
                  <Field
                    name='old_password'
                    id='old_password'
                    className={`form-control ${errors.old_password &&
                      touched.old_password &&
                      'is-invalid'}`}
                    placeholder='Old Password'
                    required
                  />
                  {errors.old_password && touched.old_password ? (
                    <div className='text-danger'>{errors.old_password}</div>
                  ) : null}
                </FormGroup>
                <FormGroup>
                  <Field
                    name='password'
                    placeholder='New Password'
                    id='password'
                    className={`form-control ${errors.password &&
                      touched.password &&
                      'is-invalid'}`}
                    required
                  />
                  {errors.password && touched.password ? (
                    <div className='text-danger'>{errors.password}</div>
                  ) : null}
                </FormGroup>
                <FormGroup>
                  <Field
                    name='password_confirmation'
                    id='password_confirmation'
                    className={`form-control ${errors.password_confirmation &&
                      touched.password_confirmation &&
                      'is-invalid'}`}
                    placeholder='Confirm Password'
                  />
                  {errors.password_confirmation &&
                  touched.password_confirmation ? (
                    <div className='text-danger'>
                      {errors.password_confirmation}
                    </div>
                  ) : null}
                </FormGroup>
                <div className='d-flex justify-content-start flex-wrap'>
                  <Button.Ripple
                    disabled={loading}
                    className='mr-50'
                    type='submit'
                    color='primary'
                  >
                    {loading ? <Spinner size='sm' /> : 'Update password'}
                  </Button.Ripple>
                </div>
              </Form>
            )}
          </Formik>
        </Col>
      </Row>
    </React.Fragment>
  )
}
