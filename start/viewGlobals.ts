import View from '@ioc:Adonis/Core/View'
import moment from 'moment'

View.global('calender', (value) => {
  return moment(new Date(value)).calendar()
})
