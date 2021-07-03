import React from 'react'
import { Row, Col, Card, CardBody } from 'reactstrap'

export default function Payments (props) {
  const [activeTab, setActiveTab] = React.useState('1')
  return (
    <Row>
      <Col xs={3}>
        <Card>
          <CardBody>Am here bro with some stats</CardBody>
        </Card>
      </Col>
      <Col xs={9}>
        <Card>
          <CardBody>Am here bro with some stats</CardBody>
        </Card>
      </Col>
    </Row>
  )
}
