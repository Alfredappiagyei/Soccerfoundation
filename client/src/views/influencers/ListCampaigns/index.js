import React from 'react'
import {
  UncontrolledDropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
  Input,
  Label,
  Badge
} from 'reactstrap'
import DataTable from 'react-data-table-component'
import ReactPaginate from 'react-paginate'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'react-feather'
import Checkbox from '../../../components/@vuexy/checkbox/CheckboxesVuexy'
import { history } from '../../../history'
import queryString from 'query-string'
import useQuery from '../../../hooks/useQuery'
import moment from 'moment'
import { startCase } from 'lodash'
import Spinner from '../../../components/@vuexy/spinner/Loading-spinner'
import '../../../assets/scss/plugins/extensions/react-paginate.scss'
import '../../../assets/scss/pages/data-list.scss'

const selectedStyle = {
  rows: {
    selectedHighlighStyle: {
      backgroundColor: 'rgba(115,103,240,.05)',
      color: '#A223B6  !important',
      boxShadow: '0 0 1px 0 #A223B6 !important',
      '&:hover': {
        transform: 'translateY(0px) !important'
      }
    }
  }
}

const CustomHeader = props => {
  return (
    <div className='data-list-header d-flex justify-content-between flex-wrap'>
      <div className='actions-right d-flex flex-wrap mt-sm-0 mt-2'>
        <div>
          <Label>Filter Campaigns</Label>
          <Input type='select' onChange={e=> {
            const value = e.target.value
            props.refetch({
              ...value === 'all' ? {}: {
                campaign_influencer_status: value.split(',')
              }
            })
          }}>
            <option value='all'>All Campaigns</option>
            <option value={['invited', 'selected', 'accepted']}>Active Campaigns</option>
            <option value={['rejected']}>Completed Campaigns</option>
            <option value={['completed']}>Rejected Campaigns</option>
          </Input>
        </div>
      </div>
    </div>
  )
}

export default function ListCampaigns (props) {
  const parsedFilter = queryString.parse(props.location.search)
  const { data, loading, loadMore, refetch } = useQuery({
    endpointPath: `/api/influencers/campaigns`,
    initQuery: {
      page: parsedFilter?.page,
      per_page: parsedFilter?.perPage,
      type: 'campaign'
    }
  })

  const handlePagination = (page = { selected: 0 }, itemPerPage) => {
    const path = window.location.pathname
    let perPage = itemPerPage
      ? itemPerPage
      : parsedFilter.perPage !== undefined
      ? parsedFilter.perPage
      : 20
    const nextPage = page.selected + 1
    history.push(`${path}?page=${nextPage}&perPage=${perPage}`)
    loadMore({
      page: nextPage,
      per_page: perPage
    })
  }

  const columns = [
    {
      name: 'Image',
      selector: 'img',
      minWidth: '220px',
      cell: row => <img src={row?.feature_image_url} height='100' alt={row.feature_image_url} />
    },
    {
      name: 'Date Created',
      selector: 'company_name',
      cell: row => moment(row.created_at).calendar()
    },
    {
      name: 'Company Name',
      selector: 'company_name',
      sortable: true,
      minWidth: 250
    },
    {
      name: 'Campaign Name',
      selector: 'name',
      sortable: true,
      minWidth: 250
    },
    {
      name: 'Delivery Date',
      selector: 'name',
      sortable: true,
      minWidth: 250,
      cell: row=> `From ${moment(row.min_duration).calendar()} to ${moment(row.max_duration).calendar()}`
    },
    {
      name: 'Status',
      selector: 'status',
      cell: row => (
        <Badge color={row?.influencers[0]?.status === 'completed' ? 'success' : 'info'}>
          {startCase(row?.influencers[0]?.status)}
        </Badge>
      ),
      sortable: true
    },
    {
      name: 'Amount',
      selector: 'influencers',
      cell: row => `$ ${row?.influencers[0].amount}`,
    },
    {
      name: 'Action',
      selector: 'name',
      cell: row => (
        <Eye
          className='cursor-pointer mr-1'
          size={20}
          onClick={() => history.push(`/influencer/campaigns/${row.id}`)}
        />
      )
    }
  ]

  if (loading) return <Spinner />


  return (
    <div className={'data-list thumb-view'}>
      <DataTable
        columns={columns}
        data={data?.data || []}
        pagination
        paginationServer
        paginationComponent={() => (
          <ReactPaginate
            previousLabel={<ChevronLeft size={15} />}
            nextLabel={<ChevronRight size={15} />}
            breakLabel='...'
            breakClassName='break-me'
            pageCount={data?.meta?.last_page || 1}
            containerClassName='vx-pagination separated-pagination pagination-end pagination-sm mb-0 mt-2'
            activeClassName='active'
            forcePage={parsedFilter.page ? parseInt(parsedFilter.page - 1) : 0}
            onPageChange={handlePagination}
          />
        )}
        noHeader
        subHeader
        selectableRows
        responsive
        pointerOnHover
        selectableRowsHighlight
        // onSelectedRowsChange={data =>
        //   this.setState({ selected: data.selectedRows })
        // }
        subHeaderComponent={<CustomHeader refetch={refetch} />}
        customStyles={selectedStyle}
        sortIcon={<ChevronDown />}
        selectableRowsComponent={Checkbox}
        selectableRowsComponentProps={{
          color: 'primary',
          icon: <Check className='vx-icon' size={12} />,
          label: '',
          size: 'sm'
        }}
      />
    </div>
  )
}
