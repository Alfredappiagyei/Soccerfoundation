import React from 'react'
import { Button, Row } from 'reactstrap'
import startCase from 'lodash/startCase'
import '../../../assets/scss/pages/faq.scss'
import moment from 'moment'
import AvForm from 'availity-reactstrap-validation/lib/AvForm'
import AvGroup from 'availity-reactstrap-validation/lib/AvGroup'
import AvInput from 'availity-reactstrap-validation/lib/AvInput'
import { toast } from 'react-toastify'
import { SingleDetail } from '../../general/CampaignCardDetail'
import { MediaTypeComponent } from '../../../components/SingleChatMessage'

const campaignStatusList = [
  'approved',
  'awaiting_approval',
  'rejected',
  'on_going',
  'completed',
  'cancelled'
]

const SingleDetailMemorized = React.memo(SingleDetail)

export default function Details ({
  updateCampaign,
  singleCampaign: {
    min_age_group,
    max_age_group,
    max_duration,
    min_duration,
    id,
    owner_id,
    updated_at,
    name,
    budget,
    created_at,
    status,
    influencers,
    company_name,
    activities,
    feature_image_url,
    media=[],
    ...rest
  } = {}
}) {
  return (
    <Row>
      <SingleDetailMemorized
        data={{ title: 'Status' }}
        extra={
          <AvForm
            onSubmit={async (e, errors, values) => {
              if (errors.length) return
              await updateCampaign(values)
              toast.success('Campaign updated')
            }}
          >
            <AvGroup className='d-flex'>
              <AvInput name='status' value={status} required type='select'>
                {campaignStatusList.map(item => (
                  <option key={item} value={item}>
                    {startCase(item)}
                  </option>
                ))}
              </AvInput>
              <Button size='sm' className='ml-1' color='primary'>
                Update
              </Button>
            </AvGroup>
          </AvForm>
        }
      />
      <SingleDetailMemorized data={{ title: 'Campaign Id', value: id }} />
      <SingleDetailMemorized data={{ title: 'Campaign Name', value: name }} />
      <SingleDetailMemorized
          parse={false}
          data={{
            title: 'Featured Media',
            value: (
              <img 
                src={feature_image_url}
                alt={feature_image_url}
                className='img-thumbnail'
              />
            )
          }}
        />
      <SingleDetailMemorized data={{ title: 'Company Name', value: company_name }} />
      <SingleDetailMemorized
        data={{ title: 'Date Created', value: moment(created_at).calendar() }}
        parse={false}
      />
      <SingleDetailMemorized
        parse={false}
        data={{
          title: 'Age Group',
          value: `From ${min_age_group} years to ${max_age_group} years`
        }}
      />
      <SingleDetailMemorized
        parse={false}
        data={{
          title: 'Age Duration',
          value: `From ${moment(min_duration).calendar()} to ${moment(
            max_duration
          ).calendar()}`
        }}
      />
      <SingleDetailMemorized
        parse={false}
        data={{ title: 'Budget', value: `$${budget}` }}
      />

      {Object.keys(rest).map(key => {
        const value = rest[key]
        return <SingleDetailMemorized key={key} data={{ title: key, value }} />
      })}
          <SingleDetailMemorized
          parse={false}
          data={{
            title: 'Attachments',
            value: (
              <MediaTypeComponent media={media} chatPosition={'chat-left'} />
            )
          }}
        />
    </Row>
  )
}
