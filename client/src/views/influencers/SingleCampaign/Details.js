import React from 'react'
import { Row } from 'reactstrap'
import '../../../assets/scss/pages/faq.scss'
import moment from 'moment'
import { SingleDetail } from '../../general/CampaignCardDetail'
import { MediaTypeComponent } from '../../../components/SingleChatMessage'

const SingleDetailMemorized = React.memo(SingleDetail)

export default function Details ({
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
    influencers=[],
    company_name,
    activities,
    feature_image_url,
    media=[],
    ...rest
  } = {}
}) {
  const influencer = influencers[0]
  return (
    <Row>
      <SingleDetailMemorized data={{ title: 'Campaign Id', value: id }} />
      <SingleDetailMemorized data={{ title: 'Campaign Name', value: name }} />
      <SingleDetailMemorized data={{ title: 'Company Name', value: company_name }} />
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
      <SingleDetailMemorized
        data={{ title: 'Amount Offered', value: `$ ${influencer?.amount}` }}
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
