import React from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Search } from 'react-feather'
import { Badge, Button, FormGroup, Input, Media } from 'reactstrap'
import '../../../../assets/scss/pages/app-email.scss'
import InfluencerDeliverable from './influencer-deliverables'
import useQuery from '../../../../hooks/useQuery'
import Spinner from '../../../../components/@vuexy/spinner/Loading-spinner'
import moment from 'moment'
import { debounce, startCase } from 'lodash'
import Empty from '../../../../components/Empty'
import noInfluencersFoundImage from '../../../../assets/img/error_user.png'
import { toast } from 'react-toastify'

const SingleInfluencerDeliverable = ({ influencer, setSelectedInfluencer }) => {
  const stats = (influencer.campaignDeliverables || []).reduce(
    (acc, deliverable) => {
      acc.total_likes += deliverable.total_likes || 0
      acc.total_comments += deliverable.total_comments || 0
      acc.total_engagements += deliverable.total_engagements || 0
      acc.retweet_count += deliverable.retweet_count || 0
      return acc
    },
    {
      total_likes: 0,
      total_comments: 0,
      total_engagements: 0,
      retweet_count: 0
    }
  )
  const status = influencer?.involvedCampaigns[0]?.status
  console.log(influencer)

  return (
    <Media
      tag='li'
      key={influencer.id}
      onClick={() => {
        setSelectedInfluencer({
          influencer,
          stats
        })
      }}
    >
      <Media className='pr-50' tag='div' left>
        <div className='avatar'>
          <Media object src={influencer.profile_url} />
        </div>
      </Media>
      <Media body>
        <div className='user-details flex-wrap'>
          <div className='mail-items'>
            <h5 className='text-bold-600 mb-25 '>
              {influencer.full_name}{' '}
              <Badge color={status === 'completed' ? 'success' : 'info'}>
                {startCase(status)}
              </Badge>
            </h5>
          </div>
          <div className='mail-meta'>
            <span className='float-right'>
              <span className='mail-date'>
                {moment(
                  influencer?.campaignDeliverables[0]?.created_at
                ).calendar()}
              </span>
            </span>
          </div>
        </div>
        <div className='mail-message'>
          <strong>Total Deliverables</strong>{' '}
          {influencer?.campaignDeliverables?.length}
          <strong className='ml-1'>Total Likes</strong> {stats.total_likes}
          <strong className='ml-1'>Total Comments</strong>{' '}
          {stats.total_comments}
          <strong className='ml-1'>Total Engagements</strong>{' '}
          {stats.total_engagements}
          <strong className='ml-1'>Total Retweets</strong> {stats.retweet_count}
        </div>
      </Media>
    </Media>
  )
}

const SingleInfluencerDeliverableMemorized = React.memo(
  SingleInfluencerDeliverable
)

export default function Delivery ({ singleCampaign, updateCampaign }) {
  const [selectedInfluencer, setSelectedInfluencer] = React.useState()
  const [inputValue, setInputValue] = React.useState('')
  const {
    data: { data = [], meta, stats={} } = {},
    loading,
    loadMore,
    refetch
  } = useQuery({
    endpointPath: `/api/admin/campaigns/${singleCampaign?.id}/deliverable/influencers`
  })

  const search = React.useCallback(
    debounce(searchValue => {
      return refetch({
        q: searchValue
      })
    }, 800),
    []
  )

  if (loading) return <Spinner />

  console.log(stats);

  return (
    <div className='email-application position-relative'>
      <style>{`
        .email-application .content-right{
            width: 100%
        }
        .email-application .email-user-list{
           height: calc(100vh - 16.5rem);

        }
        `}</style>
      <div className={`app-content-overlay`} />
      <Button className='mb-1' color='primary' onClick={async ()=>{
        await updateCampaign({ status: 'completed'})
        toast.success('Campaign Marked as Completed')
      } }>Mark As Completed</Button>

      <div className='content-right'>
        <div className='email-app-area'>
          <div className='email-app-list-wrapper'>
            <div className='email-app-list'>
              <div className='m-2'>
              Stats: {`${stats?.total_submitted}/${stats?.total}`} submitted

              </div>
              <div className='app-fixed-search'>
                <FormGroup className='position-relative has-icon-left m-0 d-inline-block d-lg-block'>
                  <Input
                    placeholder='Search Influencers by name'
                    onChange={e => {
                      setInputValue(e.target.value)
                      search(e.target.value)
                    }}
                    value={inputValue}
                  />
                  <div className='form-control-position'>
                    <Search size={15} />
                  </div>
                </FormGroup>
              </div>
              {data.length ? (
                <PerfectScrollbar
                  className='email-user-list list-group'
                  options={{
                    wheelPropagation: false
                  }}
                  onYReachEnd={e => {
                    if (meta?.current_page === meta?.last_page) return
                    loadMore({
                      page: meta?.current_page + 1
                    })
                  }}
                >
                  <ul className='users-list-wrapper media-list'>
                    {data.map(influencer => (
                      <SingleInfluencerDeliverableMemorized
                        influencer={influencer}
                        setSelectedInfluencer={setSelectedInfluencer}
                      />
                    ))}
                  </ul>
                </PerfectScrollbar>
              ) : (
                <Empty
                  url={noInfluencersFoundImage}
                  content='No influencers found'
                />
              )}
            </div>
          </div>
          <InfluencerDeliverable
            setSelectedInfluencer={setSelectedInfluencer}
            selectedInfluencer={selectedInfluencer}
            singleCampaign={singleCampaign}
          />
        </div>
      </div>
    </div>
  )
}
