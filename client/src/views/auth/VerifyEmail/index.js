import React from "react"
import { Card, CardBody, Button, Row, Col } from "reactstrap"
import notAuthImg from "../../../assets/img/pages/not-authorized.png"
import queryString from 'query-string'





export default function VerifyEmail(props){
    const query = queryString.parse(props.location.search)
    return (
        <Row className="m-0">
        <Col sm="12">
          <Card className="auth-card bg-transparent shadow-none rounded-0 mb-0 w-100">
            <CardBody className="text-center">
              <img
                src={notAuthImg}
                alt="notAuthImg"
                className="img-fluid align-self-center mt-75"
              />
              <p className="pt-2 mb-0">
               {query.message}
              </p>
              <p className="pb-2">
                
              </p>
              <Button.Ripple
                tag="a"
                color="info"
                size="lg"
                className="mt-2"
                onClick={()=> props.history.replace('/login')}
              >
                Login
              </Button.Ripple>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
}