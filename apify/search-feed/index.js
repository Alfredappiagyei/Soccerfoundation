'use strict'
const Apify = require('apify')
const got = require('got').default
const { HttpsProxyAgent } = require('hpagent')

const KEY_STORE_NAME = 'FEEDSTORE'

const makeRequest = async () => {
  const proxyConfiguration = await Apify.createProxyConfiguration({
    groups: ['RESIDENTIAL'],
  })
  return got.extend({
    responseType: 'json',
    agent: {
      https: new HttpsProxyAgent({
        keepAlive: true,
        proxy: proxyConfiguration.newUrl(),
      }),
    },
  })
}

async function getInstagramUser (handle) {
  return (await makeRequest())
    .get(`https://instagram.com/${handle}?__a=1`)
    .then(response => response.body.graphql.user)
}

const getMediaDetails = async shortCode => {
  const variables = JSON.stringify({
    shortcode: shortCode,
    child_comment_count: 0,
    fetch_comment_count: 0,
    parent_comment_count: 0,
    has_threaded_comments: true,
  })
  return (await makeRequest())
    .get(
      `https://www.instagram.com/graphql/query?query_hash=eaffee8f3c9c089c9904a5915a898814&variables=${variables}`,
      {}
    )
    .then(response => response.body.data.shortcode_media)
}

async function getUserInstagramPosts (handle, count = 100) {
  const user = await getInstagramUser(handle)
  return (await makeRequest())
    .get(
      `https://www.instagram.com/graphql/query/?query_id=17888483320059182&id=${user.id}&first=${count}`
    )
    .then(
      response => response.body.data.user.edge_owner_to_timeline_media.edges
    )
}

const getHashTagPost = async hashTag => {
  return (await makeRequest())
    .get(`https://www.instagram.com/explore/tags/${hashTag}/?__a=1`)
    .then(response => response.body.graphql.hashtag.edge_hashtag_to_media.edges)
}

const hasHashTag = (str = '') => str.startsWith('#')

const transformFeed = async feed => {
  return getMediaDetails(feed.node.shortcode)
}

const scrape = async ({ text, otherStore, originalText }) => {
  const media = hasHashTag(originalText)
    ? await getHashTagPost(text)
    : await getUserInstagramPosts(text)
  const output = media ? await Promise.all(media.map(transformFeed)) : []
  await otherStore.setValue(text, output)
  return output
}

Apify.main(async () => {
  const { text, isSingleSearch = false } = await Apify.getInput()
  if (!text) {
    throw new Error('text is required')
  }
  const keyWithoutHash = text.replace(/#/gi, '')

  const otherStore = await Apify.openKeyValueStore(KEY_STORE_NAME)
  const oldOutput = await otherStore.getValue(keyWithoutHash)
  const output = oldOutput
    ? oldOutput
    : isSingleSearch
      ? await getMediaDetails(text)
      : await scrape({ originalText: text, text: keyWithoutHash, otherStore })

  console.info('Done scrapping', output)
  await Apify.setValue('OUTPUT', output)
})
