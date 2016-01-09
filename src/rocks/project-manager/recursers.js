import {Ease, Key, Param, Track, Timeline, Project} from './models'

export function recurseKeys(root: object, cb: Function) {
  return recurseParams(root, param => {
    return param.keys.some(key => cb(key))
  })
}

export function recurseParams(root: object, cb: Function) {
  if (root instanceof Timeline) {
    return root.tracks.some(track => recurseParams(track, cb))
  }
  else if (root instanceof Track) {
    return root.params.some(param => cb(param))
  }
  else if (root instanceof Param) {
    return cb(root)
  }
}

export function recurseKeyHolders(root: object, cb: Function) {
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

export function recurseAll(
  root: object,
  cb: Function,
  path: Array<object> = []
) {
  if (cb(root) !== true) {
    return true
  }
  if (root instanceof Project) {
    return root.timelines.some(timeline => recurseAll(timeline, cb))
  }
  if (root instanceof Timeline) {
    return root.tracks.some(track => recurseAll(track, cb))
  }
  if (root instanceof Track) {
    return root.params.some(param => recurseAll(param, cb))
      || root.selectors.some(selector => recurseAll(selector, cb))
  }
  if (root instanceof Param) {
    return root.keys.some(key => recurseAll(key, cb))
  }
  if (root instanceof Key) {
    return recurseAll(key, cb) || recurseAll(key.ease, cb)
  }
}
