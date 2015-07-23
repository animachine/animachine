var modelFactory
BETON.getRock('model-factory', rock => modelFactory = rock)

export default class Project {
  constructor(projectSource, previewComponents) {
    this.projectSource = projectSource
    this.previewComponents = previewComponents
    this.model = modelFactory.create(projectSource)

    this.model.on('change', this.handleSourceChange)
    // this.model = BETON.getRock('model-factory').create(projectSource)
  }

  handleSourceChange = () => {
    this.previewComponents.forEach(previewComponent => {
      previewComponent.__runningAnimations.forEach(runningAnimation => {
        if (runningAnimation._gsapAnimationFactory._animachineProject === this) {
          var timelineName = runningAnimation._gsapAnimationFactory._animachineTimelineName
          var animationSource = createAnimationSource(this, timelineName)
          runningAnimation.replaceGSAPAnimationFactory(animationSource)
        }
      })
    })
  }
}
