import {observable} from 'mobservable'

BETON.define({
  id: 'timeline-pusher',
  dependencies: ['project-manager'],
  init
})

function init({projectManager}) {
  const {state, actions, getters} = projectManager.actions
  let lastTime = performance.now()
  //observe the length of the timeline so it don't have to recalculate it until
  // the time of the keys or the timeline don't changes
  const timelineLength = observable(() => {
    if (state.selectedTimeline) {
      return getters.getTimelineLength(state.selectedTimeline)
    }
  })

  function push() {
    const time = performance.now()
    const timeline = state.selectedTimeline
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
