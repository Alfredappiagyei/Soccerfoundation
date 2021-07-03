import React from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Input,
  Row,
  Spinner
} from 'reactstrap'
import DataTable from 'react-data-table-component'
import request from '../../../../helpers/request'
import moment from 'moment'
import UserFilters from './Filters'
import { startCase } from 'lodash'
import ProfileAvatar from '../../../../components/ProfileAvatar'
import {history} from '../../../../history'

export default function Users () {
  const [loading, setLoading] = React.useState(true)
  const [users, setUsers] = React.useState({
    data: [],
    meta: {}
  })
  const [filter, setFilter] = React.useState({})

  React.useEffect(() => {
    getUsers()
  }, [])

  const getUsers = (query = filter) =>
    request
      .get('/api/admin/users', {
        params: {
          ...query,
          role: 'influencer'
        }
      })
      .then(response => {
        setUsers(response.data)
        setLoading(false)
      })

  if (loading) return <Spinner />
  return (
    <Row>
      <UserFilters
        onFilter={(query = {}) => {
          const normalizedQuery = Object.keys(query).reduce((acc, key) => {
            const value = query[key] === 'all' ? null : query[key]
            acc[key] = value
            return acc
          }, {})
          setFilter(normalizedQuery)
          getUsers(normalizedQuery)
        }}
      />
      <Col xs={12}>
        <Card>
          <CardHeader>
            <CardTitle>Influencer Users</CardTitle>
          </CardHeader>
          <CardBody>
            <div className='d-flex flex-wrap mb-1'>
              <div className='w-75 mr-1'>
                <Input placeholder='search by name, country, city, first name, last name, phone number' />
              </div>
              <div className='export-btn'>
                {/* <Button color='success'>Export as CSV</Button> */}
                <button type="button" class="btn  btn-default">Export as CSV</button>
              </div>
            </div>
            <DataTable
              className='dataTable-custom'
              data={users.data}
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
                  name: 'Phone Number',
                  selector: 'phone_number',
                  cell: row => (
                    <p className='text-bold-500 text-truncate mb-0'>
                      {row.phone_number}
                    </p>
                  )
                },
                {
                  id: 'Name',
                  name: 'Name',
                  selector: 'name',
                  sortable: true,
                  minWidth: '200px',
                  cell: row => (
                    <div className='d-flex py-xl-0 py-1'>
                      <div className='user-img ml-xl-0 ml-2'>
                        <ProfileAvatar
                          imageUrl={row.profile_url}
                          firstName={row.first_name}
                          lastName={row.lastName}
                          color='danger'
                        />
                      </div>
                      <div className='user-info text-truncate ml-xl-50 ml-0'>
                        <span
                          title={row.first_name}
                          className='d-block text-bold-500 text-truncate mb-0'
                        >
                          {row.first_name} {row.last_name}
                        </span>
                      </div>
                    </div>
                  )
                },
                {
                  name: 'Email',
                  selector: 'email',
                  cell: row => (
                    <p className='text-bold-500 text-truncate mb-0'>
                      {row.email}
                    </p>
                  )
                },
                {
                  name: 'Status',
                  selector: 'status',
                  cell: row => {
                    const color =
                      row.status === 'active' ? 'success' : 'warning'
                    return (
                      <div className={`badge badge-pill badge-light-${color}`}>
                        {row.status}
                      </div>
                    )
                  }
                },
                {
                  name: 'Approved',
                  selector: 'approved',
                  cell: row => {
                    return (
                      <div
                        className={`bullet bullet-sm ${
                          row.approved ? 'bullet-primary' : 'bullet-secondary'
                        }`}
                      ></div>
                    )
                  }
                },
                {
                  name: 'City',
                  selector: 'city',
                  cell: row => (
                    <p className='text-bold-500 text-truncate mb-0'>
                      {startCase(row.city)}
                    </p>
                  ),
                  minWidth: '220px'
                },
                {
                  name: 'Country',
                  selector: 'country',
                  cell: row => (
                    <p className='text-bold-500 text-truncate mb-0'>
                      {startCase(row.country)}
                    </p>
                  ),
                  minWidth: '150px'
                },
                {
                  name: 'Date of Birth',
                  selector: 'date_of_birth',
                  cell: row => (
                    <p className='text-bold-500 text-truncate mb-0'>
                      {row.date_of_birth}
                    </p>
                  )
                }
              ]}
              fixedHeader
              pagination
              subHeader
              paginationServer
              paginationTotalRows={users.meta?.last_page}
              paginationPerPage={filter?.per_Page || 20}
              responsive
              onChangePage={page => {
                getUsers({
                  ...filter,
                  page
                })
              }}
              onChangeRowsPerPage={rowsPerPage => {
                const newUpdate = {
                  ...filter,
                  per_page: rowsPerPage
                }
                setFilter(newUpdate)
                getUsers(newUpdate)
              }}
              onRowClicked={row=> history.push(`${history.location.pathname}/${row.id}`, row)}
            />
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}
