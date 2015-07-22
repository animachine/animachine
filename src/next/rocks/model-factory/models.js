import EventEmitter from 'eventman'
import defineProperties from './defineProperties'
import defineChildren from './defineChildren'

@defineProperties([
  {name: 'currentTimelineIndex', type: 'int'}
])
@defineChildren({name: 'timeline'})
export class Project extends EventEmitter {}


@defineProperties([
  {name: 'currentTime', type: 'float'},
  {name: 'timescale', type: 'float'},
  {name: 'length', type: 'float'},
  {name: 'width', type: 'float'},
  {name: 'start', type: 'float'}
])
@defineChildren({name: 'track'})
export class Timeline extends EventEmitter {}


@defineChildren('param')
export class Track extends EventEmitter {}


@defineProperties([
  {name: 'currentTime', type: 'float'},
  {name: 'timescale', type: 'float'},
  {name: 'length', type: 'float'},
  {name: 'width', type: 'float'},
  {name: 'start', type: 'float'},
])
@defineChildren('key')
export class Param extends EventEmitter {}


@defineProperties([
  {name: 'time', type: 'float'},
  {name: 'value', },
  {name: 'selected', type: 'boolean'},
  {name: 'ease', type: 'object'},
])
export class Key extends EventEmitter {}


@defineProperties([
  {name: 'roughEase', type: 'boolean', startValue: false},
  {name: 'roughStrength', type: 'float', startValue: 1},
  {name: 'roughPoints', type: 'int', startValue: 20},
  {name: 'roughClamp', type: 'boolean', startValue: false},
  {name: 'roughRandomise', type: 'boolean', startValue: true},
  {name: 'roughTaper', type: 'string', startValue: 'none'},
])
export class Ease extends EventEmitter {}
