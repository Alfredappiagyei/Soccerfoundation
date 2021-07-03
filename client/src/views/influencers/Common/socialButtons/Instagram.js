import React from 'react'
import { Instagram } from 'react-feather'
import { toast } from 'react-toastify'
import { Button } from 'reactstrap'

const scopes = ['user_media', 'user_profile']

const baseRedirectUrl = process.env.NODE_ENV === 'production' ? window.location.origin : 'https://localhost:3333'

export default function InstagramComponent ({ userId, fetchSocialAccounts }) {

const redirectUrl = `${baseRedirectUrl}/api/influencers/social-accounts/instagram/callback`

const authorizeUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.REACT_APP_INSTAGRAM_APP_ID}&redirect_uri=${redirectUrl}&scope=${scopes.join(',')}&response_type=code&state=${userId}`

const connect = async () => {
  const popup = openPopup(authorizeUrl)
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
      if (!popup.location.hostname.includes('instagram.com')) {
        if (popup.location.search) {
          const query = new URLSearchParams(popup.location.search);
          const message = query.get('message')
          const type = /error/ig.test(message) ? 'error': 'success'
          toast[type](message)
          closeDialog()
          fetchSocialAccounts && fetchSocialAccounts()
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
      color='#e4405f'
      style={{ backgroundColor: '#e4405f', color: 'white' }}
      onClick={connect}
    >
      <Instagram size={14} className='mr-1' />
      Connect to Instagram
    </Button.Ripple>
  )
}
