import React from 'react'
import { Spinner } from 'reactstrap'
import request from '../../../helpers/request'
import PerfectScrollbar from 'react-perfect-scrollbar'
import FeedList from '../../../components/Feed'
import Empty from '../../../components/Empty'

export default function Feed ({ user }) {
  const [loading, setLoading] = React.useState(true)
  const [feeds, setFeeds] = React.useState({
    data: [],
    meta: {
      last_page: 0,
      current_page: 0,
      total: 0
    }
  })

  React.useEffect(() => {
    getFeeds()
  }, [])

  const getFeeds = ({ page, ...rest } = {}) =>
    request
      .get('/api/influencers/feeds', {
        params: {
          page,
          ...rest
        }
      })
      .then(({ data: { data, ...rest } }) => {
        setFeeds({
          data: [...feeds.data, ...data].map(checkIfUserHasLiked),
          ...rest
        })
      })
      .finally(() => {
        setLoading(false)
      })

      const checkIfUserHasLiked = (feed)=>{
        const hasLiked = (feed?.likes || []).find(like=>{
          return like.user_id === user?.id
        })
        feed.has_liked = !!hasLiked
        return {...feed}
      }

      const onLike = async ({ id }, isLiked=false)=>{
        const { data } = await request.patch(`/api/influencers/feeds/${id}/likes`, {
          is_liked: isLiked
        })
        const index = feeds.data.findIndex(feed=> feed.id === id)
        feeds.data[index] = checkIfUserHasLiked(data)
        setFeeds({
          ...feeds
        })
      }

  const loader = (
    <div className='text-center mb-3'>
      <Spinner size='sm' /> <br /> loading...
    </div>
  )

  const loadMore = React.useCallback(() => {
    if (feeds.meta.current_page === feeds.meta.last_page) return
    return getFeeds({ page: feeds.meta.current_page + 1 })
  })

  if (Array.isArray(feeds.data) && !feeds.data?.length)
    return (
      <Empty
        content='No feeds available yet'
        url='https://pixinvent.com/demo/vuexy-react-admin-dashboard-template/demo-1/static/media/graphic-1.58c221eb.png'
      />
    )

  return (
    <PerfectScrollbar onYReachEnd={loadMore}>
      {feeds.data?.map(feed => {
        return (
          <FeedList feed={feed} showPublish={false} key={feed.id} onLike={onLike} />
        )
      })}
      {loading && loader}
      <div className='mt-5 pt-5' style={{ marginBottom: 20 }} />
    </PerfectScrollbar>
  )
}
