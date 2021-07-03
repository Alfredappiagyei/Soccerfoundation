import React from 'react'
import { Card, CardBody } from 'reactstrap'

export default function Empty ({ url, title = '', content, imgWidth='180', className }) {
  return (
    <Card className={className}>
      <CardBody className='text-center'>
          <img src={url} alt={title} className='mx-auto mb-2' width={imgWidth} />
          <h4>{title.toUpperCase()}</h4>
          <small className='text-dark'>{content}</small>
      </CardBody>
    </Card>
  )
}
