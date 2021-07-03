import React from 'react'
import * as Icon from 'react-feather'

export default [
  {
    id: 'intro',
    title: 'Intro',
    type: 'item',
    icon: <Icon.Anchor size={20} />,
    navLink: '/brand/intro'
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'item',
    icon: <Icon.Home size={20} />,
    navLink: '/brand/home'
  },
  {
    id: 'campaigns',
    title: 'Campaigns',
    type: 'item',
    icon: <Icon.Calendar size={20} />,
    navLink: '/brand/campaigns'
  },
  {
    id: 'settings',
    title: 'Settings',
    type: 'item',
    icon: <Icon.Settings size={20} />,
    navLink: '/brand/settings'
  },
  {
    id: 'wallet',
    title: 'Wallet',
    type: 'item',
    icon: <Icon.DollarSign size={20} />,
    navLink: '/brand/wallet'
  },
  {
    id: 'social-stats',
    title: 'Social Stats',
    type: 'item',
    icon: <Icon.Activity size={20} />,
    navLink: '/brand/social-stats'
  }
]
