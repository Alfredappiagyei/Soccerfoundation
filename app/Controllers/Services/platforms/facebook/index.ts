'use strict'

import {
  generateLongUserAccessToken,
  listPosts,
  getPublicPagePosts,
  getSinglePost,
} from 'App/Controllers/Lib/facebook'
import { SocialChannels } from 'App/Models/Feed'
import engagementRef from './engagement-ref'
import moment from 'moment'
import { parseString } from 'App/Controllers/Lib/utils'

const MAXIMUM_FOLLOWER_COUNT = 1000000

const transformUserPayload = async (payload: any) => {
  if (payload.external_access_token) {
    payload.external_access_token = await generateLongUserAccessToken(
      payload.external_access_token
    )
  }
  return payload
}

const computeEngagementRateScore = totalFollowers => {
  let ref = {
    score: 0,
    amount: '0',
    category: '',
  }
  if (totalFollowers > MAXIMUM_FOLLOWER_COUNT) {
    ref = engagementRef['>1000000']
  } else {
    const ranges = Object.keys(engagementRef)
    ref = ranges.reduce((acc, range) => {
      const [lowBound, highBound] = range.split('-').map(parseString)
      if (totalFollowers >= lowBound && totalFollowers <= highBound) {
        acc = engagementRef[range]
      }
      return acc
    }, ref)
  }

  return ref
}

const getEngagementStats = async ({
  accessToken,
  followersCount = 1,
}: {
  accessToken: string
  followersCount?: number
}) => {
  const posts = await listPosts({ accessToken })

  const totalRetweetsAndLikes = posts.data.reduce(
    (acc, post) => {
      acc.comments += post.reactions?.summary?.total_count
      acc.likes += post.comments?.summary?.total_count
      acc.count++
      return acc
    },
    { comments: 0, likes: 0, count: 0 }
  )
  const averageLikes =
    totalRetweetsAndLikes.likes / totalRetweetsAndLikes.count || 0
  const averageComments =
    totalRetweetsAndLikes.comments / totalRetweetsAndLikes.count || 0
  const engagementRate = parseFloat(
    (((averageLikes + averageComments) / followersCount) * 100).toFixed(2)
  )

  const engagementExpectedRef = computeEngagementRateScore(followersCount)

  const engagementScore =
    engagementRate < engagementExpectedRef.score
      ? `<span id="below-average">&#8595; Below average by ${(
        engagementExpectedRef.score - engagementRate
      ).toFixed(2)}</span>`
      : '<span id="good-average">&#8593; Above average</span>'

  return {
    engagementScore,
    type: `${engagementExpectedRef.category} influencer`,
    averageEarnings: `${engagementExpectedRef.amount} GHC`,
    engagement_rate: engagementRate,
    recent_content: transformPosts()(posts).data.splice(0, 5),
  }
}

const transformPosts = (author = {}) => ({
  data,
  paging,
}: {
  data: Array<any>
  paging: any
}) => {
  return {
    data: data.map(post => ({
      caption: post.name,
      created_at_channel: moment(post.created_time).toDate(),
      body: post?.message || post?.description,
      link: post?.permalink_url,
      channel: SocialChannels.FACEBOOK,
      author,
      id: post.id,
      media: post?.full_picture
        ? [{ url: post?.full_picture, type: 'image' }]
        : [],
    })).filter(feed=> feed.media.length !== 0 && feed.body),
    meta: {
      next_page: paging?.next,
    },
  }
}

export const searchFeeds = async ({ text, page, socialAccessToken }) => {
  const posts = await getPublicPagePosts({
    pageName: text,
    accessToken: socialAccessToken,
    nextPage: page,
  })

  const transformedPosts = posts.data.map(post => ({
    media: (post?.attachments?.data || []).map(media => ({
      type: media.media_type === 'video' ? 'video' : 'image',
      url:
        media?.media_type === 'video' ? media?.media?.source : post.full_picture,
    })),
    created_at_channel: post.created_time,
    link: post.permalink_url,
    external_id: post.id,
    channel: SocialChannels.FACEBOOK,
    body: post.message,
    author: {
      name: post.from.name,
      profile_link: post.permalink_url,
    },
  }))

  return {
    data: transformedPosts,
    meta: {
      next_page: posts.paging.cursors.after,
    },
  }
}

const getUserPosts = async ({
  external_access_token: externalAccessToken,
  page,
  external_name: externalName,
  external_profile_url: externalProfileUrl,
}) => {
  const posts = await listPosts({
    accessToken: externalAccessToken,
    nextPageUrl: page,
  })

  return transformPosts({
    name: externalName || ' ',
    profile_image: externalProfileUrl,
  })(posts)
}

const getSinglePostStats = async ({ externalAccessToken, platformId, followersCount=1 })=>{
  const post = await getSinglePost({ id: platformId, accessToken: externalAccessToken })
  const totalEngagement = post.comments?.summary.total_count + post.reactions?.summary?.total_count
  const engagementRate =(totalEngagement/ followersCount) * 100
  const engagementExpectedRef = computeEngagementRateScore(followersCount)

  const engagementScore =
    engagementRate < engagementExpectedRef.score
      ? `<span id="below-average">&#8595; Below average by ${(
        engagementExpectedRef.score - engagementRate
      ).toFixed(2)}</span>`
      : '<span id="good-average">&#8593; Above average</span>'

  return {
    engagement_rate: engagementRate,
    total_comments: post.comments?.summary?.total_count,
    engagement_score: engagementScore,
    total_likes: post.reactions?.summary?.total_count,
    total_engagements: totalEngagement,
  }
}

export { transformUserPayload, getEngagementStats, getUserPosts,getSinglePostStats }
