import React from 'react'
import request from '../helpers/request'
import { getAxiosErrors } from '../helpers/utils'

export default function useMutation ({ endpointPath, method='post' }) {
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState()
  const [error, setError] = React.useState()


  const makeRequest = (body = {}) => {
    setLoading(true)
    setError(null)
    return request[method](endpointPath,body)
      .then(response => {
        setLoading(false)
        setData(response.data)
        return response.data
      })
      .catch(errorData => {
        const err = getAxiosErrors(errorData)
        setError(err)
        setLoading(false)
        throw err
      })
  }

  return { loading, data, makeRequest, error }
}
