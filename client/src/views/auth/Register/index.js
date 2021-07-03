import React from 'react'
import '../../../assets/scss/pages/authentication.scss'
import RegisterBrand from './Brand'
import RegisterInfluencer from './Influencer'

export default function Register (props) {
  const isInfluencer = /influencer/gi.test(props.location.search)
  if (isInfluencer) return <RegisterInfluencer {...props} />
  return <RegisterBrand {...props} />
}
