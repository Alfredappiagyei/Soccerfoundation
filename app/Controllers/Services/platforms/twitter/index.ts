'use strict'

import makeClient from '../../../Lib/twitter'
import Env from '@ioc:Adonis/Core/Env'
import moment from 'moment'
import { SocialChannels } from 'App/Models/Feed'
import { parseString } from '../../../Lib/utils'
import engagementRef from './engagement-ref'
const MAXIMUM_FOLLOWER_COUNT = 1000000

const twitterBearerToken = Env.get('TWITTER_BEARER_TOKEN')

const getTweets = ({
  accessToken,
  accessTokenSecret,
  text,
  returnRaw = false,
}: {
  accessToken?: string
  accessTokenSecret?: string
  text: string
  returnRaw?: boolean
}) => (nextPage?: string) =>
  makeClient({
    accessToken,
    accessSecret: accessTokenSecret,
    ...(accessToken ? {} : { bearToken: twitterBearerToken as string }),
  })
    .get('/search/tweets', {
      q: `${text}`,
      include_entities: true,
      count: 100,
      ...(nextPage ? { max_id: nextPage } : {}),
    })
    .then(data => (returnRaw ? data : transformTweetsResponse(data)))

export const getAndTransformUser = async ({
  oauth_verifier: oauthVerifier,
  oauth_token: oauthToken,
}) => {
  const auth = await makeClient().client.getAccessToken({
    oauth_token: oauthToken,
    oauth_verifier: oauthVerifier,
  })
  const user = await makeClient({
    accessToken: auth.oauth_token,
    accessSecret: auth.oauth_token_secret,
  }).get('/account/verify_credentials', { stringify_ids: true })

  return {
    external_id: auth.user_id,
    external_name: user.name,
    handle: user.screen_name,
    external_access_token: auth.oauth_token,
    external_access_token_secret: auth.oauth_token_secret,
    external_profile_url: user.profile_image_url_https,
    number_of_followers: user.followers_count,
    number_of_following: user.friends_count,
    total_posts: user?.statuses_count,
    external_link: `https://twitter.com/${user.name}`,
  }
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

export const getEngagementStats = async ({
  accessToken,
  accessTokenSecret,
  screenName,
  followersCount,
}: {
  accessToken: string
  accessTokenSecret: string
  screenName: string
  followersCount: number
}) => {
  const tweets: Array<any> = await makeClient({
    accessSecret: accessTokenSecret,
    accessToken: accessToken,
  }).get('statuses/user_timeline', {
    screen_name: screenName,
    count: 400,
  })
  const totalRetweetsAndLikes = tweets.reduce(
    (acc, tweet) => {
      acc.retweets += tweet.retweet_count
      acc.likes += tweet.favorite_count
      acc.count++
      return acc
    },
    { retweets: 0, likes: 0, count: 0 }
  )
  const averageLikes =
    totalRetweetsAndLikes.likes / totalRetweetsAndLikes.count || 0
  const averageComments =
    totalRetweetsAndLikes.retweets / totalRetweetsAndLikes.count || 0
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
    type: `${engagementExpectedRef.category} influencer`,
    average_likes: averageLikes,
    average_comments: averageComments,
    average_earnings: `${engagementExpectedRef.amount} GHC`,
    engagement_rate: engagementRate,
    engagement_score: engagementScore,
    recent_content: transformTweetsResponse({
      statuses: tweets,
      search_metadata: {},
    }).data.splice(0, 5),
    averageEngagements: Math.round(
      (totalRetweetsAndLikes.retweets + totalRetweetsAndLikes.likes) /
        totalRetweetsAndLikes.count
    ),
  }
}

export const searchFeeds = ({
  text,
  page: nextPage,
}: {
  text: string
  page?: string
}) => getTweets({ text })(nextPage)

const transformTweetsResponse = ({
  search_metadata: searchMetaData,
  statuses,
}: {
  statuses: Array<any>
  search_metadata: {
    next_results?: string
    refresh_url?: string
  }
}) => {
  const transformed = statuses.map(status => {
    return {
      body: status.text,
      created_at_channel: moment(
        status.created_at,
        'ddd MMM DD HH:mm:ss Z YYYY'
      ).toDate(),
      channel: SocialChannels.TWITTER,
      link: `https://twitter.com/${status?.user?.screen_name}/status/${status?.id_str}`,
      author: {
        name: status?.user?.name,
        profile_image: status?.user?.profile_image_url_https,
        profile_link: `https://twitter.com/${status?.user?.screen_name}`,
      },
      media: status.extended_entities
        ? (status.extended_entities?.media || []).map(entity => {
          const type = entity?.type === 'photo' ? 'image' : 'video'
          return {
            type: type,
            url:
                type === 'image'
                  ? entity?.media_url_https
                  : entity.video_info?.variants[0]?.url,
          }
        })
        : (status.entities?.media || []).map(item => {
          return {
            url: item.media_url_https,
            type: 'image',
          }
        }),
      external_id: status?.id_str,
    }
  })

  const nextPage = searchMetaData.next_results
    ?.split('?max_id=')[1]
    ?.split('&')[0]

  return {
    data: transformed,
    meta: {
      next_page: nextPage,
    },
  }
}

export const getUserPosts = ({
  page,
  external_access_token: externalAccessToken,
  external_access_token_secret: externalAccessSecret,
  handle,
}) =>
  getTweets({
    text: `from:${handle}`,
    accessToken: externalAccessToken,
    accessTokenSecret: externalAccessSecret,
  })(page)

export const getSinglePostStats = async ({
  externalAccessToken,
  externalAccessSecret,
  platformId,
}) => {
  const tweet = await makeClient({
    accessSecret: externalAccessSecret,
    accessToken: externalAccessToken,
  }).get('statuses/show', { id: platformId })
  const totalEngagement = tweet.retweet_count + tweet.favorite_count
  const engagementRate =(totalEngagement/ tweet?.user?.followers_count) * 100
  const engagementExpectedRef = computeEngagementRateScore(tweet?.user?.followers_count)

  const engagementScore =
    engagementRate < engagementExpectedRef.score
      ? `<span id="below-average">&#8595; Below average by ${(
        engagementExpectedRef.score - engagementRate
      ).toFixed(2)}</span>`
      : '<span id="good-average">&#8593; Above average</span>'

  return {
    engagement_rate: engagementRate,
    retweet_count: tweet.retweet_count,
    engagement_score: engagementScore,
    total_likes: tweet.favorite_count,
    total_engagements: totalEngagement,
  }
}
