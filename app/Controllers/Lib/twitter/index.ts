'use strict'
import Env from '@ioc:Adonis/Core/Env'
import got from 'got/dist/source'
import Twitter from 'twitter-lite'
import crypto from 'crypto'
import OAuth from 'oauth-1.0a'
import queryString from 'querystring'

const TWITTER_CONSUMER_KEY = Env.get('TWITTER_CONSUMER_KEY') as string
const TWITTER_CONSUMER_SECRET = Env.get(
  'TWITTER_CONSUMER_SECRET'
) as string

const baseRedirectUrl =
  process.env.NODE_ENV === 'production' ? Env.get('APP_URL') : 'http://localhost:3333'

const createOauthClient = () => {
  const client = new OAuth({
    consumer: { key: TWITTER_CONSUMER_KEY, secret: TWITTER_CONSUMER_SECRET },
    signature_method: 'HMAC-SHA1',
    hash_function (baseString, key) {
      return crypto
        .createHmac('sha1', key)
        .update(baseString)
        .digest('base64')
    },
  })

  return client
}

export default function ({accessToken, accessSecret, bearToken}: {
  accessToken?: string
  accessSecret?: string
  bearToken?: string
}={}){
  const oauthClient = createOauthClient()
  const client = new Twitter({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token_key: accessToken,
    access_token_secret: accessSecret,
    bearer_token: bearToken,
  })

  return {
    getAuthUrl  (userId: number) {
      const redirectUrl = `${baseRedirectUrl}/api/influencers/social-accounts/twitter/callback?state=${userId}`
      return client.getRequestToken(redirectUrl)
        .then(
          body =>
            `https://api.twitter.com/oauth/authorize?oauth_token=${
              (body as any).oauth_token
            }`
        )
    },
    client,
    get: (path:string, query={})=>{
      const url = `https://api.twitter.com/1.1/${path}.json?${queryString.stringify(query)}`
      return got.get(url,{
        headers: oauthClient.toHeader(oauthClient.authorize({
          url,
          method: 'GET',
        }, {
          key: accessToken as string,
          secret: accessSecret as string,
        })) as any,
        responseType: 'json',
      }).then(e=> e.body as any)
    },
    getNewLab: (path, query={})=>{
      return got.get(`https://api.twitter.com${path}`,{
        searchParams: query,
        headers: {
          'Authorization': `Bearer ${bearToken}`,
        },
      }).then(e=> e.body as any)
    },
  }
}
