import React from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Label,
  Row,
  Col,
  Collapse,
  Button
} from 'reactstrap'
import { ChevronDown } from 'react-feather'
import classnames from 'classnames'
import AvForm from 'availity-reactstrap-validation/lib/AvForm'
import AvGroup from 'availity-reactstrap-validation/lib/AvGroup'
import AvInput from 'availity-reactstrap-validation/lib/AvInput'
const countries = require('../../../../assets/country_data.json')

export default function UserFilters ({ onFilter }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true)

  return (
    <Col sm='12'>
      <Card
        className={classnames('card-action card-reload', {
          'card-collapsed': !isCollapsed
        })}
      >
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <div className='actions'>
            <ChevronDown
              className='collapse-icon mr-50'
              size={15}
              onClick={() => setIsCollapsed(!isCollapsed)}
            />
          </div>
        </CardHeader>
        <Collapse isOpen={isCollapsed}>
          <CardBody>
            <AvForm
              onSubmit={(e, errors, values) => {
                if (errors.length) return
                console.log(values);
                return onFilter && onFilter(values)
              }}
            >
              <Row>
                <Col lg='3' md='6' sm='12'>
                  <AvGroup className='mb-0'>
                    <Label for='status'>Status</Label>
                    <AvInput type='select' name='status' id='status' defaultValue='all'>
                      <option value='all'>All</option>
                      <option value='active'>Active</option>
                      <option value='submitted'>Submitted</option>
                      <option value='signed_up'>Signed Up</option>
                      <option value='deactivated'>Deactivated</option>
                      <option value='blocked'>Blocked</option>
                    </AvInput>
                  </AvGroup>
                </Col>
                <Col lg='3' md='6' sm='12'>
                  <AvGroup className='mb-0'>
                    <Label for='approved'>Approved</Label>
                    <AvInput type='select' name='approved' id='approved' defaultValue='all'>
                      <option value='all'>All</option>
                      <option value={true}>True</option>
                      <option value={false}>False</option>
                    </AvInput>
                  </AvGroup>
                </Col>
                <Col lg='3' md='6' sm='12'>
                  <AvGroup className='mb-0'>
                    <Label for='department'>Country</Label>
                    <AvInput type='select' name='country' id='department' defaultValue='all'>
                      <option value='all'>All</option>
                      {countries.map(country => {
                        return (
                          <option value={country.value}>{country.name}</option>
                        )
                      })}
                    </AvInput>
                  </AvGroup>
                </Col>
              </Row>

              {/* <Button.Ripple className='mt-2' color='primary'>
                Apply
              </Button.Ripple> */}
               <button type="button" class="btn  btn-default" style={{marginTop:"10px"}}>Apply</button>
            </AvForm>
          </CardBody>
        </Collapse>
      </Card>
    </Col>
  )
}
