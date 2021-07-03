import React from 'react'
import {
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Media,
  Badge
} from 'reactstrap'
import PerfectScrollbar from 'react-perfect-scrollbar'
import * as Icon from 'react-feather'
import Empty from '../../../components/Empty'
import moment from 'moment'
import { Link } from 'react-router-dom'
import ProfileAvatar from '../../../components/ProfileAvatar'

const UserDropdown = props => {
  return (
    <DropdownMenu right>
      <DropdownItem tag='a' href='#'>
        <Icon.User size={14} className='mr-50' />
        <span className='align-middle'>Edit Profile</span>
      </DropdownItem>
      <DropdownItem tag='a' href='#'>
        <Icon.Mail size={14} className='mr-50' />
        <span className='align-middle'>My Inbox</span>
      </DropdownItem>
      <DropdownItem tag='a' href='#'>
        <Icon.CheckSquare size={14} className='mr-50' />
        <span className='align-middle'>Tasks</span>
      </DropdownItem>
      <DropdownItem tag='a' href='#'>
        <Icon.MessageSquare size={14} className='mr-50' />
        <span className='align-middle'>Chats</span>
      </DropdownItem>
      <DropdownItem tag='a' href='#'>
        <Icon.Heart size={14} className='mr-50' />
        <span className='align-middle'>WishList</span>
      </DropdownItem>
      <DropdownItem divider />
      <DropdownItem
        tag='a'
        href='#'
        onClick={e => {
          props.logout()
        }}
      >
        <Icon.Power size={14} className='mr-50' />
        <span className='align-middle'>Log Out</span>
      </DropdownItem>
    </DropdownMenu>
  )
}

const SingleNotificationMessage = ({ notification }) => (
  <div className='d-flex justify-content-between'>
    <Media className='d-flex align-items-start'>
      <Media body>
        <Media heading className='primary media-heading' tag='h6'>
          {notification?.title}
        </Media>
        <p className='notification-text'>{notification.message}</p>
      </Media>
      <small>
        <time className='media-meta' dateTime='2015-06-11T18:29:20+08:00'>
          {moment(notification.created_at).calendar()}
        </time>
      </small>
    </Media>
  </div>
)

const MemorizedSingleNotificationMessage = React.memo(SingleNotificationMessage)

function NavbarUser (props) {
  const notificationComponent = (
    <>
      <li className='dropdown-menu-header'>
        <div className='dropdown-header mt-0'>
          <h3 className='text-white'>
            {props?.notifications?.meta?.total} New
          </h3>
          <span className='notification-title'>App Notifications</span>
        </div>
      </li>
      <PerfectScrollbar
        className='media-list overflow-hidden position-relative'
        options={{
          wheelPropagation: false
        }}
      >
        {(props.notifications?.data || []).map(notification => (
          <MemorizedSingleNotificationMessage
            notification={notification}
            key={notification.id}
          />
        ))}
      </PerfectScrollbar>
      <li className='dropdown-menu-footer'>
        <DropdownItem tag='a' className='p-1 text-center'>
          <Link to={props.notifications?.readMoreUrl}>
            <span className='align-middle'>Read all notifications</span>
          </Link>
        </DropdownItem>
      </li>
    </>
  )
  
  return (
    <ul className='nav navbar-nav navbar-nav-user float-right'>
      <UncontrolledDropdown tag='li' className='dropdown-notification nav-item'>
        <DropdownToggle tag='a' className='nav-link nav-link-label'>
          <Icon.Bell size={21} />
          <Badge pill color='primary' className='badge-up'>
            {props.notifications?.meta?.total}
          </Badge>
        </DropdownToggle>
        <DropdownMenu tag='ul' right className='dropdown-menu-media'>
          {props.notifications?.data?.length ? (
            notificationComponent
          ) : (
            <Empty content='No new notifications' />
          )}
        </DropdownMenu>
      </UncontrolledDropdown>

      <UncontrolledDropdown tag='li' className='dropdown-user nav-item'>
        <DropdownToggle tag='a' className='nav-link dropdown-user-link'>
          <div className='user-nav d-sm-flex d-none'>
            <span className='user-name text-bold-600'>{props.userName}</span>
            <span className='user-status'>Available</span>
          </div>
          <span data-tour='user'>
            <ProfileAvatar
              imageUrl={props.userImg}
              firstName={props?.userName}
              color='primary'
            />
          </span>
        </DropdownToggle>
        <UserDropdown {...props} />
      </UncontrolledDropdown>
    </ul>
  )
}
export default NavbarUser
