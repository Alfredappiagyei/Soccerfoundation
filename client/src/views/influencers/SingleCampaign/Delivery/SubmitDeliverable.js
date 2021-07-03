import { startCase } from 'lodash'
import React from 'react'
import { Plus } from 'react-feather'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  FormGroup,
  Input,
  Label,
  Spinner
} from 'reactstrap'
import PerfectScrollbar from 'react-perfect-scrollbar'
import Empty from '../../../../components/Empty'
import useQuery from '../../../../hooks/useQuery'
import Feed from '../../../../components/Feed'
import useMutation from '../../../../hooks/useMutation'
import FileUploader from '../../../../components/FileUploader'
import { toast } from 'react-toastify'

export default function SubmitDeliverable ({
  singleCampaign,
  loadingMore,
  loadDeliverables
}) {
  const [selectedPlatform, setSelectedPlatform] = React.useState()
  const [manualMediaFiles, setManualMediaFiles] = React.useState([])

  const {
    data: { data: feeds = [], meta } = {},
    loading,
    refetch,
    loadMore
  } = useQuery({
    endpointPath: '/api/influencers/me/feeds',
    initialLoad: false
  })
  const { makeRequest, loading: loadingSubmitting } = useMutation({
    endpointPath: `/api/influencers/campaigns/${singleCampaign?.id}/deliverable`
  })

  const loader = (
    <div className='text-center mb-3'>
      <Spinner size='sm' /> <br /> Please wait. This will take a while...
    </div>
  )

  const paginate = () => {
    if (meta && !meta.next_page) return
    return loadMore({
      page: meta?.next_page,
      platform: selectedPlatform
    })
  }

  const renderSocialItems = () => {
    if (selectedPlatform === 'manual_upload') return
    if (loading) return loader
    if (!feeds.length)
      return (
        <Empty
          content='No posts found'
          url='https://pixinvent.com/demo/vuexy-react-admin-dashboard-template/demo-1/static/media/graphic-1.58c221eb.png'
        />
      )
    return (
      <PerfectScrollbar onYReachEnd={paginate}>
        {feeds.map(feed => (
          <Feed
            feed={feed}
            key={feed.id}
            showPublish={false}
            showSubmit
            showViewFeed
            onSubmit={async ({ channel, id, ...rest }) => {
              await makeRequest({
                platform: channel,
                external_id: id,
                type: 'post',
                ...rest
              })
              loadDeliverables()
            }}
          />
        ))}
        {loadingMore && loader}
        <div className='mt-5 pt-5' />
      </PerfectScrollbar>
    )
  }

  const renderManualUpload = () => {
    if (selectedPlatform !== 'manual_upload') return

    return (
      <Card>
        <CardHeader>Upload your deliverabels</CardHeader>
        <CardBody>
          <FileUploader
            accept='image/*, video/*'
            folder='campaign'
            onComplete={setManualMediaFiles}
          />
          <Button
            color='primary'
            onClick={async () => {
              if (!manualMediaFiles.length)
                return toast.success('Please upload some files')
              await makeRequest({
                type: 'manual',
                media: manualMediaFiles
              })
              loadDeliverables()
            }}
          >
            Submit
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <div style={{ height: window.innerHeight - 132 }}>
      <Card style={{ marginBottom: '0.5em' }}>
        <CardHeader>Select Platform Deliverable</CardHeader>
        <CardBody>
          <FormGroup>
            <Label>Select Platform </Label>
            <Input
              type='select'
              onChange={e => {
                const value = e.target.value
                setSelectedPlatform(value)
                if (value === 'manual_upload') return
                return (
                  value &&
                  refetch({
                    platform: value
                  })
                )
              }}
            >
              <option></option>
              {(singleCampaign?.social_platforms || [])
                .concat('manual_upload')
                ?.map(platform => (
                  <option key={platform} value={platform}>
                    {startCase(platform)}
                  </option>
                ))}
            </Input>
          </FormGroup>
          {loadingSubmitting && loader}

        </CardBody>
      </Card>
      {renderSocialItems()}
      {renderManualUpload()}
    </div>
  )
}
