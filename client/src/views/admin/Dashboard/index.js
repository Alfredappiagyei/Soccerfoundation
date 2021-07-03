import React from 'react'
import { Card, CardBody, Col, Row } from 'reactstrap'
import { User } from 'react-feather'
import Flatpickr from 'react-flatpickr'
import StatisticsCard from '../../../components/@vuexy/statisticsCard/StatisticsCard'
import 'flatpickr/dist/themes/light.css'
import '../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss'
import useQuery from '../../../hooks/useQuery'
import Spinner from '../../../components/@vuexy/spinner/Loading-spinner'
import { followerCountFormatter } from '../../../helpers/utils'

export default function Dashboard () {
  const { data = {}, loading } = useQuery({
    endpointPath: '/api/admin/dashboard/stats'
  })

  if (loading) return <Spinner />
  return (
    <Card>
      <CardBody>
        <div className='m-5 w-40'>
          Filter Stats by date
          <Flatpickr
            className='form-control'
            options={{
              mode: 'range',
              minDate: 'today'
            }}
            placeholder='Select date range'
            onChange={dates => {
              console.log(dates)
            }}
          />
        </div>
        <Row>
          <Col xl='3' lg='4' sm='6'>
            <StatisticsCard
              hideChart
              iconBg='success'
              icon={<User className='icon'  size={22} />}
              stat={followerCountFormatter(data.total_users)}
              statTitle='Total Users'
            />
          </Col>
          <Col xl='3' lg='4' sm='6'>
            <StatisticsCard
              hideChart
              iconBg='success'
              icon={<User className='icon' size={22} />}
              stat={followerCountFormatter(data?.total_approved_influencers)}
              statTitle='Influencers Awaiting Approval'
            />
          </Col>
          <Col xl='3' lg='4' sm='6'>
            <StatisticsCard
              hideChart
              iconBg='success'
              icon={<User className='icon' size={22} />}
              stat={followerCountFormatter(data?.total_influencers_not_approved)}
              statTitle='Approved Influencers'
            />
          </Col>
          <Col xl='3' lg='4' sm='6'>
            <StatisticsCard
              hideChart
              iconBg='success'
              icon={<User className='icon' size={22} />}
              stat={followerCountFormatter(data?.total_campaigns)}
              statTitle='Number of Campaigns'
            />
          </Col>
          <Col xl='3' lg='4' sm='6'>
            <StatisticsCard
              hideChart
              iconBg='success'
              icon={<User className='icon' size={22} />}
              stat={data?.total_barter_campaigns}
              statTitle='Number of Barter Campaigns'
            />
          </Col>
          <Col xl='3' lg='4' sm='6'>
            <StatisticsCard
              hideChart
              iconBg='success'
              icon={<User className='icon' size={22} />}
              stat={data?.total_amount_loaded}
              statTitle='Amount Loaded into wallet'
            />
          </Col>
          <Col xl='3' lg='4' sm='6'>
            <StatisticsCard
              hideChart
              iconBg='success'
              icon={<User className='icon' size={22} />}
              stat={data?.total_amount_paid_out}
              statTitle='Amount paid out to influencers'
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}
