import Model from './Model'
import defineProperties from './defineProperties'
import defineChildren from './defineChildren'
import defineType from './defineType'
import uid from 'uid'




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
export class Param extends Model {}

@defineProperties([
  {name: 'selectors'},
  {name: 'openInTimeline', type: 'boolean', initValue: true},
])
@defineChildren({name: 'param', ChildClass: Param})
@defineType
export class Track extends Model {}

@defineProperties([
  {name: 'name', type: 'string'},
  {name: 'currentTime', type: 'float', initValue: 0},
  {name: 'timescale', type: 'float', initValue: 1},
  {name: 'length', type: 'float', initValue: 60000},
  {name: 'width', type: 'float', initValue: 2000},
  {name: 'start', type: 'float', initValue: 0},
  {name: 'startMargin', type: 'float', initValue: 6},
])
@defineChildren({name: 'track', ChildClass: Track})
@defineType
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
  deselectAllKeys() {
    this.forEachTrack(track => track.forEachParam(param => deselectIn(param)))

    function deselectIn(param) {
      param.deselectAllKeys()
      param.forEachParam(param => deselectIn(param))
    }
  }
  convertClientXToTime(clientX) {
    return this.time
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
