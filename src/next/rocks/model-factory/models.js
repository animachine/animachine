import Model from './Model'
import defineProperties from './defineProperties'
import defineChildren from './defineChildren'
import defineType from './defineType'




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
  {name: 'openInTimeline', type: 'boolean'},
])
@defineChildren({name: 'key', ChildClass: Key})
@defineChildren({name: 'param', ChildClass: Param})
@defineType
export class Param extends Model {}

@defineProperties([
  {name: 'selectors'},
  {name: 'openInTimeline', type: 'boolean'},
])
@defineChildren({name: 'param', ChildClass: Param})
@defineType
export class Track extends Model {}

@defineProperties([
  {name: 'name', type: 'string'},
  {name: 'currentTime', type: 'float'},
  {name: 'timescale', type: 'float'},
  {name: 'length', type: 'float'},
  {name: 'width', type: 'float'},
  {name: 'start', type: 'float'}
])
@defineChildren({name: 'track', ChildClass: Track})
@defineType
export class Timeline extends Model {}


@defineProperties([
  {name: 'currentTimelineIndex', type: 'int'}
])
@defineChildren({name: 'timeline', ChildClass: Timeline})
@defineType
export class Project extends Model {
  getCurrentTimeline() {
    return this.getTimeline(0)
  }
}
