import {Ease, Key, Param, Track, Timeline, Project} from './models'

export function recurseKeys(root: object, cb: function) {
  if (root instanceof Timeline) {
    return root.tracks.some(track => recurseKeys(track, cb))
  }
  else if (root instanceof Track) {
    return root.params.some(param => recurseKeys(param, cb))
  }
  else if (root instanceof Param) {
    return root.keys.some(key => cb(key))
  }
}

export function recurseKeyHolders(root: object, cb: function) {
  if (cb(root) !== true) {
    return true
  }
  if (root instanceof Timeline) {
    return root.tracks.some(track => recurseKeyHolders(track, cb))
  }
  if (root instanceof Track) {
    return root.params.some(param => recurseKeyHolders(param, cb))
  }
}
