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

  ModelClass.prototype.translateSelectedKeys = function (offset) {
    recurseKeys(this, (key, param) => {
      if (param.isSelectedKey(key)) {
        key.time += offset
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
}
