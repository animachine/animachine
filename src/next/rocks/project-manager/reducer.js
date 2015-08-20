import camelCase from 'lodash/string/camelCase'
import normalizeProjectTree from './normalizeProjectTree'
import actions from './actions'
import {
  getItemById
} from './selectors'

const rxSet = /^SET_([A-Z_]+?)_OF_([A-Z]+?)$/
const rxAdd = /^ADD_([A-Z_]+?)_TO_([A-Z]+?)$/
const rxRemove = /^REMOVE_([A-Z_]+?)_FROM_([A-Z]+?)$/

const initialState = {
  currentProjectId: undefined,
  openedProjectIds: [],
  previewComponentsByProjectId: {},
  items: []
}

export default function (projectManager = initialState, action) {
  const {type} = action

  if (rxSet.test(type)) {
    const [valueKey, targetKey] = type.match(rxSet).slice(1, 3).map(camelCase)
    return updateItem({
      projectManager,
      id: action[`${targetKey}Id`],
      mod: {
        [valueKey]: action[valueKey]
      }
    })
  }
  else {
    switch (type) {
      case actions.OPEN_PROJECT: {
        const {items, projectId} = normalizeProjectTree(action.projectSource)
        console.log('OPEN_PROJECT', {items, projectId})
        return {
          ...projectManager,
          items: [
            ...projectManager.items,
            ...items
          ],
          openedProjectIds: [
            ...projectManager.openedProjectIds,
            projectId
          ],
          previewComponentsByProjectId: {
            ...projectManager.previewComponentsByProjectId,
            [projectId]: action.previewComponents
          },
          currentProjectId: projectManager.currentProjectId || projectId
        }
      }
      default:
        return projectManager
    }
  }
}

function updateItem({projectManager, id, mod}) {
  const item = getItemById({id})
  return setItem({projectManager, item: {...item, ...mod}})
}

function setItem({projectManager, item}) {
  const {items} = projectManager
  const index = items.findIndex(({id}) => id === item.id)
  return {
    ...projectManager,
    items: index === -1 ?
      [...items, item]
      : [
        ...items.slice(0, index),
        item,
        ...items.slice(index + 1)
      ]
  }
}

function toggleKeys() {
  const hasKeyNow = this.hasKeyNow()
  const time = timeline.currentTime

  if (param.getParamsLength() > 0) {
    param.forEachParam(childParam => {
      toggle(childParam)
    })
  }
  else {
    toggle(param)
  }

  function toggle(param) {
    if (hasKeyNow) {
      let key = param.getKeyBy('time', time)
      param.removeKey(key)
    }
    else {
      let value = param.getValueAtTime(time)
      let key = param.demandKeyLike({time})
      key.value = param.getValueAtTime(time)
    }
  }
}

function hasKeyNow() {
  const hasKeyNow = this.hasKeyNow()
  const time = timeline.currentTime

  if (param.getParamsLength() > 0) {
    param.forEachParam(childParam => {
      toggle(childParam)
    })
  }
  else {
    toggle(param)
  }

  function toggle(param) {
    if (hasKeyNow) {
      let key = param.getKeyBy('time', time)
      param.removeKey(key)
    }
    else {
      let value = param.getValueAtTime(time)
      let key = param.demandKeyLike({time})
      key.value = param.getValueAtTime(time)
    }
  }
}
