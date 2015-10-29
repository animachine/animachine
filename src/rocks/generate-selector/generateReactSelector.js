import {createTarget} from 'react-animachine-enhancer'

export default function (node, rootComponent) {
  const itemTree = rootComponent.__itemTree
  // const rootTarget = createTarget(itemTree)
  const {item:itemOfNode, key:keyOfNode} = findItemOfNode(itemTree, node)
  if (keyOfNode) {
    return [{type: 'find', selector: {key: keyOfNode}}]
  }
  else {
    return false
  }
}

function findItemOfNode(itemTree, node) {
  let result = {}
  recurseChildren(itemTree, (item, key) => {
    if (item.node === node) {
      result = {item, key}
    }
  })
  return result
}


function iterateChildren(childItemMap, callback) {
  if (childItemMap) {
    childItemMap.forEach((childItem, key) => {
      if (isMounted(childItem)) {
        callback(childItem, key)
      }
    })
  }
}

function recurseChildren(item, callback) {
  iterateChildren(item, (childItem, key) => {
    callback(childItem, key)
    recurseChildren(childItem.children, callback)
  })
}

function isMounted(item) {
  return !!item.node
}
