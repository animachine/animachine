export default function(rootTarget, selector) {
  if (selector.selectorType === 'css') {
    //TODO throw if rootTarget not a dom element
    if (selector.query === ':root') {
      return [rootTarget]
    }
    else {
      try {
        return [...rootTarget.querySelectorAll(selector.query)]
      }
      catch (e) {
        console.warn(`error on using css selector  "${selector.query}"`)
        return []
      }
    }
  }
  else if (selector.selectorType === 'react') {
    return rootTarget.findWithCommands(selector.query)
  }
}
