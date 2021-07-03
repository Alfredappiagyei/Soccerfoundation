import React from 'react'
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner
} from 'reactstrap'
import { AvForm, AvGroup, AvInput } from 'availity-reactstrap-validation'
import InputMask from 'react-input-mask'
import constants from './constants'
import useMutation from '../../../hooks/useMutation'
import { toast } from 'react-toastify'

export default function TransferModal ({
  toggleTransferModal,
  country,
  currency,
  updateTransactions
}) {
  const [formFields, setFormFields] = React.useState({})
  const paymentNetworks =
    constants.countryToProviderCountry[country]?.TRANSFER?.MOBILE_MONEY_LIST ||
    []
  const { error, makeRequest, loading } = useMutation({
    endpointPath: '/api/brands/wallets/transfer'
  })

  React.useEffect(() => {
    if (!error) return
    toast.error(error)
  }, [error])

  const updateFormFields = (field, value) =>
    setFormFields({ ...formFields, [field]: value })

  return (
    <Modal isOpen size='lg' toggle={toggleTransferModal}>
      <ModalHeader toggle={toggleTransferModal}>Transfer Funds</ModalHeader>
      <ModalBody>
        <AvForm
          onSubmit={async (e, errors, values) => {
            if (errors.length) return
            const payload = {
              ...values,
              ...formFields,
              currency,
              provider: 'flutterwave'
            }
            const { data } = await makeRequest(payload)
            updateTransactions(data)
            toast.success("Transfer queued successfully")
            toggleTransferModal()
          }}
        >
          <AvGroup>
            <Label>Amount</Label>
            <AvInput
              name='amount'
              type='number'
              required
              placeholder='Enter amount to withdrawal'
            />
          </AvGroup>
          <AvGroup>
            <Label>Select Network</Label>
            <AvInput
              name='network'
              required
              type='select'
              placeholder='Select Network'
            >
              <option></option>
              {paymentNetworks.map(network => (
                <option value={network} key={network}>
                  {network}
                </option>
              ))}
            </AvInput>
          </AvGroup>

          <AvGroup>
            <Label>Receipent Phone Number</Label>
            <InputMask
              id='phone_number'
              className='form-control'
              mask='+233 999 999 999'
              placeholder='Enter Phone Number'
              required
              maskChar={null}
              onChange={e =>
                updateFormFields(
                  'phone_number',
                  e.target.value.replace(/\s/gi, '')
                )
              }
            />
          </AvGroup>
          <Button.Ripple color='primary' disabled={loading}>
            {loading ? <Spinner /> : 'Request'}
          </Button.Ripple>
        </AvForm>
      </ModalBody>
    </Modal>
  )
}
