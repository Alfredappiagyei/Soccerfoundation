import React, { Suspense, lazy } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Spinner from '../../components/@vuexy/spinner/Loading-spinner'
import VerticalLayout from '../../layouts/VerticalLayout'
import FullpageLayout from '../../layouts/FullpageLayout'
import menus from './menus'
import roleConstants from '../../constants/roles'
import useQuery from '../../hooks/useQuery'
// Route-based code splitting
const Influencers = lazy(() => import('./Users/Influencers'))

const Brands = lazy(() => import('./Users/Brands'))
const SingleBrandUser = lazy(() => import('./Users/Brands/Single'))

const Dashboard = lazy(() => import('./Dashboard'))

const Feeds = lazy(() => import('./Feeds'))

const Barter = lazy(() => import('./Barter'))

const Campaigns = lazy(() => import('../general/CampaignList'))

const SingleCampaign = lazy(() => import('./SingleCampaign'))

const SingleInfluencerUser = lazy(() => import('./Users/Influencers/Single'))

const RenderComponent = ({ user, logout }) => ({
  isFullPage,
  component: Component,
  ...rest
}) => (
  <Route
    path={rest.path}
    render={props => {
      const Layout = isFullPage ? FullpageLayout : VerticalLayout
      if (!user && !roleConstants.ADMIN)
        return <Redirect from={props.match.url} to={`/login`} />
      return (
        <Layout {...props} logout={logout} menus={menus} user={user} {...rest}>
          <Suspense fallback={<Spinner />}>
            <Component user={user} {...props} {...rest} />
          </Suspense>
        </Layout>
      )
    }}
  />
)

function AdminRouter (props) {
  const { data: user, loading } = useQuery({
    endpointPath: '/api/admins/me'
  })

  if (loading) return <Spinner />

  const RenderRightComponent = RenderComponent({ user, logout: props.logout })
  return (
    <Switch>
      <RenderRightComponent
        path={`${props.match.url}/home`}
        component={Dashboard}
      />
      <RenderRightComponent
        path={`${props.match.url}/users/influencers/:id`}
        component={SingleInfluencerUser}
        canEdit
      />
      <RenderRightComponent
        path={`${props.match.url}/users/brands/:id`}
        component={SingleBrandUser}
      />
      <RenderRightComponent
        path={`${props.match.url}/users/influencers`}
        component={Influencers}
      />
      <RenderRightComponent
        path={`${props.match.url}/users/brands`}
        component={Brands}
      />
      <RenderRightComponent
        path={`${props.match.url}/feeds`}
        component={Feeds}
      />
      <RenderRightComponent
        path={`${props.match.url}/barter`}
        component={Barter}
      />
      <RenderRightComponent
        path={`${props.match.url}/campaigns/:id`}
        component={SingleCampaign}
      />
      <RenderRightComponent
        path={`${props.match.url}/campaigns`}
        component={Campaigns}
      />
      <Redirect from={props.match.url} to={`${props.match.url}/home`} />
    </Switch>
  )
}

export default AdminRouter
