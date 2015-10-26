import {createTarget} from 'react-animachine-enhancer'

export default function (node, rootComponent) {
  const itemTree = rootComponent.__itemTree
  // const rootTarget = createTarget(itemTree)
  debugger
  const {item:itemOfNode, key:keyOfNode} = findItemOfNode(itemTree, node)
  return [{type: 'find', selector: {key}}]
}

function findItemOfNode(itemTree, node) {
  let result
  recurseChildren({children: itemTree}, (item, key) => {
    if (item.node === node) {
      result = {item, key}
    }
  })
  return result
}


function iterateChildren(item, callback) {
  if (item) {
    item.forEach((childItem, key) => {
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
