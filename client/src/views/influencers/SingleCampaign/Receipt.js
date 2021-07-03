import React from 'react'
import {
  Card,
  CardBody,
  Row,
  Col,
  Media,
  Table,
  Button,
  CardTitle
} from 'reactstrap'
import logo from '../../../assets/img/logo/logo.png'
import { FileText } from 'react-feather'

import '../../../assets/scss/pages/invoice.scss'

export default function Details () {
  return (
    <React.Fragment>
      <Row>
        <Col className='mb-1 invoice-header' md='5' sm='12'></Col>
        <Col
          className='d-flex flex-column flex-md-row justify-content-end invoice-header mb-1'
          md='7'
          sm='12'
        >
          <Button
            className='mr-1 mb-md-0 mb-1'
            color='primary'
            onClick={() => window.print()}
          >
            <FileText size='15' />
            <span className='align-middle ml-50'>Print</span>
          </Button>
        </Col>
        <Col className='invoice-wrapper' sm='12'>
          <Card className='invoice-page'>
            <CardBody>
              <Row>
                <Col md='6' sm='12' className='pt-1'>
                  <Media className='pt-1'>
                    <img src={logo} alt='logo' />
                  </Media>
                </Col>
                {/* 
                <Col md='6' sm='12' className='text-right'>
                  <h1>Invoice</h1>
                  <div className='invoice-details mt-2'>
                    <h6>INVOICE NO.</h6>
                    <p>001/2020</p>
                    <h6 className='mt-2'>INVOICE DATE</h6>
                    <p>10 Dec 2018</p>
                  </div>
                </Col> */}
              </Row>
              <CardTitle className='mt-4'>Description</CardTitle>
              <div>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s, when an unknown printer took a galley
                of type and scrambled it to make a type specimen book. It has
                survived not only five centuries, but also the leap into
                electronic typesetting, remaining essentially unchanged. It was
                popularised in the 1960s with the release of Letraset sheets
                containing Lorem Ipsum passages, and more recently with desktop
                publishing software like Aldus PageMaker including versions of
                Lorem Ipsum.
              </div>

              <div className='invoice-items-table pt-1'>
                <Row>
                  <Col sm='12'>
                    <Table responsive borderless>
                      <thead>
                        <tr>
                          <th>TASK DESCRIPTION</th>
                          <th>HOURS</th>
                          <th>RATE</th>
                          <th>AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Website Redesign</td>
                          <td>60</td>
                          <td>15 USD</td>
                          <td>90000 USD</td>
                        </tr>
                        <tr>
                          <td>Newsletter template design</td>
                          <td>20</td>
                          <td>12 USD</td>
                          <td>24000 USD</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </div>
              <div className='invoice-total-table'>
                <Row>
                  <Col sm={{ size: 7, offset: 5 }} xs={{ size: 7, offset: 5 }}>
                    <Table responsive borderless>
                      <tbody>
                        <tr>
                          <th>SUBTOTAL</th>
                          <td>114000 USD</td>
                        </tr>
                        <tr>
                          <th>DISCOUNT (5%)</th>
                          <td>5700 USD</td>
                        </tr>
                        <tr>
                          <th>TOTAL</th>
                          <td>108300 USD</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </div>
              <div className='text-right pt-3 invoice-footer'>
                <p>
                  Transfer the amounts to the business amount below. Please
                  include invoice number on your check.
                </p>
                <p className='bank-details mb-0'>
                  <span className='mr-4'>
                    BANK: <strong>FTSBUS33</strong>
                  </span>
                  <span>
                    IBAN: <strong>G882-1111-2222-3333</strong>
                  </span>
                </p>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  )
}
