import useLocalStorage from 'react-use-localstorage'
import { parseString } from '../helpers/utils'

const USER_COOKIE_NAME = '@user@me_'

export default function useLocalStorageUser () {
  const [item, setItem] = useLocalStorage(USER_COOKIE_NAME)

  return { item: parseString(item), setItem }
}
