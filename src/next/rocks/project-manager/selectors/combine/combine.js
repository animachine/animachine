import isArray from 'lodash/lang/isArray'

const combineds = new WeakMap()

function matchExtras(a, b) {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)

  return aKeys.every(key => {
    const aValue = a[key]
    const bValue = b[key]

    if (isArray(aValue)) {
      return aValue.every((aValueChild, index) => aValueChild === bValue[index])
    }
    else {
      return aValue === bValue
    }
  })
}

export default function combine(item, nextExtra) {
  if (!combineds.has(item)) {
    combineds.set(item, item)
  }
  const memorized = combineds.get(item)

  if (matchExtras(nextExtra, memorized)) {
    return memorized
  }
  else {
    const combined = {...item, ...nextExtra}
    combineds.set(item, combined)
    return combined
  }
}
