import {createAnimationSource} from 'animachine-connect'
import {autorun} from 'afflatus'

BETON.define({
  id: 'preview-animation-synchronizer',
  dependencies: ['project-manager'],
  init: ({projectManager, previewRegistry}) => {
    let lastUpdatedTime = 0

    autorun(() => {
      const timeline = projectManager.state.currentTimeline
      if (!timeline) {
        return
      }
      const timelineSource = timeline.animationSource
      const animationSource = createAnimationSource(timelineSource)

      timeline.previews.forEach(({rootTarget, gsapAnimation}) => {
        //TODO do controller.replaceAnimationSource(animationSource) in react
        // const trackTimelines = animationSource(rootTarget)
        //   .pause()
        //   .getChildren()
// console.log('update at ', lastUpdatedTime)

        gsapAnimation
          .time(0)
          .clear()
          // .add(trackTimelines, 0, 'start')
          .add(animationSource(rootTarget), 0/*, 'start'*/)
          .seek(lastUpdatedTime / 1000)
          // .render()
      })
    })

    autorun(() => {
      const timeline = projectManager.state.currentTimeline
      if (!timeline) {
        return
      }
      lastUpdatedTime = timeline.currentTime

      timeline.previews.forEach(({gsapAnimation}) => {
        gsapAnimation
          .pause()
          .seek(lastUpdatedTime / 1000)
      })
    })
  }
})
