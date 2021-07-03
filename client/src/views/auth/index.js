import React, { Suspense, lazy } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Spinner from '../../components/@vuexy/spinner/Loading-spinner'
import FullpageLayout from '../../layouts/FullpageLayout'

// Route-based code splitting
const Login = lazy(() => import('./Login'))
const Register = lazy(() => import('./Register'))
const VerifyEmail = lazy(()=> import('./VerifyEmail'))
const RequestPasswordRequest = lazy(()=> import("./RequestPasswordReset"))
const ResetPassword = lazy(()=> import("./ResetPassword"))

function AuthRouter ({ match }) {
  return (
    <FullpageLayout>
      <Suspense fallback={<Spinner />}>
        <Switch>
          <Route path={`/login`} component={Login} />
          <Route path={`/register`} component={Register} />
          <Route path={`/verify-email`} component={VerifyEmail} />
          <Route path={`/forgot-password`} component={RequestPasswordRequest} />
          <Route path={`/reset-password`} component={ResetPassword} />
          <Redirect to='/login' />
        </Switch>
      </Suspense>
    </FullpageLayout>
  )
}

export default AuthRouter
