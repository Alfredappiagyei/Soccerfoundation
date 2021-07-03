'use strict'
import Route from '@ioc:Adonis/Core/Route'

Route.get('register_influencer', 'AuthController.registerInfluencerView')
Route.get('/register_brand', 'AuthController.registerBrandView')

Route.group(()=>{
  Route.post('/register', 'AuthController.register')
  Route.post('/login', 'AuthController.login')
  Route.get('/verify/email', 'AuthController.verifyEmail').as('verifyEmail')
  Route.post('/verify_otp', 'AuthController.verifyOtp')
  Route.post('/resend_otp', 'AuthController.resendOtp')

  Route.post('/forgot-password', 'AuthController.requestPasswordChange')
  Route.post('/reset-password', 'AuthController.resetPassword').as('resetPassword')
  Route.post('/logout', 'AuthController.logout')
}).prefix('auth')
