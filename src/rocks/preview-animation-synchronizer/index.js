import {createAnimationSource} from 'animachine-connect'
import {observable, autorun} from 'mobservable'

BETON.define({
  id: 'preview-animation-synchronizer',
  dependencies: ['project-manager', 'preview-registry'],
  init: ({projectManager, previewRegistry}) => {
    let lastUpdatedTime = 0

    autorun(() => {
      const timeline = projectManager.state.currentTimeline
      if (!timeline) {
        return
      }
      const previews = projectManager.state.currentPreviews
      const timelineSource = timeline.getProductionSource()
      const animationSource = createAnimationSource(timelineSource)

      previews.forEach(({rootTarget, gsapAnimation}) => {
        //TODO do controller.replaceAnimationSource(animationSource) in react
        // const trackTimelines = animationSource(rootTarget)
        //   .pause()
        //   .getChildren()
// console.log('update at ', lastUpdatedTime)
        gsapAnimation
          .time(0)
          .clear()
          // .add(trackTimelines, 0, 'start')
          .add(animationSource(rootTarget), 0, 'start')
          .seek(lastUpdatedTime / 1000)
          // .render()
      })
    })

    autorun(() => {
      const timeline = projectManager.state.currentTimeline
      if (!timeline) {
        return
      }
      const previews = projectManager.state.currentPreviews
      lastUpdatedTime = timeline.currentTime
      global.delme = previews[0]

      previews.forEach(({gsapAnimation}) => {
        gsapAnimation
          .pause()
          .seek(lastUpdatedTime / 1000)
      })
    })
  }
})
