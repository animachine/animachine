import isArray from 'lodash/lang/isArray'

const combineds = new WeakMap()

function matchExtras(a, b) {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)

  return aKeys.length === aKeys.length &&
    aKeys.every(key => {
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

//merges two objects
//memorize the result
//if it's called with the same item and a shallowly equal extra item return the
// memorized result (so the result can be tested for change with ===)
//if dontMerge is true it's only returns the nextExtra
// or the memorized version of it
export default function combine(item, nextExtra, {dontMerge}) {
  if (!combineds.has(item)) {
    combineds.set(item, dontMerge ? nextExtra : item)
  }
  const memorized = combineds.get(item)

  if (matchExtras(nextExtra, memorized)) {
    return memorized
  }
  else {
    const combined = dontMerge ? nextExtra : {...item, ...nextExtra}
    combineds.set(item, combined)
    return combined
  }
}
