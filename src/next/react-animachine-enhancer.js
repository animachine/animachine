import gsapEnhancer from 'react-gsap-enhancer'

export default function (...options) {
  var enhance = gsapEnhancer(...options)

  return function (TargetComponent) {
    var EnhancedComponent = enhance(TargetComponent)

    if (process.env.NODE_ENV !== 'production') {
      decorateFunction(
        EnhancedComponent.prototype,
        'componentDidMount',
        function () {
          listenComponent(this)
        }
      )
      decorateFunction(
        EnhancedComponent.prototype,
        'componentWillUnmount',
        function () {
          unlistenComponent(this)
        }
      )
    }

    return EnhancedComponent
  }
}

function decorateFunction(proto, fnName, fn) {

}

function listenComponent(component) {
  if (global.LIVING_ANIMACHINE_COMPONENTS) {
    global.LIVING_ANIMACHINE_COMPONENTS.set(component)
  }
  else {
    setTimeout(listenComponent, 312, component)
  }
}

function unlistenComponent() {
}
