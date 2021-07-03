import React from 'react'
import Avatar from '../@vuexy/avatar/AvatarComponent'


export default function ProfileAvatar ({ firstName='', lastName='', imageUrl, ...rest }){
    return <Avatar content={`${firstName.replace(/\s/ig, '')?.charAt(0)}${lastName.replace(/\s/ig, '')?.charAt(0)}`} img={imageUrl} {...rest} />
}