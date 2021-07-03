import React from 'react'
import {
  Badge,
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner
} from 'reactstrap'
import Feed from '../../../../components/Feed'
import useMutation from '../../../../hooks/useMutation'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { ArrowLeft, DollarSign } from 'react-feather'
import { AvForm, AvGroup, AvInput } from 'availity-reactstrap-validation'
import { toast } from 'react-toastify'
import { startCase } from 'lodash'

export default function InfluencerDeliverable (props) {
  const [showModal, setShowModal] = React.useState(false)
  const toggleModal = () => setShowModal(!showModal)
  const status = props.selectedInfluencer?.influencer?.involvedCampaigns[0]?.status
  return (
    <div
      className={`email-app-details ${props.selectedInfluencer ? 'show' : ''}`}
    >
      <div className='email-detail-header'>
        <div className='email-header-left d-flex align-items-center mb-1'>
          <ArrowLeft
            size={20}
            className='mr-1 cursor-pointer'
            onClick={() => {
              props.setSelectedInfluencer()
            }}
          />
          <h4 className='mb-0'>
            {props.selectedInfluencer?.influencer?.full_name}`s Deliverables   <Badge color={status === 'completed' ? 'success' : 'info'}>
                {startCase(status)}
              </Badge>
          </h4>
        </div>
        <div>
          <Button.Ripple disabled={status === 'completed'} color='primary' onClick={toggleModal}>
            <DollarSign />
            Release funds
          </Button.Ripple>
        </div>
      </div>

      <PerfectScrollbar className='ml-2 mr-2 mt-1'>
        {props.selectedInfluencer?.influencer?.campaignDeliverables?.map(
          feed => (
            <Feed
              feed={feed}
              key={feed.id}
              showPublish={false}
              showSubmit={false}
              showViewFeed={false}
              showStats
            />
          )
        )}
        <div className='mt-5 pt-5' />
      </PerfectScrollbar>
      <PaymentModal
        toggleModal={toggleModal}
        selectedInfluencer={props.selectedInfluencer}
        showModal={showModal}
        singleCampaign={props.singleCampaign}
      />
    </div>
  )
}

const PaymentModal = ({
  showModal,
  toggleModal,
  selectedInfluencer,
  singleCampaign
}) => {
  const { makeRequest, loading } = useMutation({
    endpointPath: '/api/admin/wallets/payout'
  })
  const involvedCampaign = selectedInfluencer?.influencer?.involvedCampaigns[0]
  const defaultAmount = involvedCampaign?.amount

  const makePayment = fields => {
    makeRequest({
      ...fields,
      receipent_id: selectedInfluencer?.influencer?.id,
      campaign_id: involvedCampaign.campaign_id,
      sender_id: singleCampaign?.owner_id
    }).then(()=>{
      window.location.reload()
    }).catch(err => {
      const message = err?.message ?? err
      toast.error(message)
    })
  }

  return (
    <Modal isOpen={showModal} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Release Payment</ModalHeader>
      <AvForm
        onValidSubmit={(e, values) => makePayment(values)}
        model={{ amount: defaultAmount }}
      >
        <ModalBody>
          <AvGroup>
            <Label>Release Amount</Label>
            <AvInput
              name='amount'
              required
              placeholder='Enter amount to release'
            />
          </AvGroup>
        </ModalBody>
        <ModalFooter>
          <Button.Ripple
            disabled={loading}
            color='primary'
            className='float-right'
          >
            {loading ? <Spinner /> : 'Release'}
          </Button.Ripple>
        </ModalFooter>
      </AvForm>
    </Modal>
  )
}
