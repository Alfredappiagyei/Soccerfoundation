import React from 'react'
import { NavItem, NavLink } from 'reactstrap'
import * as Icon from 'react-feather'
import { history } from '../../../history'
import { connect } from 'react-redux'
import {
  loadSuggestions,
  updateStarred
} from '../../../redux/actions/navbar/Index'

function NavbarBookmarks ({ sidebarVisibility, navItems = [] }) {
  const navigate = path => {
    history.push(path)
  }
  return (
    <div className='mr-auto float-left bookmark-wrapper d-flex align-items-center'>
      <ul className='navbar-nav d-xl-none'>
        <NavItem className='mobile-menu mr-auto'>
          <NavLink
            className='nav-menu-main menu-toggle hidden-xs is-active'
            onClick={sidebarVisibility}
          >
            <Icon.Menu className='ficon' />
          </NavLink>
        </NavItem>
      </ul>
      <ul className='nav navbar-nav bookmark-icons'>
        {navItems.map(item => (
          <NavItem
            className='nav-item d-lg-block'
            onClick={() => navigate(item.navLink)}
            key={item.id}
          >
            <NavLink>{item.icon}</NavLink>
          </NavItem>
        ))}
      </ul>
    </div>
  )
}
const mapStateToProps = state => {
  return {
    bookmarks: state.navbar
  }
}

export default connect(mapStateToProps, { loadSuggestions, updateStarred })(
  NavbarBookmarks
)
