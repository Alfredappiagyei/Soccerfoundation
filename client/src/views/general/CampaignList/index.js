import React from 'react'
import {
  UncontrolledDropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
  Badge,
  Button
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
import Spinner from '../../../components/@vuexy/spinner/Loading-spinner'
import '../../../assets/scss/plugins/extensions/react-paginate.scss'
import '../../../assets/scss/pages/data-list.scss'
import moment from 'moment'
import roles from '../../../constants/roles'
import { startCase } from 'lodash'

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

const CustomHeader = ({ handlePagination, meta, isAdmin }) => {
  return (
    <div className='data-list-header d-flex justify-content-between flex-wrap'>
      <div className='actions-left d-flex flex-wrap'>
        {/* <UncontrolledDropdown className='data-list-dropdown mr-1'>
          <DropdownToggle className='p-1' color='primary'>
            <span className='align-middle mr-1'>Actions</span>
            <ChevronDown size={15} />
          </DropdownToggle>
          <DropdownMenu tag='div' right>
            <DropdownItem tag='a'>Archive</DropdownItem>
            <DropdownItem tag='a'>Print</DropdownItem>
            <DropdownItem tag='a'>Export</DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown> */}
        {!isAdmin && (
          <Button.Ripple
            color='primary'
            onClick={() => history.push('/brand/campaigns/create')}
          >
            Create
          </Button.Ripple>
        )}
      </div>
      <div className='actions-right d-flex flex-wrap mt-sm-0 mt-2'>
        <UncontrolledDropdown className='data-list-rows-dropdown mr-1 d-md-block d-none'>
          <DropdownToggle color='' className='sort-dropdown'>
            <span className='align-middle mx-50'>{`${meta?.total} Campaigns`}</span>
            <ChevronDown size={15} />
          </DropdownToggle>
          <DropdownMenu tag='div' right>
            <DropdownItem
              tag='button'
              onClick={() => handlePagination(undefined, 10)}
            >
              10
            </DropdownItem>
            <DropdownItem
              tag='a'
              onClick={() => handlePagination(undefined, 20)}
            >
              20
            </DropdownItem>
            <DropdownItem
              tag='a'
              onClick={() => handlePagination(undefined, 50)}
            >
              50
            </DropdownItem>
            <DropdownItem
              tag='a'
              onClick={() => handlePagination(undefined, 100)}
            >
              100
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
        {/* <div className='filter-section'>
          <Input
            type='text'
            onChange={e =>
              handleFilter({
                q: e.target.value
              })
            }
          />
        </div> */}
      </div>
    </div>
  )
}

export default function List ({ location, user, type='campaign' }) {
  const isAdmin = user?.role?.name === roles.ADMIN
  const parsedFilter = queryString.parse(location.search)
  const { data, loading, loadMore } = useQuery({
    endpointPath: `/api/${user.role?.name}/campaigns?type=${type}`,
    initQuery: {
      page: parsedFilter?.page,
      per_page: parsedFilter?.perPage
    }
  })

  React.useEffect(() => {
    if (data?.data?.length === 0 && !isAdmin) {
      history.push('/brand/campaigns/create')
    }
  }, [data, isAdmin])

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
      name: 'Campaign Name',
      selector: 'name',
      sortable: true,
      minWidth: 250
    },
    {
      name: 'Company Name',
      selector: 'company_name',
      sortable: true,
      minWidth: 250
    },
    {
      name: 'Date Created',
      selector: 'company_name',
      cell: row => moment(row.created_at).calendar()
    },
    {
      name: 'Budget',
      selector: 'budget',
      cell: row => `$ ${row.budget}`
    },
    {
      name: 'Number of Influencers',
      selector: 'budget',
      cell: row => 0
    },
    {
      name: 'Status',
      selector: 'status',
      cell: row => (
        <Badge color={row.status === 'approved' ? 'success' : 'info'}>
          {startCase(row.status)}
        </Badge>
      ),
      sortable: true
    },
    {
      name: 'Duration',
      selector: 'min_duration',
      cell: row =>
        `From ${moment(row.min_duration).calendar()} to ${moment(
          row.max_duration
        ).calendar()}`
    },
    {
      name: 'Action',
      selector: 'name',
      cell: row => (
        <Eye
          className='cursor-pointer mr-1'
          size={20}
          onClick={() =>
            history.push(`/${user?.role?.name}/campaigns/${row.id}`)
          }
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
        subHeaderComponent={
          <CustomHeader
            handlePagination={handlePagination}
            meta={data?.meta}
            totalItems={data?.data?.length}
            isAdmin={isAdmin}
          />
        }
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
