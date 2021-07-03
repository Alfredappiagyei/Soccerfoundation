import React from 'react'
import { X } from 'react-feather'
import PerfectScrollbar from 'react-perfect-scrollbar'
import * as Icons from 'react-feather'
import ProfileAvatar from '../../../../components/ProfileAvatar'
import { startCase } from 'lodash'

const SocialAccount = ({ account }) => {
  const PlatformIcon = Icons[startCase(account.platform)]
  return (
    <div key={account.id} className='d-flex justify-content-between mt-2'>
      <PlatformIcon />
      <div className='uploads'>
        <p className='font-weight-bold font-medium-2 mb-0'>
          {account.number_of_followers || 'N/A'}
        </p>
        <span>Followers</span>
      </div>
      <div className='followers'>
        <p className='font-weight-bold font-medium-2 mb-0'>
          {account.average_likes || 'N/A'}
        </p>
        <span>Avg. Likes</span>
      </div>
      <div className='following'>
        <p className='font-weight-bold font-medium-2 mb-0'>
          {account.average_comments || 'N/A'}
        </p>
        <span>Avg. Comments</span>
      </div>
    </div>
  )
}

const SocialAccountMemorized = React.memo(SocialAccount)

export default function SingleInfluencerStats (props) {
  return (
    <div
      className={`user-profile-sidebar ${
        props.influencerToShowDetails ? 'show' : null
      }`}
    >
      <header className='user-profile-header'>
        <span
          className='close-icon'
          onClick={() => props.handleShowInfluencerStats()}
        >
          <X size={24} />
        </span>
        <div className='header-profile-sidebar'>
          <ProfileAvatar
            imgWidth={66}
            imgHeight={66}
            status='online'
            className='avatar user-profile-toggle m-0 m-0 mr-1'
            imageUrl={props.influencerToShowDetails?.profile_url}
            firstName={props.influencerToShowDetails?.first_name}
            lastName={props.influencerToShowDetails?.last_name}
          />
          <h4 className='chat-user-name'>
            {props.influencerToShowDetails?.full_name}
          </h4>
        </div>
      </header>
      <PerfectScrollbar
        className='user-profile-sidebar-area p-2'
        options={{
          wheelPropagation: false
        }}
      >
        <h6>About</h6>
        <p>{props.influencerToShowDetails?.description}</p>
        <div className='mt-3'>
          {props.influencerToShowDetails?.userSocialAccounts?.map(account => (
            <SocialAccountMemorized account={account} key={account.id} />
          ))}
        </div>
      </PerfectScrollbar>
    </div>
  )
}
