import React, { Suspense, lazy } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Spinner from '../../components/@vuexy/spinner/Loading-spinner'
import VerticalLayout from '../../layouts/VerticalLayout'
import FullpageLayout from '../../layouts/FullpageLayout'
import menus from './menus'
import request from '../../helpers/request'
import roleConstants from '../../constants/roles'
import { history } from '../../history'
// Route-based code splitting
const Dashboard = lazy(() => import('./Dashboard'))
const Setup = lazy(() => import('./Setup'))
const Wallet = lazy(() => import('../general/Wallet'))
const List = lazy(() => import('../general/CampaignList'))
const Create = lazy(() => import('./Campaign/Add'))
const SingleInfluencerUser = lazy(()=> import('../admin/Users/Influencers/Single'))

const RenderComponent = ({ newUser, logout }) => ({
  isFullPage,
  component: Component,
  ...rest
}) => (
  <Route
    render={props => {
      const Layout = isFullPage ? FullpageLayout : VerticalLayout
      if (!newUser && !roleConstants.BRAND)
        return <Redirect from={props.match.url} to={`/login`} />
      const cloneMenus = menus.map(menu => {
        menu.disabled = menu.id !== 'intro' && !newUser?.approved
        menu.hide = menu.id === 'intro' && newUser?.approved
        return menu
      })
      return (
        <Layout
          logout={logout}
          menus={cloneMenus}
          user={newUser}
          {...props}
          {...rest}
        >
          <Suspense fallback={<Spinner />}>
            <Component user={newUser} {...props} {...rest} />
          </Suspense>
        </Layout>
      )
    }}
  />
)

function BrandRouter (props) {
  const [newUser, setNewUser] = React.useState()
  React.useEffect(() => {
    getUser()
  }, [])

  const getUser = () => {
    return request.get('/api/brands/me').then(response => {
      setNewUser(response.data)
    })
  }

  const RenderRightComponent = RenderComponent({
    newUser,
    logout: props.logout
  })
  if (!newUser) return <Spinner />
  return (
    <Switch>
      {newUser?.approved
        ? null
        : history.location.pathname !== '/brand/intro' && (
            <Redirect from={history.location.pathname} to={'/brand/intro'} />
          )}
      <RenderRightComponent
        path={`${props.match.url}/intro`}
        component={Setup}
      />
      <RenderRightComponent
        path={`${props.match.url}/home`}
        component={Dashboard}
      />
      <RenderRightComponent
        path={`${props.match.url}/wallet`}
        component={Wallet}
        allowTop
        showCampaignInfluencer
      />
        <RenderRightComponent
        path={`${props.match.url}/influencers/:id`}
        component={SingleInfluencerUser}
      />
      
      <RenderRightComponent
        path={`${props.match.url}/campaigns/create`}
        component={Create}
      />
      <RenderRightComponent
        path={`${props.match.url}/campaigns`}
        component={List}
      />

      <Redirect from={props.match.url} to={`${props.match.url}/home`} />
    </Switch>
  )
}

export default BrandRouter
