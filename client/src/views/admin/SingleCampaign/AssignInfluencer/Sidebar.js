import React from 'react'
import { Card, CardBody, Button } from 'reactstrap'
import Radio from '../../../../components/@vuexy/radio/RadioVuexy'
import 'rc-slider/assets/index.css'
import '../../../../assets/scss/plugins/extensions/slider.scss'


const influencerFilterList = [
  {
    label: 'All',
    value: '',
    defaultChecked: true
  },
  {
    label: 'Nano influencers: 1,000-10,000',
    value: 'nano'
  },
  {
    label: 'Micro influencers: 10,000-50,000',
    value: 'micro'
  },
  {
    label: 'Mid-tier influencers: 50,000-500,000',
    value: 'mid-tier'
  },
  {
    label: 'Macro-Influencers: 500,000-1,000,000',
    value: 'macro'
  },
  {
    label: 'Mega-influencers: 1,000,000+',
    value: 'mega'
  }
]

export default function SideBar ({ search }) {
  const  [filter, setFilter]= React.useState()
  return (
    <React.Fragment>
      <h6 className='filter-heading d-none d-lg-block'>Filters</h6>
      <Card>
        <CardBody className='p-2'>
          <div className='multi-range-price'>
            <div className='multi-range-title pb-75'>
              <h6 className='filter-title mb-0'>Multi Range</h6>
            </div>
            <ul className='list-unstyled price-range'>
              {influencerFilterList.map(list => (
                <li key={list.value}>
                  <Radio
                    label={list.label}
                    defaultChecked={list.defaultChecked}
                    name='influencer_type'
                    className='py-25'
                    value={list.value}
                    onChange={e=> setFilter(e.target.value)}
                  />
                </li>
              ))}
            </ul>
          </div>
          <hr />
          {/* <div className='brands'>
            <div className='brand-title mt-1 pb-1'>
              <h6 className='filter-title mb-0'>Brands</h6>
            </div>
            <div className='brand-list'>
              <ul className='list-unstyled brand-list'>
                <li className='d-flex justify-content-between align-items-center py-25'>
                  <Checkbox
                    color='primary'
                    icon={<Check className='vx-icon' size={16} />}
                    label='Insignia™'
                    defaultChecked={false}
                  />
                  <span>746</span>
                </li>
              </ul>
            </div>
          </div> */}
          <hr />
          <div className='clear-filters'>
            <Button.Ripple block className='btn-block' color='primary' onClick={()=> search({ social_type: filter }, false, false, false, false)}>
              Search
            </Button.Ripple>
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  )
}
