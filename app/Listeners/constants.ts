export default {
  formSmsNotificationMessage (otp) {
    return `Your Verification Code is ${otp}`
  },
  accountChange (approved: boolean) {
    return approved
      ? 'Your Ripple profile was approved. You can login at app.useripple.com'
      : 'Your profile was not approved. Please login to app.useripple.com or check your email for the response.'
  },
  sms:{
    campaign_accepted: 'Influencers have started accepting your invite',
  },
  email:{
    campaign_accepted: {
      subject: 'CAMPAIGN_NAME has new influencers',
      message: 'INFLUENCER_NAME has accepted your invite',
      title: 'Invitation Accepted',
    },
  },
  inapp:{
    campaign_accepted: {
      message: 'INFLUENCER_NAME has accepted your invite',
      title: 'Invitation Accepted',
    },
  },
}
