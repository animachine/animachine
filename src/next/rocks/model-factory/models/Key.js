import Model from '../Model'
import Ease from './Ease'
import defineProperties from '../defineProperties'
import defineChildren from '../defineChildren'
import defineType from '../defineType'
import controlKeys from '../controlKeys'
import mandatoryParamGroups from '../mandatoryParamGroups'
import {recurseParams} from '../recursers'

@defineProperties([
  {name: 'time', type: 'float'},
  {name: 'value'},
  {name: 'selected', type: 'boolean'},
  {name: 'ease', type: 'object'},
])
@defineType
export default class Key extends Model {
  constructor(...args) {
    super(...args)
    if (!this.ease) {
      this.ease = new Ease()
    }
    this.ease.on('change', () => this.emit('change.ease'))
  }
}
