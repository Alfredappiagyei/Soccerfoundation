import React from 'react'
import Sidebar from 'react-sidebar'
import NotificationSideBar from './SideBar'
import List from './List'
import NotificationsModal from './Modal'
import useQuery from '../../../../hooks/useQuery'
import '../../../../assets/scss/pages/app-todo.scss'

const mql = window.matchMedia(`(min-width: 992px)`)

export default function Notification (props) {
  const [showSideMenu, setShowSideMenu] = React.useState(false)
  const [isDocked, setIsDocked] = React.useState(mql.matches)
  const [selectedMessage, setSelectedMessage] = React.useState()
  const [filter, setFilter] = React.useState('all')
  const {
    data = { data: [], meta: { total: 0 } },
    loading,
    loadMore,
    refetch
  } = useQuery({
    endpointPath: '/notifications'
  })

  const showModal = !!selectedMessage

  const mediaQueryChanged = () => {
    setIsDocked(mql.matches)
    setShowSideMenu(false)
  }

  React.useEffect(() => {
    mql.addEventListener('change', mediaQueryChanged)
    return () => {
      mql.removeEventListener('change', mediaQueryChanged)
    }
  })


  return (
    <div className='todo-application position-relative'>
      <div
        className={`app-content-overlay ${showSideMenu ? 'show' : ''}`}
        onClick={() => {
          setShowSideMenu(false)
        }}
      />
      <Sidebar
        sidebar={
          <NotificationSideBar
            routerProps={props}
            toggleSideBar={setShowSideMenu}
            changeFilter={(value)=>{
              let query = {}
              if(value === 'is_read') query = {is_read: true }
              if(value === 'un_read') query = {is_read: false }
              setFilter(value)
              refetch(query)
            }}
            filter={filter}
          />
        }
        docked={isDocked}
        open={showSideMenu}
        sidebarClassName='sidebar-content todo-sidebar d-flex'
        touch={false}
        contentClassName='sidebar-children d-none'
      />
      <List
        toggleSideBar={setShowSideMenu}
        onSelectMessage={setSelectedMessage}
        notifications={data}
        loading={loading}
        loadMore={loadMore}
        refetch={refetch}
      />
      <NotificationsModal
        showModal={showModal}
        notification={selectedMessage}
        closeModal={setSelectedMessage}
      />
    </div>
  )
}
