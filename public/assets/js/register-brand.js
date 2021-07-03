
function notify (message, type='success', timeout=2000){
  const n = new Noty({
    text: message,
    theme:'sunset',
    type,
    animation: {
      open: 'animated bounceInRight', // Animate.css class names
      close: 'animated bounceOutRight', // Animate.css class names
    },
  })
  n.show()
  n.setTimeout(timeout)
  n.stop()
}

$(document).ready(function () {
  $('#interests').tagcloud()
  var input = document.querySelector('#phone_number')
  window.intlTelInput(input, {
    initialCountry: 'gh',
  })

  var iti = window.intlTelInputGlobals.getInstance(input)

  input.addEventListener('countrychange', function () {
    const countryData = iti.getSelectedCountryData()
    $('#country').val(countryData.name).trigger('change')
  })

  $('#register').submit(function (event) {
    event.preventDefault()
    var serialzedForm = $(this).serializeArray().reduce((acc, item)=>{
      acc[item.name] = item.value
      return acc
    }, {})
    var payload = Object.assign({}, serialzedForm, {
      country: $('#country').val(),
      interests: $('#interests').val(),
    })
    window.NProgress.start()
    $.ajax({
      type: 'POST',
      url: '/register_brand',
      data: payload,
    }).done((response)=>{
      notify('Account created successfully', 'success')
      window.NProgress.done()
      window.location.href = '/brand-welcome'
    }) .fail(function (error) {
      const {errors} = error.responseJSON
      const errorMessage = errors.map(err=> err.message).join('\n')
      notify(errorMessage, 'error')
      window.NProgress.done()
    })
  })
})

