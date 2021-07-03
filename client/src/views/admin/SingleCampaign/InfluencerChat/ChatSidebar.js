import React from 'react'
import { Card,Button } from 'reactstrap'
import { X, Bell } from 'react-feather'
import PerfectScrollbar from 'react-perfect-scrollbar'
import ProfileAvatar from '../../../../components/ProfileAvatar'
import { startCase } from 'lodash'
import moment from 'moment'


const SingleContact = ({ chat = [], influencer, ...props }) => {
  return (
    <li
      onClick={() => props.onSelectActiveInfluencer(influencer)}
      className={`${
        props?.activeSelectedInfluencer?.id === influencer.id ? 'active' : ''
      }`}
    >
      <div className='pr-1'>
        <ProfileAvatar
          className='avatar avatar-md m-0'
          imgWidth={38}
          imgHeight={38}
          firstName={influencer.first_name}
          lastName={influencer.last_name}
          imageUrl={influencer?.profile_url}
        />
      </div>
      <div className='user-chat-info'>
        <div className='contact-info'>
          <h5 className='text-bold-600 mb-0'>
            {startCase(influencer.full_name)}
          </h5>
          <p className='truncate'>{influencer.description}</p>
        </div>
        <div className='contact-meta d-flex- flex-column'>
          <span className='float-right mb-25'>
            {moment(influencer.updated_at).calendar()}
          </span>
        </div>
      </div>
    </li>
  )
}

const SingleContactMemorized = React.memo(SingleContact)

export default function ChatSidebar (props) {
  const handleOnChange = e => {
    props.searchContacts(e.target.value)
  }

  return (
    <Card className='sidebar-content h-100'>
      <span
        className='sidebar-close-icon'
        onClick={() => props.mainSidebar(false)}
      >
        <X size={15} />
      </span>
      <div className='chat-fixed-search'>
      <div className="sidebar-profile-toggle position-relative d-inline-flex">
            <Button color='warning' onClick={props.toggle}>
              <Bell size='14' />
               Broadcast Message
            </Button>
            </div>
        {/* <div className='d-flex align-items-center'>
          <FormGroup className='position-relative has-icon-left mx-1 my-0 w-100'>
            <Input
              className='round'
              type='text'
              placeholder='Search contact or start a new chat'
            />
            <div className='form-control-position'>
              <Search size={15} />
            </div>
          </FormGroup>
        </div> */}
      </div>
      <PerfectScrollbar
        className='chat-user-list list-group'
        options={{
          wheelPropagation: false
        }}
        onYReachEnd={()=>{
          if(props.influencersMeta?.current_page === props.influencersMeta?.last_page) return 
          props.loadMore({
            page: props.influencersMeta.current_page + 1
          })
        }}
      >
        <h3 className='primary p-1 mb-0'>Chats</h3>
        <ul className='chat-users-list-wrapper media-list'>
          {props.influencers.map(influencer => (
            <SingleContactMemorized
              key={influencer.id}
              influencer={influencer}
              {...props}
            />
          ))}
        </ul>
      </PerfectScrollbar>
    </Card>
  )
}
