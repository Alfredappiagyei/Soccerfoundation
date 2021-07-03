'use strict'

import Env from '@ioc:Adonis/Core/Env'
import AWS from 'aws-sdk'
import utils from 'util'
import url from 'url'
import got from 'got'

AWS.config.update({
  region: Env.get('AWS_REGION') as string,
})

const upload = ({
  location,
  file,
  contentType,
}: {
  location: string
  file: any
  contentType: string
}) => {
  const s3 = new AWS.S3()
  const s3UploadPromise = utils.promisify(s3.upload.bind(s3))
  return s3UploadPromise({
    Bucket: Env.get('S3_PRIVATE_BUCKET_NAME') as string,
    Key: location,
    ContentType: contentType,
    Body: file,
  })
}

const uploadFileUrl = async (fileUrl: string)=>{
  const s3 = new AWS.S3()
  const key = `feeds${url.parse(fileUrl).pathname}`
  const s3UploadPromise = utils.promisify(s3.upload.bind(s3))
  const response = await got(fileUrl, { responseType: 'buffer' })
  return s3UploadPromise({
    Bucket: Env.get('S3_PUBLIC_BUCKET_NAME') as string,
    Key: key,
    ContentType: response.headers['content-type'],
    ContentLength: response.headers['content-length'],
    Body: response.body,
    ACL: 'public-read',
  }).then(response=>{
    return response.Location
  })
}

const getObject = (key: string) => {
  const s3 = new AWS.S3()
  try {
    return s3.getObject({
      Bucket: Env.get('S3_PRIVATE_BUCKET_NAME') as string,
      Key: key,
    })
  } catch (error) {
    throw new Error('find not found')
  }
}

export { upload, getObject, uploadFileUrl }
