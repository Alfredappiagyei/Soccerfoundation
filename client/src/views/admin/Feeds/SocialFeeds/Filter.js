import React from 'react'
import 'react-contexify/dist/ReactContexify.min.css'
import '../../../../assets/scss/plugins/extensions/context-menu.scss'
import 'react-toastify/dist/ReactToastify.css'
import {
  Button,
  Card,
  CardBody,
  Label
} from 'reactstrap'
import { Facebook, Instagram, Twitter } from 'react-feather'
import {
  AvForm,
  AvRadioGroup,
  AvInput,
  AvGroup,
  AvRadio,
  AvFeedback
} from 'availity-reactstrap-validation'
import Select from 'react-select'

export default function Filter ({ setFilters, loader, submitting=true }) {
  const [extraFilter, setExtraFilter] = React.useState()
  const [channel, setSelectedChannel] = React.useState('twitter')
  const onSubmit = (e, errors, values) => {
    if (errors.length) return
    values.text = extraFilter
      ? extraFilter.replace('TEXT', values.text)
      : values.text
    setFilters(values)
  }

  return (
    <Card style={{ marginBottom: '0.5em' }}>
      <CardBody>
        <div>Social Feeds</div>
        <AvForm className='mt-2' onSubmit={onSubmit}>
          <AvRadioGroup
            name='channel'
            inline
            defaultValue={'twitter'}
            onChange={(_, text) => setSelectedChannel(text)}
          >
            <AvRadio
              label={
                <>
                  <Twitter /> Twitter
                </>
              }
              value='twitter'
            />
            <AvRadio
              label={
                <>
                  <Instagram /> Instagram
                </>
              }
              value='instagram'
            
            />
            <AvRadio
              label={
                <>
                  <Facebook /> Facebook
                </>
              }
              value='facebook'
            />
          </AvRadioGroup>

          <AvGroup>
            <Label>Search Criteria</Label>
            <AvInput
              name='text'
              placeholder='Enter search criteria (Hashtag etc)'
              required
            />
            <AvFeedback>Please enter a search criteria</AvFeedback>
          </AvGroup>
          {channel === 'twitter' && (
            <Select
              options={[
                {
                  label: 'Select a Filter',
                  value: 'TEXT'
                },
                {
                  label: 'From Twitter Account',
                  value: 'from:TEXT'
                },
                {
                  label: 'Reply To Twitter Account',
                  value: 'to:TEXT'
                },
                {
                  label: 'Mentions',
                  value: '@TEXT'
                },
                {
                  label: 'Only Retweets',
                  value: 'TEXT filter:retweets'
                },
                {
                  label: 'Exclude Retweets',
                  value: 'TEXT -filter:retweets'
                },
                {
                  label: 'Include Only Media',
                  value: 'TEXT filter:media'
                }
              ]}
              placeholder='Choose filters'
              isMulti={false}
              onChange={e => setExtraFilter(e.value)}
              isSearchable
            />
          )}

          <Button
            className='nav-link nav-link-label text-right mt-3'
            color='primary'
          >
            Search
          </Button>
        </AvForm>
        {submitting&& loader}
      </CardBody>
    </Card>
  )
}
