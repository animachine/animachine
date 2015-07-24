import Model from './Model'
import defineProperties from './defineProperties'
import defineChildren from './defineChildren'




@defineProperties([
  {name: 'roughEase', type: 'boolean', startValue: false},
  {name: 'roughStrength', type: 'float', startValue: 1},
  {name: 'roughPoints', type: 'int', startValue: 20},
  {name: 'roughClamp', type: 'boolean', startValue: false},
  {name: 'roughRandomise', type: 'boolean', startValue: true},
  {name: 'roughTaper', type: 'string', startValue: 'none'},
])
export class Ease extends Model {}


@defineProperties([
  {name: 'time', type: 'float'},
  {name: 'value', },
  {name: 'selected', type: 'boolean'},
  {name: 'ease', type: 'object'},
])
export class Key extends Model {}


@defineProperties([
  {name: 'name', type: 'string'},
  {name: 'currentTime', type: 'float'},
  {name: 'timescale', type: 'float'},
  {name: 'length', type: 'float'},
  {name: 'width', type: 'float'},
  {name: 'start', type: 'float'},
])
@defineChildren({name: 'key', ChildClass: Key})
@defineChildren({name: 'childParam', ChildClass: Param})
export class Param extends Model {}

@defineProperties([
  {name: 'selectors'}
])
@defineChildren({name: 'param', ChildClass: Param})
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
export class Timeline extends Model {}


@defineProperties([
  {name: 'currentTimelineIndex', type: 'int'}
])
@defineChildren({name: 'timeline', ChildClass: Timeline})
export class Project extends Model {}
