import createAnimationSource from '../../create-animation-source'
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
        if (
          runningAnimation._animationSource._amProject === this ||
          runningAnimation._animationSource._amProjectSource === this.projectSource
        ) {
          var timelineName = runningAnimation._animationSource._amTimelineName
          var projectSource = this.model.getSource()
          var animationSource = createAnimationSource(projectSource, timelineName)
          animationSource._amProject = this
          runningAnimation.replaceAnimationSource(animationSource)
        }
      })
    })
  }
}
