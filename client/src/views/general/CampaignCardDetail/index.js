import React from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Collapse
} from 'reactstrap'
import { ChevronDown } from 'react-feather'
import startCase from 'lodash/startCase'

export function SingleDetail ({ data, parse = true, extra }) {
  return (
    <Col lg={4}>
      <div className='collapse-margin accordion vx-collapse'>
        <Card className={'collapse-shown'}>
          <CardHeader>
            <CardTitle className='lead collapse-title collapsed text-truncate w-75'>
              {startCase(data.title)}
            </CardTitle>
            <ChevronDown className='collapse-icon' size={15} />
          </CardHeader>
          <Collapse isOpen>
            <CardBody>
              <div className={data.value && 'd-flex justify-content-between'}>
                {data.value && (
                  <div>{parse ? startCase(data.value) : data.value}</div>
                )}
                {extra}
              </div>
            </CardBody>
          </Collapse>
        </Card>
      </div>
    </Col>
  )
}
