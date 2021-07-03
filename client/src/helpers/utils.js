import numeral from 'numeral'
export const getAxiosErrors = error => {
  return error?.response?.data?.errors ?? error.response?.data?.message
}

export const parseString = str => {
  try {
    return JSON.parse(str)
  } catch (error) {
    return str
  }
}


export const followerCountFormatter = (itemNumber)=>numeral(itemNumber).format('0a')