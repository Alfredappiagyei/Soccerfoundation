import React from 'react'
import { Spinner } from 'reactstrap'
import Empty from '../../../../components/Empty'
import Filter from './Filter'
import '../../../../assets/scss/plugins/extensions/dropzone.scss'
import Feed from '../../../../components/Feed'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { toast } from 'react-toastify'
import useQuery from '../../../../hooks/useQuery'
import useMutation from '../../../../hooks/useMutation'

export default function SocialFeeds ({ onFeedAdd }) {
  const defaultFeedsState = {
    data: null,
    meta: {
      next_page: ''
    }
  }
  const [filters, setFilters] = React.useState({})
  const {
    loading,
    refetch,
    data: feeds = defaultFeedsState,
    updateData
  } = useQuery({
    endpointPath: '/api/admin/social/feeds',
    initialLoad: false
  })
  const { makeRequest, loading: submitting } = useMutation({
    endpointPath: '/api/admin/feeds'
  })
  const getFeeds = ({ page, ...rest } = {}) => {
    refetch({
        page,
        ...rest
    })
  }

  const loader = (
    <div className='text-center mb-3'>
      <Spinner size='sm' /> <br /> loading{' '}
      {filters.channel === 'instagram' ? 'this will take a while...' : '...'}
    </div>
  )

  const onAdd = async feed => {
    try {
      const data = await makeRequest (feed)
      onFeedAdd(data)
      toast.success('Post added to feeds successfully.')
    } catch (error) {
      const message = Array.isArray(error)
        ? error.map(err => err.message).join('\n')
        : error.message
      toast.error(message)
    }
  }

  const loadMore = React.useCallback(() => {
    if (!feeds.meta.next_page) return
    return getFeeds({ ...filters, page: feeds.meta.next_page })
  })

  const renderItems = () => {
    if (Array.isArray(feeds.data) && !feeds.data?.length)
      return (
        <Empty
          content='No feeds available yet'
          url='https://pixinvent.com/demo/vuexy-react-admin-dashboard-template/demo-1/static/media/graphic-1.58c221eb.png'
        />
      )
    return (
      <PerfectScrollbar onYReachEnd={loadMore}>
        {feeds.data?.map(feed => (
          <Feed feed={feed} key={feed.id} onAdd={onAdd} />
        ))}
        {loading && loader}
        <div className='mt-5 pt-5' style={{ marginBottom: 250 }} />
      </PerfectScrollbar>
    )
  }

  return (
    <div>
      <div style={{ height: window.innerHeight - 132 }}>
        <Filter
          setFilters={submittedFilters => {
            updateData(defaultFeedsState)
            setFilters(submittedFilters)
            getFeeds(submittedFilters)
          }}
          submitting={submitting}
          loader={loader}
        />
        {renderItems()}
      </div>
    </div>
  )
}
