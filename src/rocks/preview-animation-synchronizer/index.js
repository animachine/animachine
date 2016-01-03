import {createAnimationSource} from 'animachine-connect'
import {observable, autorun} from 'mobservable'

BETON.define({
  id: 'preview-animation-synchronizer',
  dependencies: ['project-manager', 'preview-registry'],
  init: ({projectManager, previewRegistry}) => {
    const previews = observable(() => {
      const timeline = projectManager.state.currentTimeline
      return timeline
        ? previewRegistry.getters.getPreviewsOfTimelnie(timeline)
        : []
    })

    autorun(() => {
      const timeline = projectManager.state.currentTimeline
      if (!timeline) {
        return
      }
      const timelineSource = timeline.getProductionSource()
      const animationSource = createAnimationSource(timelineSource)
      previews().forEach(({rootTarget, gsapAnimation}) => {
        //TODO do controller.replaceAnimationSource(animationSource) in react
        gsapAnimation.clear().add(animationSource(rootTarget))
      })

      previews.forEach(({gsapAnimation}) => gsapAnimation.time(time))
    })

    autorun(() => {
      const timeline = projectManager.state.currentTimeline
      if (!timeline) {
        return
      }
      const time = timeline.currentTime
      previews().forEach(({gsapAnimation}) => gsapAnimation.time(time))
    })
  }
})
