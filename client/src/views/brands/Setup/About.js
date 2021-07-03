import { AvInput, AvGroup } from 'availity-reactstrap-validation'
import AvFeedback from 'availity-reactstrap-validation/lib/AvFeedback'
import React from 'react'
import { Col, Label, Row } from 'reactstrap'
import InterestSelector from '../../influencers/Setup/InterestSelector'

export default function MiniAbout ({ user,setInterests, interests }) {
  // console.log(user);
  return (
    <Row>
      <Col xs={6}>
        <AvGroup>
          <Label>Website Url</Label>
          <AvInput
            name='website_url'
            placeholder='https://example.com'
            required
            type='url'
            defaultValue={user?.website_url}
          />
          <AvFeedback>Please enter website for your company</AvFeedback>
        </AvGroup>
      </Col>
      <Col xs={6}>
        <AvGroup>
          <Label>Company Size</Label>
          <AvInput
            name='company_size'
            defaultValue={user?.company_size || '10_49'}
            required
            type='select'
          >
            <option value='<10'>{'<10'}</option>
            <option value='10_49'>{'10 - 49'}</option>
            <option value='50_249'>{'50 - 249'}</option>
            <option value='>250'>{'>250'}</option>
          </AvInput>
          <AvFeedback>Please select company size</AvFeedback>
        </AvGroup>
      </Col>
      <Col xs={12}>
        <AvGroup>
          <Label>About Company</Label>
          <AvInput
            name='business_description'
            required
            rows='15'
            cols='50'
            type='textarea'
            defaultValue={user?.business_description}
          />
          <AvFeedback>
            Please enter short description about this company
          </AvFeedback>
        </AvGroup>
      </Col>

      <Col xs={12}>
        <AvGroup>
          <InterestSelector defaultValues={interests} isBrand onChange={setInterests} />
        </AvGroup>
      </Col>
    </Row>
  )
}
