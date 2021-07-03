import React from 'react'
import * as Icon from 'react-feather'

export default [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'item',
    icon: <Icon.Home size={20} />,
    navLink: '/admin/home'
  },
  {
    id: 'influencers',
    title: 'Influencers',
    type: 'item',
    icon: <Icon.User size={20} />,
    navLink: '/admin/users/influencers'
  },
  {
    id: 'brands',
    title: 'Brands',
    type: 'item',
    icon: <Icon.UserPlus size={20} />,
    navLink: '/admin/users/brands'
  },
  {
    id: 'feeds',
    title: 'Feeds',
    type: 'item',
    icon: <Icon.Rss size={20} />,
    navLink: '/admin/feeds'
  },
  {
    id: 'campaigns',
    title: 'Campaigns',
    type: 'item',
    icon: <Icon.UserPlus size={20} />,
    navLink: '/admin/campaigns'
  },
  {
    id: 'barter',
    title: 'Barter',
    type: 'item',
    icon: <Icon.UserPlus size={20} />,
    navLink: '/admin/barter'
  },
]

