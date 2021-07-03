/* eslint-disable max-len */
import { validator } from '@ioc:Adonis/Core/Validator'
import { formatPhoneNumber } from 'App/Controllers/Lib/utils'

validator.rule('phone', (value, _, { pointer, arrayExpressionPointer, errorReporter, mutate }) => {
  /**
   * Skip validation when value is not a string. The string
   * schema rule will handle it
   */
  if (typeof (value) !== 'string') {
    return
  }

  /**
   * Parse phone number from a string
   */
  const phoneNumber = formatPhoneNumber(value)

  /**
   * Report error when phone number is not valid
   */
  if (!phoneNumber || !phoneNumber.isValid) {
    errorReporter.report(pointer, 'phone', 'Phone number is not valid', arrayExpressionPointer)
  }

  mutate(phoneNumber.internationWithoutPlus)
})
