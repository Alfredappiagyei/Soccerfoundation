'use strict'
import Env from '@ioc:Adonis/Core/Env'
import { SocialChannels } from 'App/Models/Feed'
import { authorizeUser, getUserDetails, runActor } from '../../../Lib/instagram'
import engagementRef from './engagement-ref'
import { parseString } from '../../../Lib/utils'
import { InstagramMediaNode, InstgramUser, Feed } from './types'
import moment from 'moment'
import { uploadFileUrl } from 'App/Controllers/Lib/disk'

const instagramStatsActorId = Env.get(
  'APIFY_INSTAGRAM_STATS_ACTOR_ID'
) as string
const instagramSearchFeedsActorId = Env.get('APIFY_INSTAGRAM_SEARCH_FEED_ACTOR_ID') as string
const MAXIMUM_FOLLOWER_COUNT = 1000000

export const getAndTransformUser = async ({ code, redirectUri }) => {
  const auth = await authorizeUser(code, redirectUri)
  const user = await getUserDetails(auth.access_token, auth.user_id)

  return {
    external_access_token: auth.access_token,
    external_id: user.id,
    platform: SocialChannels.INSTAGRAM,
    handle: user.username,
    external_name: user?.username,
    external_link: `https://instagram.com/${user.username}`,
  }
}

export const getEngagementStats = async ({ screenName }) => {
  const stats: { media: InstagramMediaNode[], user: InstgramUser} = await runActor({
    actorId: instagramStatsActorId,
    payload: {
      username: screenName,
    },
  })
  return getStats({ media: stats.media, user: stats.user })
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

export function getStats ({
  media,
  user,
}: {
  media: InstagramMediaNode[]
  user: InstgramUser
}) {
  const totalLikesCommentsCount = media.reduce(
    (acc, singleMedia) => {
      acc.likes += singleMedia.node.edge_media_preview_like.count
      acc.comments += singleMedia.node.edge_media_to_comment.count
      acc.count++
      return acc
    },
    { count: 0, likes: 0, comments: 0 }
  )
  const averageLikes =
    totalLikesCommentsCount.likes / totalLikesCommentsCount.count || 0
  const averageComments =
    totalLikesCommentsCount.comments / totalLikesCommentsCount.count || 0
  const engagementRate = parseFloat(
    (
      ((averageLikes + averageComments) / user.edge_followed_by.count) *
      100
    ).toFixed(2)
  )
  const engagementExpectedRef = computeEngagementRateScore(
    user.edge_followed_by.count
  )

  // const mostRecentLikesMedia = sortBy(
  //   media,
  //   item => item.node.edge_media_preview_like.count
  // )
  //   .reverse()
  //   .splice(0, 3)
  // const mostRecentCommentedMedia = sortBy(
  //   media,
  //   item => item.node.edge_media_to_comment.count
  // )
  //   .reverse()
  //   .splice(0, 3)
  const engagementScore =
    engagementRate < engagementExpectedRef.score
      ? `<span id="below-average">&#8595; Below average by ${(
        engagementExpectedRef.score - engagementRate
      ).toFixed(2)}</span>`
      : '<span id="good-average">&#8593; Above average</span>'

  return {
    type: `${engagementExpectedRef.category} influencer`,
    averageLikes,
    averageComments,
    averageEngagements: Math.round(
      (totalLikesCommentsCount.likes + totalLikesCommentsCount.comments) /
        totalLikesCommentsCount.count
    ),
    totalLikes: totalLikesCommentsCount.likes,
    totalComments: totalLikesCommentsCount.comments,
    totalEngagements:
      totalLikesCommentsCount.comments + totalLikesCommentsCount.likes,
    averageEarnings: `${engagementExpectedRef.amount} GHC`,
    engagementRate,
    numberOfFollowers: user.edge_followed_by.count,
    numberOfFollowing: user.edge_follow.count,
    externalProfileUrl: user.profile_pic_url,
    externalUserName: user.full_name,
    totalPosts: user.edge_owner_to_timeline_media.count,
    engagementScore,
    external_name: user.full_name,
  }
}

export const searchFeeds = async ({ text })=>{
  const media: Feed[] = await runActor({
    actorId: instagramSearchFeedsActorId,
    payload: {
      text,
    },
    waitForFinish: 60 * 1000,
  })

  const transformed = media.map(item=>({
    link: `https://instagram.com/${item.id}`,
    created_at_channel: moment.unix(item.taken_at_timestamp).toDate(),
    author: {
      name: item?.owner?.username,
      profile_image: item.owner.profile_pic_url,
      profile_link: `https://instagram.com/${item.owner.username}`,
    },
    channel: SocialChannels.INSTAGRAM,
    external_id: item.shortcode,
    media: [
      {
        url: item.is_video ? item.video_url : item.display_url,
        type: item.is_video ? 'video': 'image',
      },
    ],
  }))

  return {
    data: transformed,
    meta: {
      next_page: null,
    },
  }
}

export const getUserPosts =({ handle })=>{
  return searchFeeds({ text: handle })
}

export const getSinglePostStats = async ({ platformId, followersCount })=>{
  const media: Feed = await runActor({
    actorId: instagramSearchFeedsActorId,
    payload: {
      text: platformId,
      isSingleSearch: true,
    },
    waitForFinish: 60 * 1000,
  })
  const totalEngagement = media?.edge_media_preview_like?.count+ media.edge_media_to_parent_comment?.count
  const engagementRate =(totalEngagement/ media.owner.edge_followed_by.count) * 100
  const engagementExpectedRef = computeEngagementRateScore(followersCount)
  const engagementScore =
    engagementRate < engagementExpectedRef.score
      ? `<span id="below-average">&#8595; Below average by ${(
        engagementExpectedRef.score - engagementRate
      ).toFixed(2)}</span>`
      : '<span id="good-average">&#8593; Above average</span>'

  return {
    engagement_rate: engagementRate.toFixed(2),
    total_comments: media.edge_media_to_parent_comment?.count,
    engagement_score: engagementScore,
    total_likes: media.edge_media_preview_like?.count,
    total_engagements: totalEngagement,
  }
}

export const reUploadMediaToS3 = async (feed)=>{
  feed.media = await Promise.all(feed.media.map(async item=>{
    item.url = await uploadFileUrl(item.url)
    return item
  }))
  return feed
}
