/* eslint-disable max-len */
'use strict'

import got from 'got'
import Env from '@ioc:Adonis/Core/Env'
import { createHmac } from '../utils'

const FB_APP_SECRET = Env.get('FB_APP_SECRET') as string

const FB_APP_ID = Env.get('FB_APP_ID') as string

const API_VERSION = 'v8.0'

const graphBaseUrl = `https://graph.facebook.com/${API_VERSION}`

const request = got.extend({
  prefixUrl: graphBaseUrl,
  responseType: 'json',
})

const generateAppProf = (accessToken: string) =>
  createHmac({
    secret: FB_APP_SECRET,
    data: accessToken,
  })

function generateLongUserAccessToken (accessToken: string) {
  return request
    .post('oauth/access_token', {
      json: {
        appsecret_proof: generateAppProf(accessToken),
        grant_type: 'fb_exchange_token',
        client_id: FB_APP_ID,
        client_secret: FB_APP_SECRET,
        fb_exchange_token: accessToken,
      },
    })
    .then(response => (response.body as any).access_token)
}

const listPosts = ({
  accessToken,
  nextPageUrl,
  limit = 200,
}: {
  accessToken: string
  nextPageUrl?: string
  limit?: number
}) =>
  (nextPageUrl
    ? got(nextPageUrl, {
      responseType: 'json',
    })
    : request.get('me/posts', {
      searchParams: {
        appsecret_proof: generateAppProf(accessToken),
        access_token: accessToken,
        fields:
            // eslint-disable-next-line max-len
            'id,created_time,description,event,full_picture,icon,is_popular,is_published,is_spherical,link,message,message_tags,name,permalink_url,shares, comments.summary(true),reactions.summary(total_count).type(LIKE)',
        limit,
      },
    })
  ).then(
    response =>
      response.body as {
        data: Array<any>
        paging: {
          previous: string
          next?: string
        }
      }
  )

const getPublicPagePosts = ({ pageName, accessToken, nextPage }) => {
  return request
    .get(`${pageName}/feed`, {
      searchParams: {
        appsecret_proof: generateAppProf(accessToken),
        access_token: accessToken,
        fields:
          'id,created_time,event,full_picture,icon,is_popular,is_published,is_spherical,message,message_tags,permalink_url,shares, comments.summary(true),reactions.summary(total_count).type(LIKE),attachments{media_type,media{source}},from,insights.metric(post_impressions_unique,post_impressions){values,title}',
        ...(nextPage ? { next: nextPage } : {}),
      },
    })
    .then(response => response.body as any)
}

const getSinglePost = ({ id, accessToken }) =>
  request.get(id, {
    searchParams: {
      appsecret_proof: generateAppProf(accessToken),
      access_token: accessToken,
      fields:
        'id,created_time,event,full_picture,icon,is_popular,is_published,is_spherical,message,message_tags,permalink_url,shares, comments.summary(true),reactions.summary(total_count).type(LIKE),attachments{media_type,media{source}},from,insights.metric(post_impressions_unique,post_impressions){values,title}',
    },
  }).then(response => response.body as any)

export {
  generateLongUserAccessToken,
  listPosts,
  getPublicPagePosts,
  getSinglePost,
}
