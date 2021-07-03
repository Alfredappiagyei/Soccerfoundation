import React from 'react'
import { Button } from 'reactstrap'
import { X } from 'react-feather'
import PerfectScrollbar from 'react-perfect-scrollbar'
import useMutation from '../../../../hooks/useMutation'

export default function NotificationsModal (props) {
 const  { makeRequest } =   useMutation({
    endpointPath: `/notifications/${props.notification?.id}`,
    method: 'patch',
  })

  React.useEffect(()=>{
    markAsRead()
  }, [props.notification])

  const markAsRead = ()=>{
    if(!props.showModal) return 
    if(props.notification?.is_read) return
    makeRequest()
  }

  return (
    <div className={`task-sidebar ${props.showModal ? 'show' : ''}`}>
      <div className='task-header'>
        <div className='d-flex justify-content-between'>
          <div className='task-type-title text-bold-600'>
            <h3>{props.notification?.title}</h3>
          </div>
          <div className='close-icon'>
            <X
              className='cursor-pointer'
              size={20}
              onClick={() => props.closeModal()}
            />
          </div>
        </div>
      </div>
      <PerfectScrollbar>
        <div className='task-body'>
          <div className='mb-2'>
            <hr className='my-2' />
            <p>{props.notification?.message}</p>
            <div className='d-flex justify-content-end'>
              <Button.Ripple
                color='light'
                outline
                onClick={() => props.closeModal()}
              >
                Close
              </Button.Ripple>
            </div>
          </div>
        </div>
      </PerfectScrollbar>
    </div>
  )
}
