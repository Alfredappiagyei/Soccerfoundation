/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import {
  Card,
  CardBody,
  UncontrolledTooltip,
  Button,
  UncontrolledPopover,
  PopoverBody,
  Row,
  Col
} from 'reactstrap'
import { Eye, Heart, Plus, Radio, Trash2 } from 'react-feather'
import * as Icons from 'react-feather'
import moment from 'moment'
import Linkify from 'react-linkify'
import { isNil, startCase } from 'lodash'
import VideoPlayer from '../VideoPlayer'
import ProfileAvatar from '../ProfileAvatar'
export default function Feed ({
  feed,
  onChangeStatus,
  onDelete,
  onAdd,
  onLike,
  showPublish = true,
  showViewFeed = false,
  showSubmit = false,
  onSubmit,
  showStats= false
}) {
  const hasMedia = feed.media?.length > 0
  const totalLikes = feed.likes?.length

  const showMedia = () => {
    if (!hasMedia) return
    const mediaContent = feed?.media?.map(media => {
      const content =
        media.type === 'image' ? (
          <img
            src={feed?.media[0].url}
            alt='feed'
            className='img-responsive'
            width='100%'
            height={400}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div>
            <VideoPlayer
              url={feed?.media[0]?.url}
              autoplay={false}
              controls
              sources={[
                {
                  src: feed?.media[0]?.url
                }
              ]}
              allowPlayOnFocus
            />
          </div>
        )

      return (
        <Col
          className='m-0'
          key={media?.url}
          lg={feed?.media?.length < 2 ? 12 : 4}
        >
          {content}
        </Col>
      )
    })
    return <Row>{mediaContent}</Row>
  }

  const showLikedImage = () => {
    const likes = [...feed.likes] || []
    const totalToShow = likes.splice(0, 6)
    const currentLikesToShow = totalToShow.map(like => {
      return (
        <li className='avatar pull-up'>
          <img
            src={like.user?.profile_url}
            alt='avatar'
            height='30'
            width='30'
            id='avatar13'
          />
          <UncontrolledTooltip placement='bottom' target='avatar13'>
            {like.user?.full_name}
          </UncontrolledTooltip>
        </li>
      )
    })

    return (
      <div className='ml-2'>
        <ul className='list-unstyled users-list m-0 d-flex'>
          {currentLikesToShow}
          {likes.length ? (
            <li className='d-flex align-items-center pl-50'>
              <span className='align-middle'>+{likes.length} more</span>
            </li>
          ) : null}
        </ul>
      </div>
    )
  }

  const PlatformIcon = Icons[startCase(feed.platform)]

  return (
    <Card style={{ marginBottom: '0.7em' }}>
      <style>{`
      .video-js{
        width: 100%!important;
        height: 400px !important;
      }
      .feed-card-body{
        padding: 0 !important
      }
      
      `}</style>
      <CardBody className='feed-card-body'>
        <div className='d-flex justify-content-start align-items-center p-1'>
          {feed?.author?.profile_image ? (
            <a
              className='avatar mr-1'
              href={feed?.author?.profile_link}
              target='_blank'
              rel='noopener noreferrer'
            >
              <ProfileAvatar
                firstName={feed?.author?.name}
                imageUrl={feed?.author.profile_image}
              />
            </a>
          ) : null}

          <div className='user-page-info'>
            <p className='mb-0'>
              {feed?.author?.name}{' '}
              {PlatformIcon ? (
                <PlatformIcon size={14} color='#A223B6' />
              ) : (
                <span>{startCase(feed.platform)} </span>
              )}
            </p>
            <span className='font-small-2'>
              {moment(feed?.created_at_channel || feed.created_at).calendar()}
            </span>
          </div>
          <div className='ml-auto user-like d-flex'>
            {showPublish && (
              <Button
                className='nav-link nav-link-label'
                color={feed?.is_published ? 'info' : ''}
                onClick={() =>
                  onChangeStatus && onChangeStatus(feed.id, !feed?.is_published)
                }
                id={`status${feed.id}`}
              >
                <Radio size={21} />
              </Button>
            )}
            {showViewFeed && (
              <a
                className='nav-link nav-link-label mr-1'
                color='info'
                outline
                href={feed.link}
                target='_blank'
                rel='noopener noreferrer'
              >
                View
              </a>
            )}
            {showSubmit && (
              <Button color='danger' onClick={() => onSubmit(feed)} size='sm'>
                Submit
              </Button>
            )}

            {onAdd && (
              <Button
                className='nav-link nav-link-label'
                id={`status${feed.id}`}
                color={'info'}
                onClick={() => onAdd(feed)}
              >
                <Plus size={21} />
              </Button>
            )}

            {onDelete && (
              <>
                <Button
                  className='nav-link nav-link-label ml-1'
                  color='danger'
                  id={`delete${feed.id}`}
                >
                  <Trash2 size={21} />
                </Button>
                <UncontrolledPopover
                  target={`delete${feed.id}`}
                  placement='right-end'
                >
                  <PopoverBody>
                    <Button.Ripple
                      color='danger'
                      className='nav-link nav-link-label ml-1'
                      onClick={() => onDelete(feed.id)}
                    >
                      Yes Delete
                    </Button.Ripple>
                  </PopoverBody>
                </UncontrolledPopover>
              </>
            )}

            {onChangeStatus && (
              <UncontrolledTooltip
                placement='right-end'
                target={`status${feed.id}`}
              >
                {feed?.is_published ? 'Published' : 'Unpublished'}
              </UncontrolledTooltip>
            )}
          </div>
        </div>
        {feed?.caption ? <h6 className='p-1'>{feed?.caption}</h6> : null}
        <div className='p-2'>
          <Linkify
            componentDecorator={(decoratedHref, decoratedText, key) => {
              return (
                <a
                  href={decoratedHref}
                  key={key}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {decoratedText}
                </a>
              )
            }}
          >
            {feed?.body}
          </Linkify>
        </div>

        {showMedia()}

        {!isNil(totalLikes) ? (
          <div className='d-flex justify-content-start align-items-center p-2'>
            <div className='d-flex align-items-center'>
              <Heart
                size={15}
                style={{ cursor: 'pointer' }}
                fill={feed.has_liked ? '#EA5455' : 'transparent'}
                stroke={feed.has_liked ? '#EA5455' : '#626262'}
                onClick={() => onLike && onLike(feed, !feed.has_liked)}
              />
              <span className='align-middle ml-50'> {totalLikes}</span>
            </div>
            {showLikedImage()}
          </div>
        ) : null}
     {
       showStats ?    <div className='p-2'>
       <strong>Total Likes</strong>: 0
       {feed.total_comments ? (
         <span>
           <strong className='ml-1'>Total Comments</strong>:{' '}
           {feed?.total_comments}{' '}
         </span>
       ) : null}
       {feed.total_likes ? (
         <span>
           <strong className='ml-1'>Total Likes</strong>: {feed?.total_likes}{' '}
         </span>
       ) : null}
       {feed.retweet_count ? (
         <span>
           <strong className='ml-1'>Total Retwets</strong>:{' '}
           {feed?.retweet_count}{' '}
         </span>
       ) : null}
       {feed.total_engagements ? (
         <span>
           <strong className='ml-1'>Total Engagements</strong>:{' '}
           {feed?.total_engagements}
         </span>
       ) : null}
     </div>: null
     }
      </CardBody>
    </Card>
  )
}
