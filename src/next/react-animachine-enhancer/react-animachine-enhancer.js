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
  var superFn = proto[fnName]
  proto[fnName] = function (...args) {
    fn.call(this, ...args)
    if (superFn) {
      superFn.call(this, ...args)
    }
  }
}

function listenComponent(component) {
  if (global._registerMountedAnimachineComponent) {
    global._registerMountedAnimachineComponent(component)
  }
  else {
    if (!global._waitingMountedAnimachineComponents) {
      global._waitingMountedAnimachineComponents = []
    }
    global._waitingMountedAnimachineComponents.push(component)
  }
}

function unlistenComponent() {
}
