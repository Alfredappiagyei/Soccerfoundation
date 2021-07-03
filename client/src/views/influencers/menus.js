import React from 'react'
import * as Icon from 'react-feather'

export default [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'item',
    icon: <Icon.Home size={20} />,
    navLink: '/influencer/home'
  },
  {
    id: 'campaigns',
    title: 'Campaigns',
    type: 'item',
    icon: <Icon.Calendar size={20} />,
    navLink: '/influencer/campaigns'
  },
  {
    id: 'settings',
    title: 'Settings',
    type: 'item',
    icon: <Icon.Settings size={20} />,
    navLink: '/influencer/settings'
  },
  {
    id: 'payments',
    title: 'Payments',
    type: 'item',
    icon: <Icon.DollarSign size={20} />,
    navLink: '/influencer/payments'
  },
  {
    id: 'social-stats',
    title: 'Social Stats',
    type: 'item',
    icon: <Icon.Activity size={20} />,
    navLink: '/influencer/social-stats'
  },
  {
    id: 'intro',
    title: 'Intro',
    type: 'item',
    icon: <Icon.Anchor size={20} />,
    navLink: '/influencer/setup'
  }
]
