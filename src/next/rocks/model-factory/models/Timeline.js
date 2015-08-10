import Track from './Track'
import Model from '../Model'
import defineProperties from '../defineProperties'
import defineChildren from '../defineChildren'
import defineType from '../defineType'
import controlKeys from '../controlKeys'
import mandatoryParamGroups from '../mandatoryParamGroups'
import {recurseParams} from '../recursers'

@defineProperties([
  {name: 'name', type: 'string'},
  {
    name: 'currentTime',
    type: 'float',
    initValue: 0,
    fixValue: value => Math.max(0, value)
  },
  {name: 'length', type: 'float', initValue: 60000},
  //TODO remove these from the model
  {
    name: 'timescale', // px/ms
    type: 'float',
    initValue: 1,
    fixValue: value => Math.min(3, Math.max(0.0001, value))
  },
  {name: 'width', type: 'float', initValue: 2000},
  {
    name: 'start', // start offset in ms
    type: 'float',
    initValue: 0,
    fixValue: function (value) {
      return Math.min(this.startMargin / this.timescale, value)
    }
  },
  {name: 'startMargin', type: 'float', initValue: 6},//in pixel
])
@defineChildren({name: 'track', ChildClass: Track})
@defineType
@controlKeys
export default class Timeline extends Model {
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
    return ((position / this.width) * this.visibleTime) - this.start
  }
  convertTimeToPosition(time) {
    return (time + this.start) * this.timescale
  }
}
