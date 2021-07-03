import React from 'react'
import { toast } from 'react-toastify'
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner
} from 'reactstrap'
import useLocalStorageUser from '../../../hooks/useLocalStorageUser'
import useMutation from '../../../hooks/useMutation'

export default function VerifyOtpModal ({ userId, redirect }) {
  const [verificationCode, setVerificationCode] = React.useState()
  const { item, setItem } = useLocalStorageUser()
  const { loading, makeRequest } = useMutation({
    endpointPath: '/auth/verify_otp'
  })

  const { loading: loadingResetOtp, makeRequest: resetOtp } = useMutation({
    endpointPath: '/auth/resend_otp'
  })

  const onSubmit = e => {
    e.preventDefault()
    return makeRequest({
      otp: verificationCode,
      user_id: userId
    })
      .then((data) => {
        setItem(JSON.stringify(data))
        redirect && redirect(data.role.name)
      })
      .catch(error => {
        toast.error(error?.message ?? error)
      })
  }

  return (
    <Modal isOpen>
      <ModalHeader>Verify Phone Number </ModalHeader>
      <ModalBody>
        Complete Phone Number Verification
        <Form onSubmit={onSubmit} className='mt-3'>
          <FormGroup className='form-label-group'>
            <Input
              type='number'
              placeholder='Verification Code'
              required
              onChange={e => setVerificationCode(e.target.value)}
            />
            <Label>Verification Code</Label>
          </FormGroup>
          <div className='d-flex'>
            <Button className='w-100 mr-2' disabled={loading} color='primary'>
              {loading ? (
                <>
                  <Spinner color='white' size='sm' />
                  <span className='ml-50'>Processing...</span>{' '}
                </>
              ) : (
                'Verify'
              )}
            </Button>
            <Button
              disabled={loadingResetOtp}
              color='info'
              type='button'
              onClick={async () => {
                await resetOtp({
                  user_id: userId
                })
                toast.success('New Otp sent')
              }}
            >
              {loadingResetOtp ? (
                <>
                  <Spinner color='white' size='sm' />
                  <span className='ml-50'>Processing...</span>{' '}
                </>
              ) : (
                ' Resend Otp'
              )}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  )
}
