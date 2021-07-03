'use strict'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import crypto from 'crypto'
import { isNil, lowerCase, omitBy } from 'lodash'
import faker from 'faker'
import currency from 'currency.js'
export const parseString =str=>{
  try {
    return JSON.parse(str)
  } catch (error) {
    return str
  }
}

/**
 * Format a phone number and return all valid formats
 * @param {String} phoneNumber
 * @param {*} countryCode
 */
export const formatPhoneNumber = (
  phoneNumber: string,
  countryCode?
): {
  isValid: boolean;
  international?: string;
  internationWithoutPlus?: string;
  country?: string;
  nationalNumber?: string;
} => {
  phoneNumber = phoneNumber.startsWith('0')
    ? phoneNumber
    : phoneNumber.startsWith('+')
      ? phoneNumber
      : `+${phoneNumber}`
  const phone = parsePhoneNumberFromString(phoneNumber, countryCode)

  if (!phone) {
    return {
      isValid: false,
    }
  }

  const rippleFormat = phone
    .formatInternational()
    .replace(/ /g, '')
    .startsWith('+')
    ? phone.formatInternational().substr(1)
    : phone.formatInternational()

  return {
    isValid: phone.isValid(),
    international: phone.formatInternational().replace(/ /g, ''),
    internationWithoutPlus: rippleFormat.replace(/ /g, ''),
    nationalNumber:
      phone.nationalNumber && phone.nationalNumber.replace(/ /g, ''),
    country: phone.country,
  }
}

export const createHmac = ({
  secret,
  data,
  algorithm = 'sha256',
}: {
  secret: string
  data: string
  algorithm?: string
}) =>
  crypto
    .createHmac(algorithm, secret)
    .update(Buffer.from(data) as any, 'utf8')
    .digest('hex')

export const omitNil = (obj)=> omitBy(obj, isNil)

export const handleGenerator = (firstName: string, lastName: string)=>{
  return `${lowerCase(firstName)}_${lowerCase(lastName)}_${faker.random.number({ min: 4, max: 4 })}`
}

export const formatCurrency = (amount, options={})=> currency(amount, options)