
@defineProperties({
  activeTimelineIndex: {
    type: 'int'
  }
})
@defineChildren('timeline')
export class Project extends Model {}


@defineProperties({
  currentTime: {type: 'float'}
  timescale: {type: 'float'}
  length: {type: 'float'}
  width: {type: 'float'}
  start: {type: 'float'}
})
@defineChildren('track')
export class Timeline extends Model {}


@defineChildren('param')
export class Track extends Model {}


@defineProperties({
  currentTime: {type: 'float'}
  timescale: {type: 'float'}
  length: {type: 'float'}
  width: {type: 'float'}
  start: {type: 'float'}
})
@defineChildren('key')
export class Param extends Model {}


@defineProperties({
  time: {type: 'float'}
  value: {}
  selected: {type: 'boolean'}
  ease: {type: 'object'}
})
export class Key extends Model {}


@defineProperties({
  roughEase: {type: 'boolean', startValue: false},
  roughStrength: {type: 'float', startValue: 1},
  roughPoints: {type: 'int', startValue: 20},
  roughClamp: {type: 'boolean', startValue: false},
  roughRandomise: {type: 'boolean', startValue: true},
  roughTaper: {type: 'string', startValue: 'none'},
})
export class Ease extends Model {}
