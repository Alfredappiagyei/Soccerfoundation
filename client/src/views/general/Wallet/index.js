import React from 'react'
import { ChevronDown, DollarSign, MoreVertical } from 'react-feather'
import {
  Button,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  UncontrolledButtonDropdown,
  Spinner as RSpinner
} from 'reactstrap'
import StatisticsCard from '../../../components/@vuexy/statisticsCard/StatisticsCard'
import Transactions from './Transactions'
import useQuery from '../../../hooks/useQuery'
import useMutation from '../../../hooks/useMutation'
import Spinner from '../../../components/@vuexy/spinner/Loading-spinner'
import TransferModal from './Transfer'
import AvForm from 'availity-reactstrap-validation/lib/AvForm'
import AvInput from 'availity-reactstrap-validation/lib/AvInput'
import AvGroup from 'availity-reactstrap-validation/lib/AvGroup'
import AvFeedback from 'availity-reactstrap-validation/lib/AvFeedback'
import countryToProviderCountry from './constants'
import { upperCase } from 'lodash'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'

export default function Wallet (props) {
  const [showTopupModal, setShowTopupModal] = React.useState(false)
  const [showTransferModal, setShowTransferModal] = React.useState(false)
  const [showProgressing, setShowProgressing] = React.useState(false)

  const roleAsPath = `${props.user?.role?.name}s`

  const { data: wallet, loading, updateData: updateWallet } = useQuery({
    endpointPath: `/api/${roleAsPath}/wallets`
  })
  const { makeRequest } = useMutation({
    endpointPath: `/api/${roleAsPath}/wallets/topup`
  })
  const {
    data: transactions = {
      data: [],
      meta: {}
    },
    loading: loadingTransactions,
    loadMore,
    refetch,
    updateData
  } = useQuery({
    endpointPath: `api/${roleAsPath}/transactions`
  })

  const countryUpperCase = upperCase(props.user?.country)

  const updateTransactions = transaction=> updateData({
    ...transactions,
    data: [transaction, ...transactions.data]
  })

  const providerCountry =
    countryToProviderCountry.countryToProviderCountry[
      countryUpperCase ||
        countryToProviderCountry.countryToProviderCountry.GHANA
    ]?.NAME

  const requestTopup = amount => {
    toggleToupModal()
    const FlutterwaveCheckout = window.FlutterwaveCheckout
    const x = FlutterwaveCheckout({
      public_key: process.env.REACT_APP_PAYMENT_PUBLIC_KEY,
      tx_ref: `hooli-${Math.random() * 10}`,
      amount,
      currency: wallet.currency,
      country: providerCountry,
      payment_options:
        'card, mobilemoneyghana,account,mpesa,mobilemoneyrwanda,mobilemoneyzambia,mobilemoneytanzania',
      meta: {
        user_id: props.user.id
      },
      customer: {
        email: props.user.email,
        phone_number: props.user.phone_number,
        name: props.user.business_name
      },
      callback: async function (data) {
        setShowProgressing(true)
        const { wallet, transaction } = await makeRequest({
          amount: data.amount,
          external_transaction_id: data.transaction_id,
          currency: data.currency,
          provider: 'flutterwave'
        })
        setShowProgressing(false)
        toast.success('Transaction Completed successfully')
        updateWallet(wallet)
        updateTransactions(transaction)
        x.close()
      },
      onclose: function (data) {},
      customizations: {
        title: props.user.business_name,
        description: `Topup your useripple Account`,
        logo: 'https://useripple.com//assets/images/home/logo.png'
      }
    })
  }

  const toggleToupModal = () => setShowTopupModal(!showTopupModal)
  const toggleTransferModal = () => setShowTransferModal(!showTransferModal)

  if (loading) return <Spinner />
  return (
    <Row>
      <SweetAlert
        title={'Progressing payment...'}
        show={showProgressing}
        onConfirm={() => setShowProgressing(false)}
        confirmBtnText='Close'
        showConfirm={false}
      >
        <p className='sweet-alert-text'>
          <RSpinner color='primary' />
        </p>
      </SweetAlert>
      {showTransferModal && (
        <TransferModal updateTransactions={updateTransactions} toggleTransferModal={toggleTransferModal} country={countryUpperCase} currency={wallet?.currency} />
      )}
      {showTopupModal && (
        <ShowTopUpModal toggle={toggleToupModal} onComplete={requestTopup} />
      )}
      <Col lg={4} xs={12}>
        <StatisticsCard 
          hideChart
          iconRight
          iconBg='primary'
          icon={<DollarSign className='primary' size={22} />}
          stat={`${wallet?.balance} ${wallet?.currency}`}
          statTitle='Available'
          header='Useripple Balance'
          actions={
            <>
            {props.allowTop ?  <UncontrolledButtonDropdown>
                <DropdownToggle tag='div' color='primary' size='lg' caret>
                  <MoreVertical className='collapse-icon' size={15} />
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem tag='a' onClick={toggleToupModal}>
                    Topup
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledButtonDropdown>: null}
            </>
          }
          buttonAction={
            <Button.Ripple color='primary' disabled={parseFloat(wallet.balance) <= 0} onClick={toggleTransferModal}>
              Transfer Funds
            </Button.Ripple>
          }
        />
      </Col>

      <Col lg={8} xs={12}>
        <Transactions
          transactions={transactions}
          loading={loadingTransactions}
          loadMore={loadMore}
          refetch={refetch}
          showCampaignInfluencer={props.showCampaignInfluencer}
        />
      </Col>
    </Row>
  )
}

const ShowTopUpModal = ({ toggle, onComplete }) => (
  <Modal isOpen toggle={toggle}>
    <ModalHeader toggle={toggle}>Topup Ripple Account</ModalHeader>
    <ModalBody>
      <AvForm
        onSubmit={(e, errors, values) => {
          if (errors.length) return
          onComplete(values.amount)
        }}
      >
        <AvGroup>
          <AvInput
            type='number'
            required
            name='amount'
            placeholder='Enter amount '
          />
          <AvFeedback>Enter amount</AvFeedback>
        </AvGroup>
        <Button color='primary'>Request Topup</Button>
      </AvForm>
    </ModalBody>
  </Modal>
)
