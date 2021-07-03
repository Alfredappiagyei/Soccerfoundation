'use strict'

const AWS = require('aws-sdk')
const got = require('got').default
const url = require('url')

AWS.config.update({
  region: process.env.AWS_REGION,
})

const fileUploader = async (fileUrl)=>{
  const s3 = new AWS.S3()
  const fileName = url.parse(fileUrl).pathname
  const response = await got(fileUrl, { responseType: 'buffer' })
  return new Promise((resolve, reject)=>{
    s3.upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `feeds${fileName}`,
      ContentType: response.headers['content-type'],
      ContentLength: response.headers['content-length'],
      Body: response.body,
      ACL: 'public-read',
    }, (error, data)=>{
      if(error) {
        return reject(error)
      }
      resolve(data)
    })
  })
}

module.exports= fileUploader
