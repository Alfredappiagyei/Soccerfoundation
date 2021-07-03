'use strict'
const Apify = require('apify')
const got = require('got').default
const { HttpsProxyAgent} = require('hpagent')

const makeRequest = async ()=>{
  const proxyConfiguration = await Apify.createProxyConfiguration({
    groups: ['RESIDENTIAL'],
  })
  return got.extend({
    responseType: 'json',
    agent:{
      https: new HttpsProxyAgent({
        keepAlive: true,
        proxy: proxyConfiguration.newUrl(),
      }),
    },
  })
}

async function getInstagramUser (handle){
  return (await makeRequest()).get(`https://instagram.com/${handle}?__a=1`).then(response=> response.body.graphql.user)
}

async function getInstagramPosts ({ id, count =50, after= '' }){
  return (await makeRequest()).get(`https://www.instagram.com/graphql/query/?query_id=17888483320059182&id=${id}&first=${count}&after=${after}`).then(response=> response.body)
}

const computeStatsOnFirst100Posts = async (id, count=1)=>{
  let totalMedia = []
  let first50Nodes = await getInstagramPosts({ id })
  if(first50Nodes.data.user.edge_owner_to_timeline_media.page_info.has_next_page){
    let after = first50Nodes.data.user.edge_owner_to_timeline_media.page_info.end_cursor
    for (let i = 0; i < count; i++) {
      const nextNodes = await getInstagramPosts({id, after })
      if(!nextNodes.data.user.edge_owner_to_timeline_media.page_info.has_next_page) {
        break
      }
      after =nextNodes.data.user.edge_owner_to_timeline_media.page_info.end_cursor
      totalMedia.push(...nextNodes.data.user.edge_owner_to_timeline_media.edges)
    }
  }
  totalMedia = totalMedia.concat(first50Nodes.data.user.edge_owner_to_timeline_media.edges)
  return totalMedia
}

Apify.main(async ()=>{
  const { username, totatCount=4 } = await Apify.getInput()
  if(!username) {
    throw new Error('username is required')
  }
  const user = await getInstagramUser(username)
  const igMedia = await computeStatsOnFirst100Posts(user.id, totatCount)

  const output = {
    user,
    media: igMedia,
  }
  console.info('Done scrapping')
  await Apify.setValue('OUTPUT', output)
})
