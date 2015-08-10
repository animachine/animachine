import Model from '../Model'
import defineProperties from '../defineProperties'
import defineChildren from '../defineChildren'
import defineType from '../defineType'
import controlKeys from '../controlKeys'
import mandatoryParamGroups from '../mandatoryParamGroups'
import {recurseParams} from '../recursers'

@defineProperties([
  {name: 'time', type: 'string', initValue: 'bezier'},
  {name: 'pointAX', type: 'number', initValue: 0, min: 0, max: 1},
  {name: 'pointAY', type: 'number', initValue: 0},
  {name: 'pointBX', type: 'number', initValue: 1, min: 0, max: 1},
  {name: 'pointBY', type: 'number', initValue: 1},
  {name: 'roughEase', type: 'boolean', startValue: false},
  {name: 'roughStrength', type: 'float', startValue: 1},
  {name: 'roughPoints', type: 'int', startValue: 20},
  {name: 'roughClamp', type: 'boolean', startValue: false},
  {name: 'roughRandomise', type: 'boolean', startValue: true},
  {name: 'roughTaper', type: 'string', startValue: 'none'},
])
@defineType
export default class Ease extends Model {}
