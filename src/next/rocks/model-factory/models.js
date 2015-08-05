import Model from './Model'
import defineProperties from './defineProperties'
import defineChildren from './defineChildren'
import defineType from './defineType'
import controlKeys from './controlKeys'
import uid from 'uid'
import mandatoryParamGroups from './mandatoryParamGroups'
import {recurseParams} from './recursers'

@defineProperties([
  {name: 'roughEase', type: 'boolean', startValue: false},
  {name: 'roughStrength', type: 'float', startValue: 1},
  {name: 'roughPoints', type: 'int', startValue: 20},
  {name: 'roughClamp', type: 'boolean', startValue: false},
  {name: 'roughRandomise', type: 'boolean', startValue: true},
  {name: 'roughTaper', type: 'string', startValue: 'none'},
])
@defineType
export class Ease extends Model {}


@defineProperties([
  {name: 'time', type: 'float'},
  {name: 'value', },
  {name: 'selected', type: 'boolean'},
  {name: 'ease', type: 'object'},
])
@defineType
export class Key extends Model {}


@defineProperties([
  {name: 'name', type: 'string'},
  {name: 'currentTime', type: 'float'},
  {name: 'timescale', type: 'float'},
  {name: 'length', type: 'float'},
  {name: 'width', type: 'float'},
  {name: 'start', type: 'float'},
  {name: 'openInTimeline', type: 'boolean', initValue: true},
])
@defineChildren({name: 'key', ChildClass: Key})
@defineChildren({name: 'param', ChildClass: Param})
@defineType
@controlKeys
export class Param extends Model {
  demandKeyLike(keySource) {
    var demandedKey = this.getKeyBy('time', keySource.time)
    if (!demandedKey) {
      demandedKey = new Key(keySource)
      this.addKey(demandedKey)
    }
    return demandedKey
  }
}

@defineProperties([
  {name: 'selectors'},
  {name: 'openInTimeline', type: 'boolean', initValue: true},
])
@defineChildren({name: 'param', ChildClass: Param})
@defineType
@controlKeys
export class Track extends Model {
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
    const parentParamName = mandatoryParamGroups.getParentName(demandedParam.name)
    if (parentParamName) {
      parent = this.demandParamLike({name: parentParamName})
    }

    demandedParam = new Param(paramSource)
    parent.addParam(demandedParam)
    return demandedParam
  }
}

@defineProperties([
  {name: 'name', type: 'string'},
  {name: 'currentTime', type: 'float', initValue: 0},
  {name: 'timescale', type: 'float', initValue: 1},
  {name: 'length', type: 'float', initValue: 60000},// px/ms
  {name: 'width', type: 'float', initValue: 2000},
  {name: 'start', type: 'float', initValue: 0},
  {name: 'startMargin', type: 'float', initValue: 6},
])
@defineChildren({name: 'track', ChildClass: Track})
@defineType
@controlKeys
export class Timeline extends Model {
  set visibleTime (v) {
      this.timescale = this.width / v
  }
  get visibleTime () {
      return this.width / this.timescale
  }
  get end() {
    return this.start + this.visibleTime
  }
  convertPositionToTime(position) {
    return this.start - ((this.width / position) * this.visibleTime)
  }
}


@defineProperties([
  {name: 'currentTimelineIndex', type: 'int'}
])
@defineChildren({name: 'timeline', ChildClass: Timeline, current: true})
@defineProperties([
  {name: 'uid', type: 'string', initValue: () => uid()}
])
@defineType
export class Project extends Model {

}
