import {createAnimationSource} from 'animachine-connect'

BETON.define({
  id: 'preview-animation-synchronizer',
  dependencies: ['project-manager', 'preview-registry'],
  init: ({projectManager, previewRegistry}) => {
    const previews = observable(() => {
      const timeline = projectManager.state.currentTimeline
      return previewRegistry.getters.getPreviewsOfTimelnie(timeline)
    })
    
    autorun(() => {
      const animationSource = createAnimationSource(timelineSource, project)
      previews().forEach(({rootTarget, gsapAnimation}) => {
        //TODO do controller.replaceAnimationSource(animationSource) in react
        gsapAnimation.clear().add(animationSource(rootTarget))
      })

      previews.forEach(({gsapAnimation}) => gsapAnimation.time(time))
    })

    autorun(() => {
      const time = projectManager.state.currentTimeline.currentTime
      previews().forEach(({gsapAnimation}) => gsapAnimation.time(time))
    })
  }
})
