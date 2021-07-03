import React from 'react'

import request from '../helpers/request'

export default function useFileUploader ({ isSecured = false, folder, onComplete } = {}) {
  const [loading, setLoading] = React.useState(false)

  const onUpload = async file => {
    const formPart = new FormData()
    formPart.append('file', file)
    try {
      setLoading(true)
      const { data } = await request.post('/media/upload', formPart, {
        params: {
          is_secured: isSecured,
          folder
        }
      })
      onComplete && onComplete(data.url)
      setLoading(false)
      return data
    } catch (error) {
      setLoading(false)
    }
  }

  return { loading, onUpload }
}
