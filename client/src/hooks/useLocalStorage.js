import { useEffect, useState } from 'react'
import { parseString } from '../helpers/utils'

export default function useLocalStorage (key, initialValue) {
  const [value, setValue] = useState(initialValue || window.localStorage.getItem(key))

  const setItem = newValue => {
    setValue(newValue)
    window.localStorage.setItem(key, JSON.stringify(newValue))
  }

  useEffect(() => {
    const handleStorage = event => {
      if (event.key === key && event.newValue !== value) {
        setValue(event.newValue)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return [parseString(value)?? undefined, setItem]
}
