import { sortBy } from 'lodash'
import moment from 'moment'
import React from 'react'
import { Col, Row } from 'reactstrap'
import { SingleDetail } from '../../../general/CampaignCardDetail'
import { MediaTypeComponent } from '../../../../components/SingleChatMessage'
const SingleDetailMemorized = React.memo(SingleDetail)

export default function Summary ({ formData = {} }) {
  const sortedFormData = sortBy(Object.keys(formData), key => {
    return formData[key].length
  }).reduce((acc, key) => {
    acc[key] = formData[key]
    return acc
  }, {})

  const {
    budget,
    age_range,
    name,
    duration,
    company_name,
    feature_image_url,
    media=[],
    ...rest
  } = sortedFormData
  if (Object.keys(sortedFormData).length === 0) return null

  return (
    <div>
      <div className='h4 mb-5'>Summary </div>
      <Row>
        <SingleDetailMemorized data={{ title: 'Campaign Name', value: name }} />
        <SingleDetailMemorized
          data={{ title: 'Company Name', value: company_name }}
        />
        <SingleDetailMemorized
          parse={false}
          data={{
            title: 'Age Duration',
            value:
              age_range &&
              `From ${moment(age_range[0]).calendar()} to ${moment(
                age_range[1]
              ).calendar()}`
          }}
        />
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
          parse={false}
          data={{
            title: 'Age Duration',
            value:
              duration &&
              `From ${moment(duration[0]).calendar()} to ${moment(
                duration[1]
              ).calendar()}`
          }}
        />
        <SingleDetailMemorized
          parse={false}
          data={{ title: 'Budget', value: `$${budget}` }}
        />
        {Object.keys(rest).map(key => {
          const value = rest[key]
          return (
            <SingleDetailMemorized key={key} data={{ title: key, value }} />
          )
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
    </div>
  )
}
