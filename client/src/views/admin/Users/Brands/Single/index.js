import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Media,
  Row,
  Col,
  Button,
  Label,
  UncontrolledCollapse
} from 'reactstrap'
import { startCase } from 'lodash'
import moment from 'moment'
import { Link } from 'react-router-dom'
import '../../../../../assets/scss/pages/users.scss'
import request from '../../../../../helpers/request'
import Spinner from '../../../../../components/@vuexy/spinner/Loading-spinner'
import ProfileAvatar from '../../../../../components/ProfileAvatar'
import Empty from '../../../../../components/Empty'
import AvGroup from 'availity-reactstrap-validation/lib/AvGroup'
import AvInput from 'availity-reactstrap-validation/lib/AvInput'
import AvForm from 'availity-reactstrap-validation/lib/AvForm'
import { AvFeedback } from 'availity-reactstrap-validation'

export default function SingleInfluencerUser ({ history }) {
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState()

  React.useEffect(() => {
    getUser()
  }, [])

  const getUser = () =>
    request
      .get(`/api/admin/users/${history.location.state?.id}`)
      .then(response => {
        setUser(response.data)
        setLoading(false)
      })

  const updateUserStatus = async (payload = {}) => {
    setLoading(true)
    const { data } = await request.post(
      '/api/admin/users/status',
      {
        ...payload,
        user_id: user.id
      }
    )
    setUser(data)
    setLoading(false)
  }

  if (loading) return <Spinner />
  return (
    <React.Fragment>
      <Row>
        <Col sm='12'>
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardBody>
              <Row className='mx-0' col='12'>
                <Col className='pl-0' sm='12'>
                  <Media className='d-sm-flex d-block'>
                    <Media className='mt-md-1 mt-0' left>
                      <ProfileAvatar imgHeight='112px' imgWidth='112px' color="danger" size='xl' imageUrl={user?.profile_url} im firstName={user?.business_name} />
                    </Media>
                    <Media body>
                      <Row>
                        <Col sm='9' md='6' lg='5'>
                          <div className='users-page-view-table'>
                            <div className='d-flex user-info'>
                              <div className='user-info-title font-weight-bold'>
                                Phone Number
                              </div>
                              <div>{user?.phone_number}</div>
                            </div>
                            <div className='d-flex user-info'>
                              <div className='user-info-title font-weight-bold'>
                                Business Name
                              </div>
                              <div>
                                {user?.business_name}
                              </div>
                            </div>
                            <div className='d-flex user-info'>
                              <div className='user-info-title font-weight-bold'>
                                Email
                              </div>
                              <div className='text-truncate'>
                                <span>{user?.email}</span>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col md='12' lg='5'>
                          <div className='users-page-view-table'>
                            <div className='d-flex user-info'>
                              <div className='user-info-title font-weight-bold'>
                                Status
                              </div>
                              <div
                                className={`badge badge-pill badge-light-${
                                  user?.status === 'active'
                                    ? 'success'
                                    : 'warning'
                                }`}
                              >
                                {startCase(user?.status)}
                              </div>
                            </div>
                            <div className='d-flex user-info'>
                              <div className='user-info-title font-weight-bold'>
                                City
                              </div>
                              <div>{user?.city}</div>
                            </div>
                            <div className='d-flex user-info'>
                              <div className='user-info-title font-weight-bold'>
                                Country
                              </div>
                              <div>
                                <span>{user?.country}</span>
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Media>
                  </Media>
                </Col>
                <Col className='mt-1 pl-0' sm='12'>
                  <div className='d-flex'>
                    <Button.Ripple color='danger' outline>
                      <span className='align-middle ml-50'>Block Account</span>
                    </Button.Ripple>
                    <Button.Ripple
                      className='ml-2'
                      color={'success'}
                      outline
                      onClick={() =>
                        updateUserStatus({
                          approved: true
                        })
                      }
                    >
                      <span className='align-middle ml-50'>Approve</span>
                    </Button.Ripple>
                    <Button.Ripple
                      className='ml-2'
                      color={'danger'}
                      outline
                      id='rejectReason'
                    >
                      <span className='align-middle ml-50'>
                        Toggle to Reject
                      </span>
                    </Button.Ripple>
                  </div>
                  <UncontrolledCollapse toggler='#rejectReason'>
                    <AvForm
                      className='mt-2'
                      onSubmit={(e, errors, values) => {
                        if (errors.length) return
                        return updateUserStatus({
                          approved: false,
                          ...values
                        })
                      }}
                    >
                      <AvGroup>
                        <Label>Rejection Reason</Label>
                        <AvInput
                          type='select'
                          required
                          name='rejection_reason'
                          id='rejection_reason'
                        >
                          <option></option>
                          <option value='Not enough following'>
                            Not enough following
                          </option>
                          <option value='Quality of followers'>
                            Quality of followers
                          </option>
                          <option value='Connect more socials accounts'>
                            Connect more socials accounts
                          </option>
                          <option value={'Brand profiles not allowed'}>
                            Brand profiles not allowed
                          </option>
                        </AvInput>
                        <AvFeedback>Please select a reason</AvFeedback>
                      </AvGroup>

                      <Button.Ripple type='submit' color='primary' outline>
                        {' '}
                        Reject{' '}
                      </Button.Ripple>
                    </AvForm>
                  </UncontrolledCollapse>

                  {/* <div>
                    <Button.Ripple
                      className='ml-2'
                      color={user?.approved ? 'warning' : 'success'}
                      outline
                      onClick={() => updateUserStatus(!user.approved)}
                    >
                      <span className='align-middle ml-50'>
                        {user.approved ? 'Disapprove' : 'Approve'}
                      </span>
                    </Button.Ripple>
                  </div>
                  <div>
                    <Input type='select'>
                      <option>Select some options</option>
                    </Input>
                  </div> */}
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
        <Col sm='12' md='12'>
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardBody>
              <div className='users-page-view-table'>
                <div className='d-flex user-info'>
                  <div className='user-info-title font-weight-bold'>
                    Date Created
                  </div>
                  <div>{moment(user?.created_at).calendar()}</div>
                </div>
                <div className='d-flex user-info'>
                  <div className='user-info-title font-weight-bold'>
                    Birth Date
                  </div>
                  <div>
                    {' '}
                    {user?.date_of_birth &&
                      moment(user?.date_of_birth).calendar()}
                  </div>
                </div>
                <div className='d-flex user-info'>
                  <div className='user-info-title font-weight-bold'>Mobile</div>
                  <div>+65958951757</div>
                </div>
                <div className='d-flex user-info'>
                  <div className='user-info-title font-weight-bold'>
                    About User
                  </div>
                  <div className='text-wrap'>
                    <span>{user?.description}</span>
                  </div>
                </div>
                <div className='d-flex user-info'>
                  <div className='user-info-title font-weight-bold'>
                    Languages
                  </div>
                  <div className='text-truncate'>
                    <span>English, French</span>
                  </div>
                </div>
                <div className='d-flex user-info'>
                  <div className='user-info-title font-weight-bold'>Gender</div>
                  <div className='text-truncate'>
                    <span>Female</span>
                  </div>
                </div>
                <div className='d-flex user-info'>
                  <div className='user-info-title font-weight-bold'>
                    Contact
                  </div>
                  <div className='text-truncate'>
                    <span>email, message, phone</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm='12' md='12'>
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardBody>
              {!user?.userSocialAccounts?.length ? (
                <Empty
                  url='https://pixinvent.com/demo/vuexy-react-admin-dashboard-template/demo-1/static/media/graphic-1.58c221eb.png'
                  title='No Connected Social Accounts'
                />
              ) : (
                <div className='users-page-view-table'>
                  {user.userSocialAccounts.map(account => {
                    return (
                      <div key={account.id} className='d-flex user-info'>
                        <div className='user-info-title font-weight-bold'>
                          Twitter
                        </div>
                        <Link>
                          <div className='text-truncate'>
                            <span>https://twitter.com/crystal</span>
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  )
}
