import React from 'react'
import { Menu, Search } from 'react-feather'
import { FormGroup, Input } from 'reactstrap'
import PerfectScrollbar from 'react-perfect-scrollbar'
import moment from 'moment'
import debounce from 'lodash/debounce'
import Spinner from '../../../../components/@vuexy/spinner/Loading-spinner'
import Empty from '../../../../components/Empty'
import noNotificationImage from '../../../../assets/img/no_notifications.png'

const SingleNotification = ({ notification = {}, onSelectMessage }) => (
  <li
    className={'todo-item'}
    key={notification.id}
    onClick={() => onSelectMessage(notification)}
  >
    <div className='todo-title-wrapper d-flex justify-content-between mb-50'>
      <div className='todo-title-area d-flex align-items-center'>
        <div className='title-wrapper d-flex'>
          <h6 className='todo-title mt-50 mx-50'>{notification.title}</h6>
        </div>
        <div className='chip-wrapper'>
          {notification.tags.map(tag => (
            <div className='chip mb-0' key={tag}>
              <div className='chip-body'>
                <span className='chip-text'>
                  <span className={'bullet bullet-primary bullet-xs'} />
                  <span className='text-capitalize ml-25'>{tag}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className=' justify-content-end'>
        {moment(notification.created_at).calendar()}
      </div>
    </div>
    <p className='todo-desc truncate mb-0'>{notification.message}</p>
  </li>
)

const MemoSingleNotification = React.memo(SingleNotification)

export default function List (props) {
  const [inputValue, setInputValue] = React.useState('')

  const search = React.useCallback(
    debounce(searchValue => {
      props.refetch({
        message: searchValue
      })
    }, 800),
    []
  )

  return ( 
    <div className='content-right'>
      <div className='todo-app-area'>
        <div className='todo-app-list-wrapper'>
          <div className='todo-app-list'>
            <div className='app-fixed-search'>
              <div
                className='sidebar-toggle d-inline-block d-lg-none'
                onClick={() => props.toggleSideBar(true)}
              >
                <Menu size={24} />
              </div>
              <FormGroup className='position-relative has-icon-left m-0 d-inline-block d-lg-block'>
                <Input
                  type='text'
                  placeholder='Search...'
                  onChange={e => {
                    setInputValue(e.target.value)
                    search(e.target.value)
                  }}
                  value={inputValue}
                />
                <div className='form-control-position'>
                  <Search size={15} />
                </div>
              </FormGroup>
            </div>
              <PerfectScrollbar
                className='todo-task-list'
                options={{
                  wheelPropagation: false
                }}
                onYReachEnd={() => {
                  if(props.loading) return 
                  if (props.notifications.meta.current_page ===props.notifications.meta.last_page) return
                  return props.loadMore({
                    page: props.notifications.meta.current_page + 1
                  })
                }}
              >
                <ul className='todo-task-list-wrapper'>
                  {props.loading ?               <Spinner />: null }
                  {props.notifications.data.length ? (
                    props.notifications.data.map(notification => (
                      <MemoSingleNotification
                        notification={notification}
                        onSelectMessage={props.onSelectMessage}
                        key={notification.id}
                      />
                    ))
                  ) : (
                    <Empty
                      content='No Notifications available'
                      url={noNotificationImage}
                    />
                  )}
                </ul>
              </PerfectScrollbar>
          </div>
        </div>
      </div>
    </div>
  )
}
