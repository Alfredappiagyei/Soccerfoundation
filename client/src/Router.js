import React, { lazy } from 'react'
import { Router, Switch, Route } from 'react-router-dom'
import request from './helpers/request'
import { history } from './history'
import useLocalStorageUser from './hooks/useLocalStorageUser'

// Route-based code splitting
const AuthRouter = lazy(() => import('./views/auth'))

const InfluencerRouter = lazy(() => import('./views/influencers'))

const AdminRouter = lazy(() => import('./views/admin'))

const BrandRouter = lazy(() => import('./views/brands'))

const SharedHandle = lazy(() => import('./views/general/SharedHandle'))


function AppRouter ({ match }) {
  const { item: user, setItem } = useLocalStorageUser()

  const logout = async () => {
    await request.post(
      '/auth/logout',
      {}
    )
    setItem('')
    history.push('/login')
  }

  return (
    <Router history={history}>
      <Switch>
        <Route
          path='/influencer'
          render={props => (
            <InfluencerRouter {...props} logout={logout} user={user} />
          )}
        />
        <Route
          path='/brand'
          render={props => (
            <BrandRouter {...props} logout={logout} user={user} />
          )}
        />
        <Route
          path='/admin'
          render={props => (
            <AdminRouter {...props} logout={logout} user={user} />
          )}
        />
        <Route
        path='/profile/:handle'
        component={SharedHandle}
        />
        <AuthRouter />
      </Switch>
    </Router>
  )
}

export default AppRouter
