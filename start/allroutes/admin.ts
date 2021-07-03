'use strict'
import Route from '@ioc:Adonis/Core/Route'
import { ROLES } from 'App/Models/User'

Route.group(()=>{
  Route.get('/users/:id', 'Admin/UsersController.singleInfluencerUser').middleware([`acl:${ROLES.ADMIN},${ROLES.BRAND}`])
  Route.group(()=>{
    Route.get('/users', 'Admin/UsersController.listUsers')
    Route.post('/users/status', 'Admin/UsersController.updateUserStatus')
    Route.get('/social/feeds', 'Admin/FeedsController.searchSocialFeed')
    Route.get('/dashboard/stats', 'Admin/DashboardController.generalStats')
    Route.resource('/feeds', 'Admin/FeedsController').only(['store', 'destroy', 'update'])
    Route.group(()=> {
      Route.get('/','Admin/QueuesUi.index')
      Route.get('*','Admin/QueuesUi.index')
      Route.put('*','Admin/QueuesUi.index')
      Route.post('*','Admin/QueuesUi.index')
    }).prefix('/monitor')
  }).middleware([`acl:${ROLES.ADMIN}`])
}).prefix('/api/admin').middleware(['auth'])
