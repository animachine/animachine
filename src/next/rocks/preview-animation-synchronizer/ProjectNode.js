import {createAnimationSource} from 'react-animachine-enhancer'
var modelFactory
BETON.getRock('model-factory', rock => modelFactory = rock)

export default class Project {
  constructor(projectSource, previewComponents) {
    this.projectSource = projectSource
    this.previewComponents = previewComponents
    this.model = modelFactory.create(projectSource)
    this.wrapAnimationSource = createAnimationSourceWrapper()

    this.model.on('change.currentTimeline', this.trackCurrentTimeline)
    this.trackCurrentTimeline()
  }

  trackCurrentTimeline = () => {
    if (this._currentTimeline) {
      this._currentTimeline.off('change.track', this.handleSourceChange)
    }
    this._currentTimeline = this.model.getCurrentTimeline()
    this._currentTimeline.on('change.track', this.handleSourceChange)
    this.handleSourceChange()
  }

  handleSourceChange = () => {
    this.previewComponents.forEach(previewComponent => {
      previewComponent.__runningAnimations.forEach(runningAnimation => {
        if (
          runningAnimation._animationSource._amProject === this ||
          runningAnimation._animationSource._amProjectSource === this.projectSource
        ) {
          var timelineName = runningAnimation._animationSource._amTimelineName
          var timeline = this.model.findTimelineBy('name', timelineName)

          var projectSource = this.model.getSource()
          var animationSource = this.wrapAnimationSource(
            createAnimationSource(projectSource, timelineName),
            timeline
          )
          animationSource._amProject = this
          animationSource._amTimelineName = timelineName
          runningAnimation.replaceAnimationSource(animationSource)
        }
      })
    })
  }
}

function createAnimationSourceWrapper() {
  var disposeLast

  return (animationSource, timeline) => {
    console.log('wrap')
    return (...args) => {
      const gsTimeline = animationSource(...args)
      const setTime = () => gsTimeline.time(timeline.currentTime / 1000)
      gsTimeline.pause()
      setTime()
      timeline.on('change.currentTime', setTime)

      if (disposeLast) {
        disposeLast()
      }
      disposeLast = () => timeline.off('change.currentTime', setTime)

      return gsTimeline
    }
  }
}
