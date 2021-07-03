import React from 'react'
import classnames from 'classnames'
import { Badge } from 'reactstrap'
function Avatar (props) {
  return (
    <div
    onClick={()=> props.onClick && props.onClick()}
      className={classnames(
        `avatar ${props.color ? `bg-${props.color}` : null}  ${
          props.className
        }`,
        {
          'avatar-sm': props.size && props.size === 'sm',
          'avatar-lg': props.size && props.size === 'lg',
          'avatar-xl': props.size && props.size === 'xl'
        }
      )}
    >
      {!props.img ? (
        <span
        style={{ width: props.imgWidth, height: props.imgHeight }}
          className={classnames('avatar-content', {
            'position-relative': props.badgeUp,
          })}
        >
          {props.content ? props.content : null}

          {props.icon ? <div className='avatar-icon'>{props.icon}</div> : null}
          {props.badgeUp ? (
            <Badge
              color={props.badgeColor ? props.badgeColor : 'primary'}
              className='badge-sm badge-up'
              pill
            >
              {props.badgeText ? props.badgeText : '0'}
            </Badge>
          ) : null}
        </span>
      ) : (
        <img
          src={props.img}
          alt='avatarImg'
          height={props.imgHeight && !props.size ? props.imgHeight : 32}
          width={props.imgWidth && !props.size ? props.imgWidth : 32}
        />
      )}
      {props.status ? (
        <span className={`avatar-status-${props.status}`}></span>
      ) : null}
    </div>
  )
}
export default Avatar
