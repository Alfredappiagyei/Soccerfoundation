import AvForm from 'availity-reactstrap-validation/lib/AvForm'
import AvGroup from 'availity-reactstrap-validation/lib/AvGroup'
import AvInput from 'availity-reactstrap-validation/lib/AvInput'
import AsyncSelect from 'react-select/async'
import React from 'react'
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner
} from 'reactstrap'
import useQuery from '../../../../hooks/useQuery'
import AvFeedback from 'availity-reactstrap-validation/lib/AvFeedback'
import ProfileAvatar from '../../../../components/ProfileAvatar'
import useMutation from '../../../../hooks/useMutation'
import FileUploader from '../../../../components/FileUploader'
import { toast } from 'react-toastify'

export default function BroadCast ({ toggle, showModal, singleCampaign }) {
  const [influencers, setInfluencers] = React.useState('')
  const [media, setMedia] = React.useState('')

  const { refetch } = useQuery({
    endpointPath: '/api/admin/users?role=influencer',
    initialLoad: false
  })
  const { makeRequest, loading } = useMutation({
    endpointPath: '/api/admin/conversations/broadcast'
  })

  const getInfluencers = inputValue => {
    return refetch({
      campaign_influencer_statuses: [
        'paid',
        'disputed',
        'selected',
        'completed'
      ],
      campaign_id: singleCampaign.id,
      q: inputValue
    }).then(response => {
      const transformed = response.data?.map(influencer => ({
        label: (
          <div>
            <ProfileAvatar
              imageUrl={influencer?.profile_url}
              firstName={influencer?.first_name}
              lastName={influencer?.last_name}
            />
            {influencer?.full_name}
          </div>
        ),
        value: influencer.id
      }))
      return transformed
    })
  }

  return (
    <Modal isOpen={showModal} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        BroadCast Message To Influencers
      </ModalHeader>
      <AvForm
        onValidSubmit={async (e, values) => {
          await makeRequest({
            ...values,
            campaign_id: singleCampaign.id
          })
          toast.success('Broadcast Sent Successfully')
          window.location.reload()
        }}
      >
        <ModalBody>
          <AvGroup>
            <Label> Message </Label>
            <AvInput
              description='Enter message'
              name='message'
              required
              type='textarea'
              rows='11'
              cols='40'
            />
            <AvFeedback>Enter Message</AvFeedback>
          </AvGroup>
          <AvGroup>
            <AvInput hidden required name='influencers' value={influencers} />
            <AsyncSelect
              isMulti
              cacheOptions
              defaultOptions
              loadOptions={getInfluencers}
              onChange={e => setInfluencers(e.map(selected => selected.value))}
            />
          </AvGroup>
          <AvGroup>
            <AvInput hidden required name='media' value={media} />
            <FileUploader folder='conversations' onComplete={setMedia} />
          </AvGroup>
        </ModalBody>
        <ModalFooter>
          <Button color='danger' disabled={loading}>
            {loading ? <Spinner /> : 'Send'}
          </Button>
        </ModalFooter>
      </AvForm>
    </Modal>
  )
}
