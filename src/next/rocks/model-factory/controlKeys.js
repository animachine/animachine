import {recurseKeys, recurseParams} from './recursers'

export default function (ModelClass) {
  ModelClass.prototype.selectKeysAtTime = function (time) {
    recurseKeys(this, (key, param) => {
      if (key.time === time) {
        param.selectKey(key)
      }
    })
  }

  ModelClass.prototype.toggleKeysSelectionAtTime = function (time) {
    var hasSelected = false
    recurseKeys(this, (key, param) => {
      if (key.time === time && param.isSelectedKey(key)) {
        hasSelected = true
      }
    })

    recurseKeys(this, (key, param) => {
      if (key.time === time) {
        if (hasSelected) {
          param.deselectKey(key)
        }
        else {
          param.selectKey(key)
        }
      }
    })
  }

  ModelClass.prototype.forEachSelectedKey = function (fn) {
    recurseKeys(this, (key, param) => {
      if (param.isSelectedKey(key)) {
        fn(key, param)
      }
    })
  }

  ModelClass.prototype.deselectAllKeys = function () {
    recurseParams(param => param.deselectAllKeys())
  }

  ModelClass.prototype.findClosestKey = function (time) {
    var closestKey

    recurseKeys(key => {
      if (!closestKey) {
        closestKey = key
      }
      else {
        const diffA = Math.abs(closestKey.time - time)
        const diffB = Math.abs(key.time - time)

        if (diffB < diffA) {
          closestKey = key
        }
      }
    })

    return closestKey
  }

  // ModelClass.prototype.findNextKey = function (time) {
  //   var nextKey
  //
  //   recurseKeys(key => {
  //     if (key.time > time) {
  //       if (!nextKey) {
  //         nextKey = key
  //       }
  //       else {
  //         const diffA = Math.abs(nextKey.time - time)
  //         const diffB = Math.abs(key.time - time)
  //
  //         if (diffB < diffA) {
  //           nextKey = key
  //         }
  //       }
  //     }
  //   })
  //
  //   return nextKey
  // }
}
