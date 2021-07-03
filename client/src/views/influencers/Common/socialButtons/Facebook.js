import React from 'react'
import { Facebook } from 'react-feather'
import {
  Button,
  CustomInput,
  Form,
  Label,
  Modal,
  ModalBody,
  ModalHeader
} from 'reactstrap'

const FB = window.FB

export default function FacebookComponent ({
  onComplete,
  onLogginError,
  isPageNeeded = false
}) {
  const [openModal, setOpenModal] = React.useState(false)
  const [fbContent, setFbContent] = React.useState({})
  const [fbPages, setFbPages] = React.useState([])
  React.useEffect(() => {
    FB.init({
      appId: process.env.REACT_APP_FACEBOOK_APP_ID,
      autoLogAppEvents: true,
      xfbml: true,
      version: 'v8.0'
    })
  }, [])

  const toggleModal = () => {
    setOpenModal(openModal => !openModal)
  }

  const connect = () => {
    FB.login(
      function (auth) {
        if (auth.authResponse) {
          console.log('Welcome!  Fetching your information.... ')
          FB.api(
            '/me',
            function (response) {
              const fbData = {
                platform: 'facebook',
                external_id: response.id,
                external_name: response.name,
                external_access_token: auth.authResponse.accessToken,
                external_profile_url: response.picture?.data?.url,
                min_age: response?.age_range?.min,
                max_age: response?.age_range?.max,
                gender: response.gender,
                external_link: response.link
              }
              if (isPageNeeded) {
                window.FB.api('/me/accounts', { type: 'pages' }, function (
                  pageResponse
                ) {
                  if (!pageResponse.data) return console.log('no data')
                  setFbPages(pageResponse.data)
                  toggleModal()
                  return setFbContent(fbData)
                })
                return
              }
              onComplete(fbData)
            },
            {
              fields: `email,name,id,address,age_range,birthday,gender,picture,link`
            }
          )
        } else {
          onLogginError &&
            onLogginError('User cancelled login or did not fully authorize.')
        }
      },
      {
        scope: `email,user_likes,public_profile,user_gender,user_age_range,user_location,user_photos,user_posts,user_link,pages_read_user_content,pages_read_engagement, ${
          isPageNeeded
            ? 'pages_show_list,pages_manage_metadata,pages_read_engagement,pages_manage_posts'
            : ''
        }`
      }
    )
  }

  return (
    <div>
      <Button.Ripple
        className='mt-2 ml-3'
        color='#3b5999'
        style={{ backgroundColor: '#3b5999', color: 'white' }}
        onClick={connect}
      >
        <Facebook size={14} className='mr-1' />
        Connect to Facebook
      </Button.Ripple>
      <Modal isOpen={openModal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Select Facebook Page</ModalHeader>
        <ModalBody>
          <Form>
            <Label>Select Facebook Page</Label>
            <CustomInput
              id='external_page_id'
              type='select'
              required
              onChange={e => {
                const page = fbPages.find(pag => pag.id === e.target.value)
                const updateFbContent = {
                  ...fbContent,
                  external_page_access_token: page.access_token,
                  external_page_id: page?.id,
                  external_page_url: `https://facebook.com/${page?.id}`,
                  external_page_name: page.name
                }
                setFbContent(updateFbContent)
              }}
            >
              <option></option>
              {fbPages.map(page => (
                <option key={page.id} value={page.id}>
                  {page?.name}
                </option>
              ))}
            </CustomInput>
            <Button
              color={'primary'}
              className='mt-3'
              type='button'
              onClick={e => {
                onComplete(fbContent)
              }}
            >
              Connect
            </Button>
          </Form>
        </ModalBody>
      </Modal>
    </div>
  )
}
