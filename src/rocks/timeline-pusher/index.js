import {createComputedValue} from 'afflatus'

BETON.define({
  id: 'timeline-pusher',
  dependencies: ['project-manager'],
  init
})

function init({projectManager}) {
  const {state, actions, getters} = projectManager
  let lastTime = performance.now()
  //observe the length of the timeline so it don't have to recalculate it until
  // the time of the keys or the timeline don't changes
  const timelineLength = createComputedValue(() => {
    if (state.currentTimeline) {
      return getters.getTimelineLength(state.currentTimeline)
    }
  })

  function push() {
    const time = performance.now()
    const timeline = state.currentTimeline
    if (timeline && timeline.isPlaying) {
      let nextTime = timeline.currentTime + time - lastTime
      nextTime %= timelineLength
      actions.set(timeline, 'currentTime', nextTime)
    }
    lastTime = time
    window.requestAnimationFrame(push)
  }
  window.requestAnimationFrame(push)
}
