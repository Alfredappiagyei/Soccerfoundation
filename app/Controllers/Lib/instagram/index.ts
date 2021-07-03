'use strict'

import Env from '@ioc:Adonis/Core/Env'
import got from 'got/dist/source'
import request from './request'

const clientId = Env.get('IG_APP_ID') as string
const clientSecret = Env.get('IG_APP_SECRET') as string

const apifToken = Env.get('APIFY_TOKEN') as string

export const authorizeUser = (
  code: string,
  redirectUri: string
): Promise<{
  access_token: string
  user_id: number
}> => {
  return request
    .post('https://api.instagram.com/oauth/access_token', {
      form: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      },
      responseType: 'json',
    })
    .then(response => {
      return request
        .get('https://graph.instagram.com/access_token', {
          searchParams: {
            grant_type: 'ig_exchange_token',
            client_secret: clientSecret,
            access_token: (response.body as any).access_token,
          },
          responseType: 'json',
        })
        .then(resp => {
          return Object.assign({}, resp.body, {
            user_id: (response.body as any).user_id,
          }) as any
        })
    })
}

export const getUserDetails = (accessToken: string, userId: number) => {
  return request
    .get(`https://graph.instagram.com/${userId}`, {
      searchParams: {
        fields: 'username,media_count,account_type',
        access_token: accessToken,
      },
      responseType: 'json',
    })
    .then(response => response.body) as Promise<{
      id: string
      username: string
      media_count: number
      account_type: string
    }>
}

export const runActor = ({payload={}, waitForFinish=120, actorId }) => {
  return got.post(`https://api.apify.com/v2/acts/${actorId}/run-sync`,{
    searchParams:{
      token: apifToken,
      waitForFinish,
      outputRecordKey: 'OUTPUT',
    },
    json:payload,
    responseType:'json',
  }).then(response=> response.body as any)
}
