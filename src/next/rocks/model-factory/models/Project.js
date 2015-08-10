import Timeline from './Timeline'
import Model from '../Model'
import defineProperties from '../defineProperties'
import defineChildren from '../defineChildren'
import defineType from '../defineType'
import controlKeys from '../controlKeys'
import mandatoryParamGroups from '../mandatoryParamGroups'
import {recurseParams} from '../recursers'
import uid from 'uid'

@defineProperties([
  {name: 'currentTimelineIndex', type: 'int'}
])
@defineChildren({name: 'timeline', ChildClass: Timeline, current: true})
@defineProperties([
  {name: 'uid', type: 'string', initValue: () => uid()}
])
@defineType
export default class Project extends Model {

}
