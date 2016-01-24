export default function(rootTarget, selector) {
  if (selector.type === 'css') {
    //TODO throw if rootTarget not a dom element
    return rootTarget.querySelectorAll(selector.query)
  }
  else if (selector.type === 'react') {
    return rootTarget.findWithCommands(selector.query)
  }
}
