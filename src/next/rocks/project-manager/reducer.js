import normalizeProjectTree from './normalizeProjectTree'
import actions from './actions'
import {
  getItemById
} from './selectors'

const rxSet = /SET_([A-Z_]+?)_OF_([A-Z]+?)/
const rxAdd = /ADD_([A-Z_]+?)_TO_([A-Z]+?)/
const rxRemove = /REMOVE_([A-Z_]+?)_FROM_([A-Z]+?)/

const initialState = {
  currentProjectId: undefined,
  openedProjectIds: [],
  previewComponentsByProjectId: [],
  items: []
}

export default function (projectManager = initialState, action) {
  const {type} = action
  
  if (rxSet.test(type)) {
    const [match, value, target] = type.match(rxSet)
    return updateItem({
      projectManager,
      id: action[`${target}Id`],
      mod: {
        [valueKey]: action[valueKey]
      }
    })
  }
  else {
    switch (type) {
      case actions.OPEN_PROJECT: {
        const {items, projectId} = normalizeProjectTree(action.projectTree)
        return {
          ...projectManager,
          items: [
            ...projectManager.items,
            ...items
          ],
          openedProjectIds: [
            ...projectManager.openedProjectIds,
            projectId
          ]
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
        newItem,
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
