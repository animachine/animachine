import createItem from '../createItem'
import {getKeyOfParamAtTime} from '../selectors'
import without from 'lodash/without'

export function setItem({projectManager, item}) {
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

export function addChild({projectManager, childId, parentId, childrenKey}) {
  const parent = projectManager.items.find(item => item.id === parentId)
  return setItem({projectManager, item: {
    ...parent,
    [childrenKey]: [...parent[childrenKey], childId]
  }})
}

export function removeChild({projectManager, childId, parentId, childrenKey}) {
  const parent = projectManager.items.find(item => item.id === parentId)
  return setItem({projectManager, item: {
    ...parent,
    [childrenKey]: without(parent[childrenKey], childId)
  }})
}


export function setValueOfParamAtTime({projectManager, value, paramId, time}) {
  let key = getKeyOfParamAtTime({projectManager, time, paramId})

  if (key) {
    return setItem({projectManager, item: {...key, value}})
  }

  key = createItem({type: 'key', data: {value, time}})
  const ease = createItem({type: 'ease'})
  key.ease = ease.id
  projectManager = setItem({projectManager, item: ease})
  projectManager = setItem({projectManager, item: key})

  return addChild({
    projectManager: projectManager,
    parentId: paramId,
    childId: key.id,
    childrenKey: 'keys'
  })
}
