import React from 'react'
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Card,
  CardBody
} from 'reactstrap'
import classnames from 'classnames'
import { Settings, Lock, Link, Bell } from 'react-feather'
import GeneralTab from './General'
import ChangePassword from './ChangePassword'
import Breadcrumbs from '../../../components/@vuexy/breadCrumbs/BreadCrumb'
import SocialConnector from '../Common/SocialConnector'
import Notifications from './Notifications'
import queryString from 'query-string'
import {history} from '../../../history'
export default function ProfileSettings () {
  const params = queryString.parse(history?.location.search)
  const [activeTab, setActiveTab] = React.useState( params.tab || '1')
  const [windowWidth, setWindowWidth] = React.useState()

  const toggle = tab => {
    setActiveTab(tab) 
    history.push(`${history.location.pathname}?tab=${tab}`)
  }

  const updateWidth = () => {
    setWindowWidth(window.innerWidth)
  }

  React.useEffect(() => {
    if (window !== undefined) {
      updateWidth()
      window.addEventListener('resize', updateWidth)
    }
  }, [])

  return (
    <React.Fragment>
      <Breadcrumbs
        breadCrumbTitle='Account Settings'
        breadCrumbParent='Dashboard'
        breadCrumbActive='Account Settings'
        homeUrl='/influencer/home'
      />
      <div
        className={`${
          windowWidth >= 769 ? 'nav-vertical' : 'account-setting-wrapper'
        }`}
      >
        <Nav className='account-settings-tab nav-left mr-0 mr-sm-3' tabs>
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === '1'
              })}
              onClick={() => {
                toggle('1')
              }}
            >
              <Settings size={16} />
              <span className='d-md-inline-block d-none align-middle ml-1'>
                General
              </span>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === '2'
              })}
              onClick={() => {
                toggle('2')
              }}
            >
              <Lock size={16} />
              <span className='d-md-inline-block d-none align-middle ml-1'>
                Change Password
              </span>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === '3'
              })}
              onClick={() => {
                toggle('3')
              }}
            >
              <Link size={16} />
              <span className='d-md-inline-block d-none align-middle ml-1'>
                Connections
              </span>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === '4'
              })}
              onClick={() => {
                toggle('4')
              }}
            >
              <Bell size={16} />
              <span className='d-md-inline-block d-none align-middle ml-1'>
                Notifications
              </span>
            </NavLink>
          </NavItem>
        </Nav>
        <Card>
          <CardBody>
            <TabContent activeTab={activeTab}>
              <TabPane tabId='1'>
                <GeneralTab />
              </TabPane>
              <TabPane tabId='2'>
                <ChangePassword />
              </TabPane>
              <TabPane tabId='3'>
                <SocialConnector />
              </TabPane>
              <TabPane tabId='4'><Notifications /></TabPane>
            </TabContent>
          </CardBody>
        </Card>
      </div>
    </React.Fragment>
  )
}
