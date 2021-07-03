import React from 'react'
import Select from 'react-select'
import {
  Button,
  Row,
  Col,
  FormGroup,
  Input,
  Card,
  CardBody,
  UncontrolledPopover,
  PopoverHeader,
  PopoverBody,
  CardHeader
} from 'reactstrap'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'react-feather'
import { AvForm } from 'availity-reactstrap-validation'
import AvInput from 'availity-reactstrap-validation/lib/AvInput'
import ReactPaginate from 'react-paginate'
import { history } from '../../../../history'
import * as Icons from 'react-feather'
import { startCase, sumBy } from 'lodash'
import AvGroup from 'availity-reactstrap-validation/lib/AvGroup'
import ProfileAvatar from '../../../../components/ProfileAvatar'
import Empty from '../../../../components/Empty'
import '../../../../assets/scss/plugins/extensions/react-paginate.scss'
import '../../../../assets/scss/plugins/forms/react-select/_react-select.scss'

const sortOptions = [
  'Unassigned',
  'Invited',
  'Accepted',
  'Cancelled',
  'Selected',
  'Rejected'
].map(item => ({
  value: item.toLowerCase(),
  label: item
}))

const sortMap = {
  invited: ['Reject', 'Accept'],
  accepted: ['Reject', 'Select'],
  rejected: ['Unassign'],
  selected: ['Reject']
}

const SocialAccount = ({ account }) => {
  const PlatformIcon = Icons[startCase(account.platform)]
  return (
    <div key={account.id} className='d-flex justify-content-between mt-2'>
      <PlatformIcon />
      <div className='uploads'>
        <p className='font-weight-bold font-medium-2 mb-0'>
          {account.number_of_followers || 'N/A'}
        </p>
        <span>Followers</span>
      </div>
      <div className='followers'>
        <p className='font-weight-bold font-medium-2 mb-0'>
          {account.average_likes || 'N/A'}
        </p>
        <span>Avg. Likes</span>
      </div>
      <div className='following'>
        <p className='font-weight-bold font-medium-2 mb-0'>
          {account.average_comments || 'N/A'}
        </p>
        <span>Avg. Comments</span>
      </div>
    </div>
  )
}

const SocialAccountMemorized = React.memo(SocialAccount)

const SingleInfluencer = ({ influencer, onAssign, addedInfluencers }) => {
  console.log(influencer);
  const isInviteSent = React.useMemo(
    () =>
      addedInfluencers.find(
        campaignInfluencer => campaignInfluencer.influencer_id === influencer.id
      ),
    [addedInfluencers, influencer]
  )

  return (
    <Col lg='4' md='6' sm='12'>
      <Card>
        <CardHeader className='mx-auto flex-column'>
          <h4>{startCase(influencer.full_name)}</h4>
          {/* <p>Backend Dev</p> */}
        </CardHeader>
        <CardBody className='text-center pt-0'>
          <ProfileAvatar
            className='avatar mr-1 avatar-xl'
            imageUrl={influencer.profile_url}
            firstName={influencer.first_name}
            lastName={influencer.last_name}
          />
          {influencer.userSocialAccounts.map(account => (
            <SocialAccountMemorized account={account} key={account.id} />
          ))}
          <hr className='my-2' />
          <AvForm
            onSubmit={(e, errors, values) => {
              if (errors.length) return
              onAssign({
                ...values,
                influencer_id: influencer.id
              })
            }}
          >
            <div className='item-options d-flex justify-content-between'>
              <AvGroup className='w-100'>
                {!isInviteSent ? (
                  <AvInput
                    name='amount'
                    placeholder='Enter amount'
                    type='number'
                    required
                  />
                ) : (
                  <div className='d-flex justify-content-between'>
                    {sortMap[isInviteSent?.status].map(item => (
                      <div key={item}>
                        <Button
                          type='button'
                          id={`warning${item}${influencer.id}`}
                          color='primary'
                          outline
                        >
                          {item}
                        </Button>
                        <UncontrolledPopover placement='right' target={`warning${item}${influencer.id}`}
>
                          <PopoverHeader>
                            Are you sure you want to perform this action?
                          </PopoverHeader>
                          <PopoverBody>
                            <Button
                              size='sm'
                              color='info'
                              onClick={() =>{
                                onAssign({
                                  status: `${item.toLowerCase()}ed`,
                                  influencer_id: influencer.id
                                })
                              }}
                            >
                              Yes {item}{' '}
                            </Button>
                          </PopoverBody>
                        </UncontrolledPopover>
                      </div>
                    ))}
                  </div>
                )}
              </AvGroup>
              {!isInviteSent && (
                <div className='ml-1'>
                  <Button color='primary'>
                    <div className='text-white'>Assign</div>
                  </Button>
                </div>
              )}
            </div>
          </AvForm>
        </CardBody>
      </Card>
    </Col>
  )
}

const SingleInfluencerMemorized = React.memo(SingleInfluencer)

export default function Content ({
  mainSidebar,
  influencers = [],
  meta,
  refetch,
  queryParams,
  onAssign,
  addedInfluencers = [],
  campaignId
}) {
  const [filterState, setFilterState] = React.useState({
    influencerFilter: sortOptions[0]
  })
  const parsedFilter = queryParams

  const handleFilter = view => {
    setFilterState({ ...view, view })
  }

  const handlePagination = (page = { selected: 0 }, itemPerPage) => {
    const path = `${history.location.pathname}`
    let perPage = itemPerPage
      ? itemPerPage
      : parsedFilter.perPage !== undefined
      ? parsedFilter.perPage
      : 20
    const nextPage = page.selected + 1
    // history.push(`${path}?tab=${parsedFilter.tab}&page=${nextPage}&perPage=${perPage}`)
    refetch(
      {
        page: nextPage,
        per_page: perPage
      },
      false,
      false
    )
  }

  const computeBasedOnStatus = React.useCallback(
    status => {
      const onlyInfluencerByStatus = addedInfluencers.filter(
        influencer => influencer.status === status
      )
      return {
        count: onlyInfluencerByStatus.length,
        totalAmount: sumBy(onlyInfluencerByStatus, influencer =>
          parseFloat(influencer.amount)
        )
      }
    },
    [addedInfluencers]
  )

  return (
    <div className='shop-content'>
      <Row>
        <Col sm='12'>
          <div className='ecommerce-header-items'>
            <div className='result-toggler w-25 d-flex align-items-center'>
              <div className='shop-sidebar-toggler d-block d-lg-none'>
                <Menu size={26} onClick={() => mainSidebar(true)} />
              </div>
              <div className='search-results'>{meta?.total} Result(s) Found</div>
            </div>
            <div className='view-options d-flex justify-content-end w-75'>
              <Card className='m-1'>
                <CardBody>
                  <div>
                    Invites sent: {computeBasedOnStatus('invited')?.count} |{' '}
                    {computeBasedOnStatus('invited')?.totalAmount} GHS
                  </div>
                </CardBody>
              </Card>
              <Card className='m-1'>
                <CardBody>
                  <div>
                    Invites accepted: {computeBasedOnStatus('accepted')?.count}{' '}
                    | {computeBasedOnStatus('accepted')?.totalAmount} GHS
                  </div>
                </CardBody>
              </Card>
              <Select
                className='React-Select'
                classNamePrefix='select'
                value={filterState.influencerFilter}
                name='sort'
                options={sortOptions}
                onChange={e => {
                  handleFilter({ influencerFilter: e })
                  const status = e?.value === 'unassigned' ? null : e?.value
                  refetch(
                    status
                      ? {
                          campaign_id: campaignId,
                          campaign_influencer_statuses: [status]
                        }
                      : {},
                    false,
                    false,
                    !status,
                    !!status
                  )
                }}
              />
              {/* <div className='view-btn-option'>
                <Button
                  color='white'
                  className={`view-btn ml-1 ${
                    filterState.view === 'grid-view' ? 'active' : ''
                  }`}
                  onClick={() => handleFilter('grid-view')}
                >
                  <Grid size={24} />
                </Button>
                <Button
                  color='white'
                  className={`view-btn ${
                    filterState.view === 'list-view' ? 'active' : ''
                  }`}
                  onClick={() => handleFilter('list-view')}
                >
                  <List size={24} />
                </Button>
              </div> */}
            </div>
          </div>
        </Col>
        <Col sm='12'>
          <div className='ecommerce-searchbar mt-1'>
            <FormGroup className='position-relative'>
              <Input
                className='search-product'
                disabled
                placeholder='Search Here...'
              />
              <div className='form-control-position'>
                <Search size={22} />
              </div>
            </FormGroup>
          </div>
        </Col>
        <Col sm='12'>
          {meta?.total ? (
            <Row>
              {influencers.map(influencer => (
                <SingleInfluencerMemorized
                  influencer={influencer}
                  key={influencer.id}
                  onAssign={onAssign}
                  addedInfluencers={addedInfluencers}
                />
              ))}
            </Row>
          ) : (
            <Empty
              content='No influencers found'
              className='vx-pagination separated-pagination pagination-end pagination-sm mb-0 mt-2 justify-content-center'
              url='https://pixinvent.com/demo/vuexy-react-admin-dashboard-template/demo-1/static/media/graphic-1.58c221eb.png'
            />
          )}
        </Col>
        <Col sm='12'>
          <div className='ecommerce-pagination'>
            <ReactPaginate
              previousLabel={<ChevronLeft size={15} />}
              nextLabel={<ChevronRight size={15} />}
              breakLabel='...'
              breakClassName='break-me'
              pageCount={meta?.last_page}
              containerClassName='vx-pagination separated-pagination pagination-end pagination-sm mb-0 mt-2 justify-content-center'
              activeClassName='active'
              forcePage={
                parsedFilter.page ? parseInt(parsedFilter.page - 1) : 0
              }
              onPageChange={handlePagination}
            />
            {/* <Pagination className='d-flex justify-content-center mt-2'>
              <PaginationItem className='prev-item'>
                <PaginationLink href='#' first>
                  <ChevronLeft />
                </PaginationLink>
              </PaginationItem>
              <PaginationItem active>
                <PaginationLink href='#'>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href='#'>2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href='#'>3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href='#'>4</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href='#'>5</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href='#'>6</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href='#'>7</PaginationLink>
              </PaginationItem>
              <PaginationItem href='#' className='next-item'>
                <PaginationLink href='#' last>
                  <ChevronRight />
                </PaginationLink>
              </PaginationItem>
            </Pagination> */}
          </div>
        </Col>
      </Row>
    </div>
  )
}
