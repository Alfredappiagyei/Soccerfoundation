import { AvInput, AvGroup, AvFeedback } from 'availity-reactstrap-validation'
import React from 'react'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { Col, Label, Row } from 'reactstrap'
import CreatableSelect from 'react-select/creatable'
import upperFirst from "lodash/upperFirst";
import FileUploader from '../../../../components/FileUploader'

const countries = require('../../../../assets/country_data.json')

const objectiveList = ['Awareness', 'Reach', 'Sales'].map(e => ({
  label: e,
  value: e.toLowerCase()
}))

export default function Form1 ({ defaultValues }) {
  const [cityField, setCityField] = React.useState('Accra, Ghana')
  const [countryField, setCountryField] = React.useState()
  const [objectives, setObjectives] = React.useState('')
  const [featuredImageUrl, setFeaturedImageUrl] = React.useState('')


  return (
    <Row>
      <Col lg={6}>
        <AvGroup>
          <Label>Company Name</Label>
          <AvInput
            name='company_name'
            value={defaultValues?.company_name}
            required
            placeholder='Eg. Coca Cola'
          />
          <AvFeedback>Please enter company name</AvFeedback>
        </AvGroup>
      </Col>
      <Col lg={6}>
        <AvGroup>
          <Label>Campaign Name</Label>
          <AvInput
            name='name'
            required
            placeholder='Eg. Free beyond one'
            value={defaultValues?.name}
          />
          <AvFeedback>Please enter Campaign name</AvFeedback>
        </AvGroup>
      </Col>
      <Col lg={6}>
        <AvGroup>
          <Label for='country'>Country</Label>
          <AvInput
            id='country'
            type='select'
            name='country'
            required
            placeholder='Country'
            onChange={e => setCountryField(e.target.value)}
            value={defaultValues?.country}
          >
            <option></option>
            {countries.map(country => {
              return (
                <option key={country.name} value={country.value.toLowerCase()}>
                  {country.name}
                </option>
              )
            })}
          </AvInput>
          <AvFeedback>Please select country</AvFeedback>
        </AvGroup>
      </Col>

      <Col lg={6}>
        <AvGroup>
          <span>City</span>
          <AvInput
            name='city'
            required
            value={cityField || defaultValues?.city}
            hidden
          />
          <GooglePlacesAutocomplete 
            required
            selectProps={{
              onChange: e => setCityField(e.label),
              value: {
                label: cityField || defaultValues?.city,
                value: cityField || defaultValues?.city
              }
            }}
            autocompletionRequest={{
              componentRestrictions: {
                country: countries.find(
                  country => country.value === countryField
                )?.code
              },
              types: ['(regions)']
            }}
          />
          <AvFeedback>Please select a city</AvFeedback>
        </AvGroup>
      </Col>

      <Col lg={6}>
        <AvGroup>
          <Label>Campaign Objective</Label>
          <AvInput
            hidden
            name='objectives'
            required
            value={defaultValues?.objectives || objectives}
          />
          <CreatableSelect
            options={objectiveList}
            isMulti
            onChange={e => e && setObjectives(e.map(cat => cat.value))}
            defaultValue={
              defaultValues?.objectives
                ? defaultValues.objectives.map(e => ({
                    label: upperFirst(e),
                    value: e
                  }))
                : null
            }
          />
          <AvFeedback>Please select Campaign Objective</AvFeedback>
        </AvGroup>
        <AvGroup>
          <Label>Upload Campaign Image</Label>
          <AvInput name='feature_image_url' hidden required value={featuredImageUrl || defaultValues?.feature_image_url} /> 
          <p/>
          <FileUploader isMultiple={false} folder='campaign' defaultMedia={defaultValues?.feature_image_url && [{type: 'image', url:  defaultValues?.feature_image_url }]} onComplete={(media)=> setFeaturedImageUrl(media[0]?.url)} />
          <AvFeedback>Please upload featured image</AvFeedback>
        </AvGroup>
      </Col>

      <Col lg={6}>
        <AvGroup>
          <Label>Campaign Description</Label>
          <AvInput
            name='description'
            type='textarea'
            required
            placeholder='Eg. Free beyond one'
            rows='11'
            cols='50'
            value={defaultValues?.description}
          />
          <AvFeedback>Please enter Campaign description</AvFeedback>
        </AvGroup>
      </Col>
    </Row>
  )
}
