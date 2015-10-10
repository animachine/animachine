import {createTarget} from 'animachine-enhancer'

export default function (node, rootNode) {
  const rootTarget = createTarget(rootTarget.__itemTree)
  const {item:itemOfNode, key:keyOfNode} = findItemOfNode(itemTree, node)
  return [{type: 'find', selector: {key}}]
}

function findItemOfNode(itemTree, node) {
  let result
  recurseChildren(itemTree, (item, key) => {
    if (item.node === node) {
      result = {item, key}
    }
  })
  return result
}


function iterateChildren(item, callback) {
  item.children.forEach((childItem, key) => {
    if (isMounted(childItem)) {
      callback(childItem, key)
    }
  })
}

function recurseChildren(item, callback) {
  iterateChildren(item, (childItem, key) => {
    callback(childItem, key)
    recurseChildren(childItem, callback)
  })
}
