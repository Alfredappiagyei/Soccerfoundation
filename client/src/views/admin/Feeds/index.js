import React from 'react'
import { Col, Row } from 'reactstrap'
import GeneralFeeds from './GeneralFeeds'
import SocialFeeds from './SocialFeeds'
import request from '../../../helpers/request'

export default function Feeds () {
  const [loading, setLoading] = React.useState(true)
  const [loadingMore, setLoadingMore] = React.useState(true)
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
      .get('/api/admin/feeds', {
        params: {
          page,
          ...rest
        }
      })
      .then(({ data: { data, ...rest } }) => {
        setFeeds({
          data: page ? [...feeds.data, ...data] : data,
          ...rest
        })
      })
      .finally(() => {
        setLoading(false)
        setLoadingMore(false)
      })

  const onFeedAdd = feed => {
    const data = [feed, ...feeds.data]
    setFeeds({ ...feeds, data })
  }

  return (
    <Row>
      <Col xs={12} md={6} lg={6}>
        <SocialFeeds onFeedAdd={onFeedAdd} />
      </Col>
      <Col xs={12} md={6} lg={6}>
        <GeneralFeeds
          getFeeds={getFeeds}
          feeds={feeds}
          setFeeds={setFeeds}
          loading={loading}
          loadingMore={loadingMore}
          onFeedAdd={onFeedAdd}
        />
      </Col>
    </Row>
  )
}
