import React from 'react'
import useLocalStorage from '../../../../hooks/useLocalStorage'
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Spinner
} from 'reactstrap'
import '../../../../assets/scss/pages/authentication.scss'
import Wizard from '../../../../components/@vuexy/wizard/WizardComponent'
import { history } from '../../../../history'
import Form1 from './Form1'
import Form2 from './Form2'
import Summary from './Summary'
import useMutation from '../../../../hooks/useMutation'
import { toast } from 'react-toastify'

const CAMPAIGN_STATE = '__CAMPAIGN_STATE'

export default function AddEditCampaign ({ editDetails, onUpdateComplete }) {
  const isEdit = !!editDetails
  const [activeStep, setActiveStep] = React.useState(0)

  const [
    formProgress = {
      formFields: {}
    },
    trackProgress
  ] = useLocalStorage(CAMPAIGN_STATE, editDetails && {
    formFields: editDetails
  })
  const { makeRequest, loading } = useMutation({
    endpointPath: '/api/brands/campaigns'.concat(
      isEdit ? `/${editDetails.id}` : ''
    ),
    method: isEdit ? 'put' : 'post'
  })

  const saveProgress = (lastStep, data) => {
    const updatedPayload = {
      lastStep,
      formFields: {
        ...formProgress.formFields,
        ...data
      }
    }
    trackProgress(updatedPayload)
    return updatedPayload
  }

  const onFinish = async () => {
    const {
      formFields: { duration, age_range, ...rest }
    } = formProgress
    const payload = {
      ...rest,
      min_age_group: age_range[0],
      max_age_group: age_range[1],
      min_duration: duration[0],
      max_duration: duration[1]
    }
    await makeRequest(payload)
    onUpdateComplete && onUpdateComplete()
    trackProgress({
      formFields: {}
    })
    toast.success(`Campaign ${isEdit ? 'updated' : 'created'} successfully`)
    if (!isEdit) history.push('/brand/campaigns')
  }

  return (
    <Card className='rounded-0 mb-0 px-2 py-1'>
      <CardHeader className='pb-1'>
        <CardTitle>
          <h4 className='mb-0'>Complete Setup</h4>
        </CardTitle>
      </CardHeader>
      <p className='px-2 auth-title'>Let setup your account</p>
      <CardBody className='pt-1 pb-0'>
        <Wizard
          activeStep={activeStep}
          steps={[
            {
              content: <Form1 defaultValues={formProgress.formFields} />,
              title: 1
            },
            {
              content: <Form2 defaultValues={formProgress.formFields} />,
              title: 2
            },
            {
              content: <Summary isEdit formData={formProgress.formFields} />,
              title: 3
            }
          ]}
          finishBtnText={isEdit ? 'Update Campaign' : 'Create Campaign'}
          onFinish={onFinish}
          onNext={(step, data) => saveProgress(step, data)}
          validate
        ></Wizard>
        {loading && <Spinner className='float-right' color='primary' />}
      </CardBody>
    </Card>
  )
}
