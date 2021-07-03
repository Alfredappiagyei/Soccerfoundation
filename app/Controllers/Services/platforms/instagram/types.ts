
export type InstagramMediaNode = {
  node:{
    edge_media_preview_like:{
      count: number
    }
    edge_media_to_comment:{
      count: number
    }
    taken_at_timestamp:number
  }
}

export type InstagramPostResponse = {
  data:{
    user:{
      edge_owner_to_timeline_media:{
        edges: InstagramMediaNode[]
        page_info:{
          has_next_page: boolean
          end_cursor: string
        }
      }
    }
  }
}

export type InstgramUser = {
  full_name: string
  biography?: string
  external_url?: string
  profile_pic_url: string
  edge_followed_by:{
    count:number
  }
  edge_follow: {
    count: number
  }
  edge_owner_to_timeline_media:{
    count: number
  }
  id: number
}
export type InstgramUserResponse = {
  graphql: {
    user: InstgramUser
  }
}

export type Feed = {
  edge_media_preview_like:{
    count: number
  }
  edge_media_to_parent_comment:{
    count: number
  }
  taken_at_timestamp:number
  id: string
  is_video: boolean
  owner:{
    id: string
    profile_pic_url: string
    username: string
    edge_followed_by:{
      count: number
    }
  }
  video_url?:string
  display_url: string
  shortcode: string
}
