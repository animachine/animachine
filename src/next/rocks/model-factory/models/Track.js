import Param from './Param'
import Model from '../Model'
import defineProperties from '../defineProperties'
import defineChildren from '../defineChildren'
import defineType from '../defineType'
import controlKeys from '../controlKeys'
import * as mandatoryParamGroups from '../mandatoryParamGroups'
import {recurseParams} from '../recursers'

@defineProperties([
  {name: 'name', type: 'string'},
  {name: 'selectors'},
  {name: 'openInTimeline', type: 'boolean', initValue: true},
])
@defineChildren({name: 'param', ChildClass: Param})
@defineType
@controlKeys
export default class Track extends Model {
  demandParamLike(paramSource) {
    var demandedParam
    recurseParams(this, param => {
      if (param.name === paramSource.name) {
        demandedParam = param
      }
    })

    if (demandedParam) {
      return demandedParam
    }

    var parent = this
    const parentParamName = mandatoryParamGroups.getParentName(paramSource.name)
    if (parentParamName) {
      parent = this.demandParamLike({name: parentParamName})
    }

    demandedParam = new Param(paramSource)
    parent.addParam(demandedParam)
    return demandedParam
  }

  getValueOfParamAtTime(paramName, time) {
    var value
    recurseParams(this, param => {
      if (param.name === paramName) {
        value = param.getValueAtTime(time)
      }
    })
  }

  setValueOfParamAtTime(value, paramName, time) {
    const param = this.demandParamLike({name: paramName})
    const key = param.demandKeyLike({time})
    key.value = value
  }
}
