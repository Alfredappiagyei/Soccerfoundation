import React, { Suspense, lazy } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Spinner from '../../components/@vuexy/spinner/Loading-spinner'
import VerticalLayout from '../../layouts/VerticalLayout'
import FullpageLayout from '../../layouts/FullpageLayout'
import menus from './menus'
import roleConstants from '../../constants/roles'
import { history } from '../../history'
import useQuery from '../../hooks/useQuery'

// Route-based code splitting
const Dashboard = lazy(() => import('./Dashboard'))
const Setup = lazy(() => import('./Setup'))
const ListCampaigns = lazy(() => import('./ListCampaigns'))
const Settings = lazy(() => import('./Settings'))
const Payments = lazy(() => import('../general/Wallet'))
const SingleCampaign = lazy(() => import('./SingleCampaign'))
const SocialStats = lazy(() => import('./SocialStats'))

const RenderComponent = ({ newUser, notifications }) => ({
  isFullPage,
  component: Component,
  ...rest
}) => (
  <Route
    path={rest.path}
    render={props => {
      const Layout = isFullPage ? FullpageLayout : VerticalLayout
      if (!newUser && !roleConstants.INFLUENCER)
        return <Redirect from={props.match.url} to={`/login`} />
      const cloneMenus = menus.map(menu => {
        menu.disabled = menu.id !== 'intro' && !newUser?.approved
        menu.hide = menu.id === 'intro' && newUser?.approved
        return menu
      })
      return (
        <Layout {...props} notifications={notifications} menus={cloneMenus} user={newUser} {...rest}>
          <Suspense fallback={<Spinner />}>
            <Component user={newUser} {...props} {...rest} />
          </Suspense>
        </Layout>
      )
    }}
  />
)

function InfluencerRouter (props) {
  const { data: newUser, loading } = useQuery({
    endpointPath: '/api/influencers/me'
  })
  const {
    data = {
      data: [],
      meta: {
        total: 0
      }
    }
  } = useQuery({
    endpointPath: '/notifications',
    initQuery: {
      per_page: 5,
      is_read: false
    }
  })

  const RenderRightComponent = RenderComponent({ newUser, notifications: {
    ...data,
    readMoreUrl : `/${newUser?.role.name}/settings?tab=4`
  } }) 
  if (loading) return <Spinner />

  if (!newUser) return <Redirect to='/login' />

  return (
    <Switch>
      {newUser?.approved
        ? null
        : history.location.pathname !== '/influencer/setup' && (
            <Redirect
              from={history.location.pathname}
              to={'/influencer/setup'}
            />
          )}
      <RenderRightComponent
        path={`${props.match.url}/setup`}
        component={Setup}
        logout={props.logout}
      />
      <RenderRightComponent
        path={`${props.match.url}/campaigns/:id`}
        component={SingleCampaign}
        logout={props.logout}
      />
      <RenderRightComponent
        path={`${props.match.url}/campaigns`}
        component={ListCampaigns}
        logout={props.logout}
      />
      <RenderRightComponent
        path={`${props.match.url}/settings`}
        component={Settings}
        logout={props.logout}
      />
      <RenderRightComponent
        path={`${props.match.url}/payments`}
        component={Payments}
        logout={props.logout}
      />
      <RenderRightComponent
        path={`${props.match.url}/home`}
        component={Dashboard}
        logout={props.logout}
      />
      <RenderRightComponent
        path={`${props.match.url}/social-stats`}
        component={SocialStats}
        logout={props.logout}
      />
      <Redirect from={props.match.url} to={`${props.match.url}/home`} />
    </Switch>
  )
}

export default InfluencerRouter
