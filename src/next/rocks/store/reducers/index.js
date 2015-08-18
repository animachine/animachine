import {combineReducers} from 'redux'
import item from './item'
import projectContainer from './projectContainer'
import inspectedComponents from './inspectedComponents'

const rootReducer = combineReducers({
  inspectedComponents,
  projectContainer,
  item
})

export default rootReducer
