import GSAPEnhancer from 'react-gsap-enhancer'

export default function (EnhancedComponent) {
  EnhancedComponent = GSAPEnhancer(EnhancedComponent)

  if ('production' !== process.env.NODE_ENV) {
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
