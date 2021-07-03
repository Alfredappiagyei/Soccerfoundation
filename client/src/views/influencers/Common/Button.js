import React from 'react'
import SocialLogin from 'react-social-login'
import { Button } from 'reactstrap'

function SocialButton (props) {
  return (
    <Button.Ripple onClick={props.triggerLogin} {...props}>
      {props.children}
    </Button.Ripple>
  )
}

export default SocialLogin(SocialButton)
