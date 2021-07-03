import React from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Input
} from 'reactstrap'
import DataTable from 'react-data-table-component'
import moment from 'moment'
import Spinner from '../../../components/@vuexy/spinner/Loading-spinner'
import { startCase } from 'lodash'
import { ArrowDownLeft, ArrowUpRight } from 'react-feather'
import { Link } from 'react-router-dom'

export default function Transactions ({
  transactions,
  loading,
  refetch,
  loadMore,
  showCampaignInfluencer
}) {
  const [filters, setFilters] = React.useState({
    per_page: 20
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardBody>
        {/* <div className='d-flex flex-wrap mb-1'>
          <div className='w-75 mr-1'>
            <Input placeholder='search by source, title' />
          </div>
        </div> */}
        {loading ? (
          <Spinner />
        ) : (
          <DataTable
            className='dataTable-custom'
            data={transactions.data}
            columns={[
              {
                name: 'Date Created',
                selector: 'created_at',
                cell: row => (
                  <p className='text-bold-500 text-truncate mb-0'>
                    {moment(row.created_at).calendar()}
                  </p>
                ),
                minWidth: '200px'
              },
              {
                name: 'Activity',
                selector: 'activity',
                cell: row => (
                  <p className='text-bold-500 text-truncate mb-0'>
                    {startCase(row.activity)}
                  </p>
                ),
                minWidth: '200px'
              },
              {
                name: 'Status',
                selector: 'status',
                cell: row => {
                  const color =
                    row.status === 'sucessful' ? 'success' : row.status === 'failed' ? 'danger': 'warning'
                  return (
                    <div className={`badge badge-pill badge-light-${color}`}>
                      {row.status}
                    </div>
                  )
                }
              },
              {
                name: 'Cash Flow',
                selector: 'flow',
                cell: row => {
                  const color = row.flow === 'inward' ? 'success' : 'warning'
                  return (
                    <div className={`badge badge-pill badge-light-${color}`}>
                     {row.flow === 'inward' ? <ArrowDownLeft /> : <ArrowUpRight />  }
                      {row.flow}
                    </div>
                  )
                }
              },
              {
                name: 'Amount',
                selector: 'amount',
                cell: row => (
                  <p className='text-bold-500 text-truncate mb-0'>
                    {row.currency} {row.amount}
                  </p>
                )
              },
              {
                name: 'Initial Wallet Balance',
                selector: 'initial_balance',
                cell: row => (
                  <p className='text-bold-500 text-truncate mb-0'>
                    {row.currency} {row.initial_balance}
                  </p>
                ),
                minWidth: '150px'

              },
              {
                name: 'Final Wallet Balance',
                selector: 'final_balance',
                cell: row => (
                  <p className='text-bold-500 text-truncate mb-0'>
                    {row.currency} {row.final_balance}
                  </p>
                ),
                minWidth: '150px'

              },
              {
                name: 'Description',
                selector: 'descripton',
                cell: row => (
                  <p className='text-bold-500 mb-0'>
                    {row.description}
                  </p>
                ),
                minWidth: '200px'
              },
              showCampaignInfluencer ? {
                name: 'Influencer',
                selector: 'influencer',
                cell: row=> (
                  <Link to={{
                    pathname: `/brand/influencers/${row?.influencer?.id}`,
                    state: row?.influencer
                  }}>
                   <p className='text-bold-500 mb-0'>
                  {startCase(row.influencer?.full_name)}
                </p>
                  </Link>
                 
                ),
                minWidth: '200px'
              }: {}
            ]}
            fixedHeader
            subHeader
            pagination
            paginationServer
            paginationTotalRows={transactions.meta?.last_page}
            paginationPerPage={filters.per_page}
            responsive
            onChangePage={page => {
              loadMore({
                ...filters,
                page
              })
            }}
            onChangeRowsPerPage={rowsPerPage => {
              const newUpdate = {
                ...filters,
                per_page: rowsPerPage
              }
              setFilters(newUpdate)
              refetch(newUpdate)
            }}
          />
        )}
      </CardBody>
    </Card>
  )
}
