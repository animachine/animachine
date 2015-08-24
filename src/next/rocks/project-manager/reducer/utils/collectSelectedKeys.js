import {recurseKeys} from './recursers'

export default function ({keyHolder}) {
  const result = []
  recurseKeys(keyHolder, key => {
    if (key.selected) {
      result.push(key)
    }
  })
}
