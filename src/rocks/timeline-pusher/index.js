import {createComputedValue} from 'afflatus'

BETON.define({
  id: 'timeline-pusher',
  dependencies: ['project-manager'],
  init
})

function init({projectManager}) {
  const {state, actions, getters} = projectManager
  let lastTime = performance.now()

  function push() {
    const time = performance.now()
    const timeline = state.currentTimeline
    if (
      timeline
      && timeline.isPlaying
      && timeline.lastKeyTime > 0
    ) {
      let nextTime = timeline.currentTime + time - lastTime
      nextTime %= timeline.lastKeyTime
      timeline.currentTime = nextTime
    }
    lastTime = time
    window.requestAnimationFrame(push)
  }
  window.requestAnimationFrame(push)
}
