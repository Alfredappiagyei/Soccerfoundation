import React from 'react'
import { AvInput, AvGroup, AvFeedback } from 'availity-reactstrap-validation'
import { Col, Label, Row } from 'reactstrap'
import CreatableSelect from 'react-select/creatable'
import Select from 'react-select'

import Slider from 'rc-slider'
import Flatpickr from 'react-flatpickr'
import {
  DollarSign,
  Facebook,
  Twitter,
  Instagram
} from 'react-feather'
import * as Icon from 'react-feather'
import '../../../../assets/scss/plugins/extensions/slider.scss'
import '../../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss'
import '../../../../assets/scss/plugins/forms/react-select/_react-select.scss'
import 'rc-slider/assets/index.css'
import 'flatpickr/dist/themes/light.css'
import { startCase } from 'lodash'
import FileUploader from '../../../../components/FileUploader'

const categories = [
  'Non alcoholic Beverages',
  'Alcoholic Beverages (age has above 21)',
  'Food (Restaurants)',
  'Event/Experiential',
  'Hospitality',
  'Sports',
  'Fashion',
  'Financial'
]

const categoriesOptions = categories.map(category => ({
  label: category,
  value: category
}))

const createSliderWithTooltip = Slider.createSliderWithTooltip
const Range = createSliderWithTooltip(Slider.Range)

export default function Form2 ({ defaultValues }) {
  const [category, setCategory] = React.useState('')
  const [ageRange, setAgeRange] = React.useState('')
  const [durationRange, setDurationRange] = React.useState('')
  const [socialPlatform, setSocialPlatform] = React.useState('')
  const [media, setMedia] = React.useState('')

  return (
    <Row>
      <Col lg={6}>
        <AvGroup>
          <Label>Influencer Task Requirements</Label>
          <AvInput
            name='requirements'
            required
            type='textarea'
            rows='11'
            cols='50'
            value={defaultValues?.requirements}
          />
          <AvFeedback>Please enter influencer task requirement</AvFeedback>
        </AvGroup>
      </Col>

      <Col lg={6}>
        <AvGroup>
          <Label>Campaign Goals</Label>
          <AvInput
            name='goals'
            required
            type='textarea'
            rows='11'
            cols='50'
            value={defaultValues?.goals}
          />
          <AvFeedback>Please enter campaign goals</AvFeedback>
        </AvGroup>
      </Col>

      <Col lg={6}>
        <AvGroup>
          <Label>Campaign Category</Label>
          <AvInput
            hidden
            name='category'
            required
            value={category || defaultValues?.category}
          />
          <CreatableSelect
            options={categoriesOptions}
            className='React-Select'
            isMulti
            classNamePrefix='select'
            onChange={e => setCategory(e.map(cat => cat.value))}
            defaultValue={(defaultValues?.category || []).map(a => ({
              label: a,
              value: a
            }))}
          />
          <AvFeedback>Please select campaign categories</AvFeedback>
        </AvGroup>
      </Col>

      <Col lg={6}>
        <AvGroup>
          <Label>Age group</Label>
          <AvInput
            hidden
            name='age_range'
            required
            value={ageRange || defaultValues?.age_range}
          />
          <Range
            min={13}
            max={100}
            tipProps={{
              prefixCls: 'rc-slider-tooltip'
            }}
            onChange={setAgeRange}
            defaultValue={defaultValues?.age_range || [13, 40]}
          />
          <AvFeedback>Please select age range</AvFeedback>
        </AvGroup>
      </Col>

      <Col lg={6}>
        <AvGroup>
          <Label>Gender</Label>
          <AvInput
            name='gender'
            type='select'
            value={defaultValues?.gender}
            required
          >
            <option>Select a gender</option>
            <option value='male'>Male</option>
            <option value='female'>Female</option>
            <option value='both'>Both</option>
          </AvInput>
          <AvFeedback>Please a gender</AvFeedback>
        </AvGroup>
      </Col>

      <Col lg={6}>
        <AvGroup>
          <Label>Duration</Label>
          <AvInput
            hidden
            name='duration'
            required
            value={durationRange || defaultValues?.duration}
          />
          <Flatpickr
            className='form-control'
            options={{
              mode: 'range',
              minDate: 'today',
              defaultDate: defaultValues?.duration || []
            }}
            onChange={dates => {
              setDurationRange(dates)
            }}
          />
          <AvFeedback>Please choose duration </AvFeedback>
        </AvGroup>
      </Col>

      <Col lg={6}>
        <AvGroup className='position-relative has-icon-left'>
          <Label>Budget (in USD)</Label>
          <AvInput
            name='budget'
            required
            type='number'
            min={1}
            placeholder='Enter your budget for this campaign. Eg. $1000'
            value={defaultValues?.budget}
          />
          <div className='form-control-position mt-2'>
            <DollarSign size={15} />
          </div>
          <AvFeedback>Please enter a budget </AvFeedback>
        </AvGroup>

        <AvGroup>
          <Label>Social Platforms</Label>
          <AvInput
            name='social_platforms'
            required
            hidden
            placeholder='Enter your budget for this campaign. Eg. $1000'
            value={socialPlatform || defaultValues?.social_platforms}
          />

          <Select
            className='React-Select'
            isMulti
            classNamePrefix='select'
            defaultValue={defaultValues?.social_platforms?.map(platform=>{
              const Platform = Icon[startCase(platform)]
              return {
                value: platform,
                label: <> <Platform  size={14} /> {startCase(platform)}  </>
              }
            })}
            options={[
              {
                label: (
                  <>
                    <Facebook size={14} /> Facebook{' '}
                  </>
                ),
                value: 'facebook'
              },
              {
                label: (
                  <>
                    <Twitter size={14} /> Twitter{' '}
                  </>
                ),
                value: 'twitter'
              },
              {
                label: (
                  <>
                    <Instagram size={14} /> Instagram{' '}
                  </>
                ),
                value: 'instagram'
              }
            ]}
            onChange={e => e && setSocialPlatform(e.map(item => item.value))}
          />

          <AvFeedback>Please select social platforms </AvFeedback>
        </AvGroup>
        <AvGroup>
          <Label>Add Campaign Attachments</Label>
          <AvInput name='media' hidden value={media|| defaultValues?.media} /> 
          <p/>
          <FileUploader folder='campaign' defaultMedia={defaultValues?.media || []} onComplete={setMedia} />
        </AvGroup>
      </Col>

      <Col lg={6}>
        <AvGroup>
          <Label>Extra Notes</Label>
          <AvInput
            name='notes'
            type='textarea'
            rows='11'
            cols='50'
            value={defaultValues?.notes}
          />
        </AvGroup>
      </Col>
    </Row>
  )
}
