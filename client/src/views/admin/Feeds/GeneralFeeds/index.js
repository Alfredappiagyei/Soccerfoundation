import React from 'react'
import { Plus } from 'react-feather'
import {
  Button,
  Card,
  CardBody,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  Row,
  Col,
  Media
} from 'reactstrap'
import { toast } from 'react-toastify'
import { useDropzone } from 'react-dropzone'
import Empty from '../../../../components/Empty'
import request from '../../../../helpers/request'
import Filter from './Filter'
import AvForm from 'availity-reactstrap-validation/lib/AvForm'
import AvGroup from 'availity-reactstrap-validation/lib/AvGroup'
import AvInput from 'availity-reactstrap-validation/lib/AvInput'
import AvFeedback from 'availity-reactstrap-validation/lib/AvFeedback'
import useFileUploader from '../../../../hooks/useFileUploader'
import Feed from '../../../../components/Feed'
import PerfectScrollbar from 'react-perfect-scrollbar'
import 'react-perfect-scrollbar/dist/css/styles.css'
import { compact, uniq } from 'lodash'
import { getAxiosErrors } from '../../../../helpers/utils'
import '../../../../assets/scss/plugins/extensions/dropzone.scss'


export default function GeneralFeeds ({ onFeedAdd, loading, loadingMore,getFeeds, feeds, setFeeds  }) {
  const [showModal, setShowModal] = React.useState(false)
  const [filters, setFilters] = React.useState({})

  const toggle = () => setShowModal(!showModal)

  const loader = (
    <div className='text-center mb-3'>
      <Spinner size='sm' /> <br /> loading...
    </div>
  )


  const onChangeStatus = async (id, status) => {
    const { data } = await request.patch(`/api/admin/feeds/${id}`, {
      is_published: status
    })
    const oldFeedIndex = feeds.data.findIndex(feed => feed.id === data.id)
    feeds.data[oldFeedIndex] = data
    setFeeds({ ...feeds })
  }

  const onDelete = async id => {
    const { data } = await request.delete(`/api/admin/feeds/${id}`)
    const newData = feeds.data.filter(feed => feed.id !== data.id)
    setFeeds({ ...feeds, data: newData })
  }

  const loadMore = React.useCallback(() => {
    if (feeds.meta.current_page === feeds.meta.last_page) return
    // setLoading(true)
    return getFeeds({ page: feeds.meta.current_page + 1 })
  })

  const renderItems = () => {
    if (loading) return loader
    if (!feeds.data.length)
      return (
        <Empty
          content='No feeds available yet'
          url='https://pixinvent.com/demo/vuexy-react-admin-dashboard-template/demo-1/static/media/graphic-1.58c221eb.png'
        />
      )
    return (
      <PerfectScrollbar onYReachEnd={loadMore}>
        {feeds.data.map(feed => (
          <Feed
            feed={feed}
            key={feed.id}
            onChangeStatus={onChangeStatus}
            onDelete={onDelete}
          />
        ))}
        {loadingMore && loader}
        <div className='mt-5 pt-5' />
      </PerfectScrollbar>
    )
  }

  return (
    <div>
      <div style={{ height: window.innerHeight - 132 }}>
        <Card style={{ marginBottom: '0.5em' }}>
          <CardBody>
            <div className='d-flex justify-content-between'>
              <div>General Feeds</div>
              <div className='d-flex'>
                <Filter setFilters={setFilters} filters={filters} getFeeds={getFeeds} />
                <Button.Ripple
                  size='sm'
                  className='ml-1'
                  outline
                  color='primary'
                  onClick={toggle}
                >
                  <Plus size={14} />
                </Button.Ripple>
              </div>
            </div>
          </CardBody>
        </Card>

        {renderItems()}
        {showModal && (
          <AddCustomFeedModal onCreated={onFeedAdd} toggle={toggle} />
        )}
      </div>
    </div>
  )
}

function AddCustomFeedModal ({ toggle, onCreated }) {
  const [creating, setCreating] = React.useState(false)
  const [profileImageUrl, setProfileImageUrl] = React.useState()
  const { onUpload, loading } = useFileUploader({
    folder: 'feeds',
    onComplete: setProfileImageUrl
  })
  const [media, setMedia] = React.useState([])
  const { onUpload: uploadMedia, loading: uploading } = useFileUploader({
    folder: 'feeds'
  })
  const { getRootProps, getInputProps } = useDropzone({ 
    accept: 'image/*, video/*',
    onDropAccepted: acceptedFiles => {
      return Promise.all(acceptedFiles.map(uploadMedia)).then(response =>
        setMedia([...media, ...response])
      )
    },
    disabled: uploading
  })

  const submit = async ({ author_link, author_name, file, ...rest }) => {
    const payload = {
      media,
      author: {
        name: author_name,
        profile_image: profileImageUrl,
        profile_link: author_link
      },
      channel: 'custom',
      ...rest
    }
    if (!payload.author.profile_image)
      return toast.warn('Please upload profile image')
    if (!media.length) return toast.warn('Please upload media for this feed')
    setCreating(true)
    try {
      const { data } = await request.post('/api/admin/feeds', payload)
      setCreating(false)
      onCreated(data)
      toggle()
    } catch (error) {
      setCreating(false)
      const axiosErrors = getAxiosErrors(error)
      const message = axiosErrors?.map
        ? uniq(axiosErrors?.map(err => err.message)).join('\n')
        : axiosErrors ?? error.message
      toast.error(message)
    }
  }

  const thumbs = compact(media).map(item => (
    <div className='dz-thumb' key={item?.url}>
      <div className='dz-thumb-inner'>
        <img src={item?.url} className='dz-img' alt={item?.url} />
      </div>
    </div>
  ))

  return (
    <Modal isOpen toggle={toggle} className='modal-lg'>
      <AvForm
        onSubmit={(e, errors, values) => {
          if (errors.length) return
          submit(values)
        }}
      >
        <ModalHeader toggle={toggle}>Vertically Centered</ModalHeader>
        <ModalBody>
          <AvGroup>
            <Label>Feed Title</Label>
            <AvInput
              name='caption'
              type='text'
              required
              placeholder='Feed Title'
            />
            <AvFeedback>Please enter feed title</AvFeedback>
          </AvGroup>
          <AvGroup>
            <Label>Feed Description (Max Length: 200)</Label>
            <AvInput
              name='body'
              type='textarea'
              required
              placeholder='Feed Description'
              rows='7'
              cols='50'
              maxLength={200}
            />
            <AvFeedback>Please enter feed description</AvFeedback>
          </AvGroup>
          <AvGroup>
            <Label>Feed Link</Label>
            <AvInput name='link' type='url' placeholder='Feed Link' />
          </AvGroup>
          <AvGroup>
            <section className='pb-1'>
              <div {...getRootProps({ className: 'dropzone' })}>
                <input name='image' {...getInputProps()} />
                <div className='mx-1 text-center'>
                  <em>(Only images and videos will be accepted)</em> <br />
                  {uploading && <Spinner size={'sm'} color='primary' />}
                </div>
              </div>
              <aside className='thumb-container mb-1'>{thumbs}</aside>
            </section>
          </AvGroup>
          <Label>Author</Label>
          <Row className='mt-1'>
            <Col xs={6}>
              <AvGroup>
                <Label>Author Name</Label>
                <AvInput
                  name='author_name'
                  type='text'
                  placeholder='Author Name'
                  required
                />
                <AvFeedback>Please enter author name</AvFeedback>
              </AvGroup>
            </Col>
            <Col xs={6}>
              <AvGroup>
                <Label>Author Link</Label>
                <AvInput
                  name='author_link'
                  type='url'
                  placeholder='Author Link'
                />
              </AvGroup>
            </Col>
            <Col>
              <Label>Author Profile Image</Label>
              <Media>
                {profileImageUrl && (
                  <Media className='mr-1' left href='#'>
                    <Media
                      className='rounded-circle'
                      object
                      src={profileImageUrl}
                      alt='User'
                      height='64'
                      width='64'
                    />
                  </Media>
                )}
                <Media className='mt-25' body>
                  <div className='d-flex flex-sm-row flex-column justify-content-start px-0'>
                    <Button.Ripple
                      tag='label'
                      className='mr-50 cursor-pointer'
                      color='primary'
                      outline
                      disabled={loading}
                    >
                      <AvGroup>
                        {loading ? (
                          <>
                            <Spinner size='sm' /> Uploading...{' '}
                          </>
                        ) : profileImageUrl ? (
                          'Change Image'
                        ) : (
                          'Upload Photo'
                        )}
                        <AvInput
                          type='file'
                          name='file'
                          multiple={false}
                          accept=''
                          id='uploadImg'
                          hidden
                          required
                          onChange={e => onUpload(e.target.files[0])}
                        />
                        <AvFeedback>Please upload profile image</AvFeedback>
                      </AvGroup>
                    </Button.Ripple>
                  </div>
                  <p className='text-muted mt-50'>
                    <small>Allowed JPG, GIF or PNG. Max size of 800kB</small>
                  </p>
                </Media>
              </Media>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color='waring' type='button' onClick={toggle}>
            Cancel
          </Button>
          <Button color='primary' type='submit'>
            {creating ? (
              <>
                {' '}
                <Spinner size='sm' /> Processing{' '}
              </>
            ) : (
              'Create'
            )}
          </Button>
        </ModalFooter>
      </AvForm>
    </Modal>
  )
}
