/* eslint-disable max-len */

function getInstagramUser (handle){
  return axios.get(`https://instagram.com/${handle}?__a=1`).then(response=> response.data.graphql.user)
}

function getInstagramPosts ({ id, count =50, after= '' }){
  return axios.get(`https://www.instagram.com/graphql/query/?query_id=17888483320059182&id=${id}&first=${count}&after=${after}`).then(response=> response.data)
}

/*const computeStatsOnFirst100Posts = async (id)=>{
  let totalMedia = []
  let first50Nodes = await getInstagramPosts({ id })
  if(first50Nodes.data.user.edge_owner_to_timeline_media.page_info.has_next_page){
    const nextNodes = await getInstagramPosts({id, after: first50Nodes.data.user.edge_owner_to_timeline_media.page_info.end_cursor })
    totalMedia.push(...nextNodes.data.user.edge_owner_to_timeline_media.edges)
  }
  totalMedia = totalMedia.concat(first50Nodes.data.user.edge_owner_to_timeline_media.edges)
  return totalMedia
}*/
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
function getCacheStats (handle){
  return axios.get('/stats/instagram', {
    params: {
      handle,
    },
  }).then(response=> response.data)
}

function updateDomwithStats (response){
  $('#estimatedEarning').html(response.amountWords)
  $('#category').html(response.category)
  $('#engagementRateCount').html(`${response.engagementRate}%`)
  $('#engagementScore').html(`${response.engagementScore}`)
  $('#averageComments').html(numeral(Math.round(response.averageComments)).format())
  $('#averageLikesCount').html(numeral(Math.round(response.averageLikes)).format())
  $('#followerCount').html(numeral(response.followers).format())
  $('#visitProfileUrl').attr('href', `https://instagram.com/${response.handle}`)
  $('#profilePicture').attr('src', response.profilePictureUrl)
  $('.sinceDate').html(`Since ${response.sinceDate}`)
  if (response.mostRecentLikesMedia) {
    $('#mostLikedMedia').show()
    $('#mostLikedMedia .body-area').html(response.mostRecentLikesMedia.map(item=> {
      return `<a target='_blank' rel='noopener' href='https://instagram.com/p/${item.node.shortcode}'> <img src="${item.node.thumbnail_resources[0].src}" alt="img" class="img-fluid social-media-most-liked" /> </a>`
    }))
  }
  if (response.mostRecentCommentedMedia) {
    $('#mostCommentedMedia').show()
    $('#mostCommentedMedia .body-area').html(response.mostRecentCommentedMedia.map(item=> {
      return `<a target='_blank' rel='noopener' href='https://instagram.com/p/${item.node.shortcode}'> <img src="${item.node.thumbnail_resources[0].src}" alt="img" class="img-fluid social-media-most-commented" /> </a>`
    }))
  }
}

$(document).ready(async function () {
  const handle = window.handle
  const crsf = $('input[name=_csrf]').val()
  $('.mainCard').slideUp('slow')
  window.NProgress.start()
  try {
    let stats = await getCacheStats(handle)
    if(!stats){
      const igUser = await getInstagramUser(handle)
      const igMedia = await computeStatsOnFirst100Posts(igUser.id)
      const { data } = await axios.post('/stats/instagram', {
        user: igUser,
        media: igMedia,
        handle,
        _csrf: crsf,
      })
      stats =data
    }

    updateDomwithStats(stats)
    $('.mainCard').show()
    $('.loader').hide()
    window.NProgress.done()
  } catch (error) {
    console.log(error)
  }
})
