import React from 'react'
import { compact } from 'lodash'
import { useDropzone } from 'react-dropzone'
import useFileUploader from '../../hooks/useFileUploader'
import { Button, Spinner } from 'reactstrap'
import '../../assets/scss/plugins/extensions/dropzone.scss'
import { File, FileMinus, Trash } from 'react-feather'

export default function FileUploader ({
  accept = 'image/*, video/*, .pdf, .doc, .mp3,.csv',
  onComplete,
  folder,
  showPreview = true,
  onlyIcon = false,
  isMultiple= true,
  defaultMedia=[]
}) {
  const { onUpload: uploadMedia, loading: uploading } = useFileUploader({
    folder
  })
  const [media, setMedia] = React.useState(defaultMedia)

  const { getRootProps, getInputProps } = useDropzone({
    accept,
    onDropAccepted: acceptedFiles => {
      return Promise.all(acceptedFiles.map(uploadMedia)).then(response => {
        const mergedMedia = isMultiple ? [...media, ...response]: response
        setMedia(mergedMedia)
        setComplete(mergedMedia)
      })
    },
    disabled: uploading,
    multiple: isMultiple
  })

  const setComplete = (allMedia)=>{
    onComplete &&  onComplete(allMedia)
    !showPreview && setMedia([])
  }

  const removeItem = (url)=>{
    const filteredMedia = media.filter(item=> item.url !== url )
    setMedia(filteredMedia)
    setComplete(filteredMedia)
  }



  const thumbs = compact(media).map(item => (
    <div className='dz-thumb justify-content-between' key={item?.url}>
      <div className='dz-thumb-inner'>
        {item?.type === 'image' ? (
          <img src={item?.url} className='dz-img img-fluid' alt={item.url} />
        ) : (
          <div>
            <File /> {item.url}
          </div>
        )}
      </div>
      <Trash style={{ cursor: 'pointer' }} onClick={()=> removeItem(item.url)}  />
    </div>
  ))

  return (
    <div className='mr-1'>
      <div {...getRootProps({ className: onlyIcon ? '': 'dropzone' })}>
        <input name='image' {...getInputProps()} />
        {onlyIcon ? (
          uploading ? <Spinner size={'sm'} color='primary' />
          :
          <Button type='button' className='btn-icon' color='primary'>
            <FileMinus size={15} />
          </Button>
        ) : (
          <div className='mx-1 text-center'>
            <em>(Drag and Drop File(s) Here)</em> <br />
            {uploading && <Spinner size={'sm'} color='primary' />}
          </div>
        )}
      </div>
     <aside className='thumb-container mb-1'>{thumbs}</aside>
    </div>
  )
}
