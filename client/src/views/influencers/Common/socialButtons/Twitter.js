import React from 'react'
import { Twitter } from 'react-feather'
import { toast } from 'react-toastify'
import { Button } from 'reactstrap'
import request from '../../../../helpers/request'

export default function TwitterComponent ({fetchSocialAccounts}) {
  const connect = async () => {
    const { data } = await request.get(
      '/api/influencers/social-accounts/twitter/auth'
    )
    const popup = openPopup(data.url)
    const polling = setInterval(() => {
      if (!popup || popup.closed || popup.closed === undefined) {
        toast.error('Popup has been closed by user')
        clearInterval(polling)
      }
      const closeDialog = () => {
        clearInterval(polling)
        popup.close()
      }
      try {
        if (!popup.location?.hostname?.includes('api.twitter.com')) {
          if (popup.location.search) {
            const query = new URLSearchParams(popup.location.search);
            const message = query.get('message')
            const type = /error/ig.test(message) ? 'error': 'success'
            toast[type](message)
            fetchSocialAccounts()
            closeDialog()
          }
        }
      } catch (error) {
      }
    }, 500)
  }

  const openPopup = url => {
    const width = 600
    const height = 400
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2
    let params = `width=${width},height=${height},left=${left},top=${top}`
    return window.open(url, '', params)
  }

  return (
    <Button.Ripple
      className='mt-2 ml-3'
      color='#55acee'
      style={{ backgroundColor: '#55acee', color: 'white' }}
      onClick={connect}
    >
      <Twitter size={14} className='mr-1' />
      Connect to Twitter
    </Button.Ripple>
  )
}
