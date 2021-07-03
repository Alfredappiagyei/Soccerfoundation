import React from 'react'
import { Check, FileText, Share2 } from 'react-feather'
import {
  Button,
  Card,
  CardBody,
  CardImg,
  CardImgOverlay,
  CardTitle,
  Col,
  Media,
  Row,
  UncontrolledCollapse
} from 'reactstrap'
import { startCase, upperCase } from 'lodash'
import Spinner from '../../../components/@vuexy/spinner/Loading-spinner'
import StatisticsCard from '../../../components/@vuexy/statisticsCard/StatisticsCard'
import '../../../assets/scss/pages/app-ecommerce-shop.scss'
import useQuery from '../../../hooks/useQuery'
import Empty from '../../../components/Empty'
import connectedAccount from '../../../assets/img/social_connected.png'
import Checkbox from '../../../components/@vuexy/checkbox/CheckboxesVuexy'
import useMutation from '../../../hooks/useMutation'

const SingleSocialAccount = ({ account }) => {
  return (
    <Card className='ecommerce-card'>
      <div className='card-content'>
        <div className='item-img text-center flex-column'>
          <strong className='mb-3'>{account.type}</strong>
          <Media
            className='rounded mr-2'
            object
            src={account.external_profile_url}
            alt='Generic placeholder image'
            height='112'
            width='112'
          />
          <p>{account?.external_name} </p>
          <p>@{account?.handle} </p>
        </div>
        <CardBody>
          <div className='item-name mb-5 text-center'>
            {startCase(account.platform)} Stats
            <br />
          </div>
          <div className='item-desc'>
            <Row>
              <Col xl='2' lg='2' sm='3'>
                <StatisticsCard
                  hideChart
                  iconBg='primary'
                  stat={account.number_of_followers || 0}
                  statTitle='Total Followers'
                />
              </Col>
              <Col xl='2' lg='2' sm='3'>
                <StatisticsCard
                  hideChart
                  iconBg='primary'
                  stat={account.number_of_following || 0}
                  statTitle='Total Following'
                />
              </Col>
              <Col xl='2' lg='2' sm='3'>
                <StatisticsCard
                  hideChart
                  iconBg='primary'
                  stat={account?.total_posts || 0}
                  statTitle='Total Posts'
                />
              </Col>
              <Col xl='2' lg='2' sm='3'>
                <StatisticsCard
                  hideChart
                  iconBg='warning'
                  stat={account?.average_comments || 0}
                  statTitle='Average Comments'
                />
              </Col>
              <Col xl='2' lg='2' sm='3'>
                <StatisticsCard
                  hideChart
                  iconBg='warning'
                  stat={account?.average_likes || 0}
                  statTitle='Average Likes'
                />
              </Col>

              <Col xl='2' lg='2' sm='3'>
                <StatisticsCard
                  hideChart
                  iconBg='warning'
                  stat={account?.average_engagements || 0}
                  statTitle='Average Engagements'
                />
              </Col>
              <Col xl='2' lg='2' sm='3'>
                <StatisticsCard
                  hideChart
                  iconBg='warning'
                  stat={account?.engagement_rate || 0}
                  statTitle='Engagement Rate'
                />
              </Col>
              <Col xl='2' lg='2' sm='3'>
                <StatisticsCard
                  hideChart
                  iconBg='warning'
                  stat={account?.average_earnings}
                  statTitle='Average Earnings'
                />
              </Col>
            </Row>
          </div>
        </CardBody>
      </div>
    </Card>
  )
}

const MemorizedSingleSocialAccount = React.memo(SingleSocialAccount)

export default function SocialStats ({
  user,
  isShared = false,
  existingSocialAccounts=[]
}) {
  const { loading, data: socialAccounts = existingSocialAccounts } = useQuery({
    endpointPath: '/api/influencers/social-accounts',
    initialLoad: !isShared
  })
  const { makeRequest, data } = useMutation({
    endpointPath: '/api/influencers/me/share'
  })
  const [selectedSocialAccounts, setSelectedSocialAccounts] = React.useState(
    existingSocialAccounts
  )

  React.useEffect(() => {
    setSelectedSocialAccounts(socialAccounts)
  }, [socialAccounts])

  const share = () => {
    makeRequest({
      social_accounts: selectedSocialAccounts
    })
  }

  if (loading) return <Spinner />

  return (
    <div>
      <style>{`
      .overlay-img-card .card-img-overlay, .overlay-img-card img{
        height: 34.64rem
      }
      .popover{
        width: 100%
      }
      
      `}</style>
      <div className={isShared ? 'd-none': ''}>

      <div className='d-flex flex-column flex-md-row justify-content-end invoice-header mb-1 d-none' >
        <Button
          id='includeSocialPlatform'
          className='mr-1 mb-md-0 mb-1'
          // style={{ position: 'fixed', bottom: 90, right: 0 }}
          color='primary'
        >
          <FileText size='15' />
          <span className='align-middle ml-50'>Include Social Stats</span>
        </Button>
        <Button
          className='mr-1 mb-md-0 mb-1'
          color='primary'
          onClick={() => window.print()}
        >
          <FileText size='15' />
          <span className='align-middle ml-50'>Print</span>
        </Button>
        <Button.Ripple color='primary' outline onClick={share}>
          <Share2 size='15' />
          <span className='align-middle ml-50'>Share</span>
        </Button.Ripple>
      </div>
      <UncontrolledCollapse
        placement='bottom-end'
        toggler='includeSocialPlatform'
      >
        <Card>
          <CardBody>
            {socialAccounts.map(account => {
              const isDefaultChecked = selectedSocialAccounts.some(
                acc => acc.platform === account.platform
              )
              return (
                <div className='d-inline-block mr-1' key={account?.id}>
                  <Checkbox
                    color='primary'
                    icon={<Check className='vx-icon' size={16} />}
                    label={startCase(account.platform)}
                    checked={isDefaultChecked}
                    onChange={e => {
                      const checked = e.target.checked
                      const newSelectedPlatforms = checked
                        ? [...selectedSocialAccounts, account]
                        : selectedSocialAccounts.filter(
                            selectedAccount =>
                              selectedAccount.platform !== account.platform
                          )
                      setSelectedSocialAccounts(newSelectedPlatforms)
                    }}
                  />
                </div>
              )
            })}
          </CardBody>
        </Card>
      </UncontrolledCollapse>
      </div>
      <Row>
        <Col lg={4} xs={12}>
          <Card className='text-white overlay-img-card'>
            <CardImg src={user?.profile_url} alt='overlay img' />
            <CardImgOverlay className='overlay-black d-flex flex-column justify-content-between'>
              {/* <CardTitle className='text-white'>Beautiful Overlay</CardTitle> */}
            </CardImgOverlay>
          </Card>
        </Col>
        <Col lg={8} xs={12}>
          <Card>
            <CardBody>
              <CardTitle>About</CardTitle>
              <p />
              <div className='text-justify'>{user?.description}</div>
              <div className='h5 mt-3'>Content Focus</div>
              <div className='d-flex flex-wrap'>
                {(user?.interests || []).map(interest => (
                  <div key={interest.id} style={{ marginLeft: 5 }}>
                    {upperCase(interest?.interest?.name)}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col lg={12} xs={12}>
          {selectedSocialAccounts.length ? (
            <div className='ecommerce-application'>
              <div className='list-view'>
                {selectedSocialAccounts.map(account => (
                  <MemorizedSingleSocialAccount
                    key={account.id}
                    account={account}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Empty
              content={'No social account included'}
              url={connectedAccount}
            />
          )}
        </Col>
      </Row>
    </div>
  )
}
