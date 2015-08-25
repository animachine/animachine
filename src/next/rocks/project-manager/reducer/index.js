import camelCase from 'lodash/string/camelCase'
import without from 'lodash/array/without'
import normalizeProjectTree from '../normalizeProjectTree'
import actions from '../actions'
import createItem from '../createItem'
import {
  getItemById,
  getKeyOfParamAtTime,
  getParamValueAtTime,
} from '../selectors'
import {
  recurseKeys,
  recurseParams,
  getKeysAtTime,
} from '../utils'

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
    case actions.SET_VALUE_OF_PARAM_AT_TIME: {
      const {value, paramId, time} = action
      return setValueOfParamAtTime({projectManager, value, paramId, time})
    }
    case actions.TOGGLE_KEYS_AT_TIME: {
      const {keyHolderId, time} = action
      const isEndParam = param => param.params.length === 0
      let allHasKey = true

      recurseParams({keyHolderId, callback: param => {
        const key = getKeyOfParamAtTime({paramId: param.id, time})
        if (isEndParam(param) && !key) {
          allHasKey = false
        }
      }})

      recurseParams({keyHolderId, callback: param => {
        if (isEndParam(param)) {
          if (allHasKey) {
            const key = getKeyOfParamAtTime({paramId: param.id, time})
            return removeChild({
              projectManager,
              parentId: param.id,
              childId: key.id,
              childrenKey: 'keys'
            })
          }
          else {
            const value = getParamValueAtTime({paramId: param.id, time})
            return setValueOfParamAtTime({
              projectManager,
              value,
              paramId: param.id,
              time,
            })
          }
        }
      }})
    }
    case actions.TOGGLE_KEYS_SELECTION_AT_TIME: {
      const {keyHolderId, time} = action
      const keysAtTime = getKeysAtTime({keyHolderId, time})
      const selected = keysAtTime.some(key => !key.selected)
      keysAtTime.forEach(key => {
        projectManager = setItem({projectManager, item: {...key, selected}})
      })
      return projectManager
    }
    case actions.SELECT_KEYS_AT_TIME: {
      const {keyHolderId, time} = action
      const keysAtTime = getKeysAtTime({keyHolderId, time})
      keysAtTime.forEach(key => {
        const item = {...key, selected: true}
        projectManager = setItem({projectManager, item})
      })
      return projectManager
    }
    case actions.DESELECT_ALL_KEYS: {
      const {keyHolderId} = action
      recurseKeys({keyHolderId, callback: key => {
        if (key.selected) {
          const item = {...key, selected: false}
          projectManager = setItem({projectManager, item})
        }
      }})
      return projectManager
    }
    case actions.TRANSLATE_SELECTED_KEYS: {
      const {keyHolderId, offset} = action
      recurseKeys({keyHolderId, callback: key => {
        if (key.selected) {
          const time = key.time + offset
          projectManager = setItem({projectManager, item: {...key, time}})
        }
      }})
      return projectManager
    }
    case actions.SET_VISIBLE_TIME_OF_TIMELINE: {
      const {timelineId, visibleTime} = action
      const timeline = getItemById({id: timelineId})
      return setItem({
        projectManager,
        item: {
          ...timeline,
          timescale: timeline.width / visibleTime
        }
      })
    }
  }

  if (rxSet.test(type)) {
    const [valueKey, targetKey] = type.match(rxSet).slice(1, 3).map(camelCase)
    const item = getItemById({id: action[`${targetKey}Id`]})
    return setItem({
      projectManager,
      item: {
        ...item,
        [valueKey]: action[valueKey]
      }
    })
  }

  return projectManager
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

function addChild({projectManager, childId, parentId, childrenKey}) {
  const parent = getItemById({id: parentId})
  return setItem({projectManager, item: {
    ...parent,
    [childrenKey]: [...parent[childrenKey], childId]
  }})
}

function removeChild({projectManager, childId, parentId, childrenKey}) {
  const parent = getItemById({id: parentId})
  return setItem({projectManager, item: {
    ...parent,
    [childrenKey]: without(parent[childrenKey], childId)
  }})
}


function setValueOfParamAtTime({projectManager, value, paramId, time}) {
  let key = getKeyOfParamAtTime({time, paramId})

  if (key) {
    return setItem({projectManager, item: {...key, value}})
  }

  key = createItem({
    type: 'key',
    data: {value, time}
  })
  projectManager = setItem({projectManager, item: key})
  return addChild({
    projectManager,
    parentId: paramId,
    childId: key.id,
    childrenKey: 'keys'
  })
}
