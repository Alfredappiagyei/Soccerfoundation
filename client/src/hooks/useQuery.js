import React from 'react'
import request from '../helpers/request'
import { getAxiosErrors } from '../helpers/utils'

export default function useQuery ({
  endpointPath,
  initQuery = {},
  initialLoad = true
}) {
  const [loading, setLoading] = React.useState(initialLoad)
  const [data, setData] = React.useState()
  const [error, setError] = React.useState()

  React.useEffect(() => {
    if (!initialLoad) return
    loadData(initQuery)
  }, [])

  const loadData = (
    query = {},
    isLoadMore = false,
    showLoader = true,
    useInitialQuery,
    onlyQuery = true
  ) => {
    showLoader && setLoading(true)
    return request
      .get(endpointPath, {
        params: useInitialQuery
          ? initQuery
          : onlyQuery
          ? query
          : {
              ...query,
              ...initQuery
            }
      })
      .then(({ data: responseData }) => {
        if(!isLoadMore) {
          setData(responseData)
        } else{
          const newData = Array.isArray(responseData) ? [...data, ...responseData] : {
            ...responseData,
            data: [...data?.data, ...responseData.data]
          }
          setData(newData)
        }
        setLoading(false)
        return responseData
      })
      .catch(errorData => {
        const err = getAxiosErrors(errorData)
        setError(err)
        setLoading(false)
      })
  }

  return {
    loading,
    data,
    refetch: loadData,
    error,
    updateData: setData,
    loadMore: query => loadData(query, true)
  }
}
