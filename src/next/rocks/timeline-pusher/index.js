BETON.define({
  id: 'timeline-pusher',
  dependencies: ['project-manager'],
  init
})

function init({projectManager}) {
  const {setCurrentTimeOfTimeline} = projectManager.actions
  const {getCurrentTimeline} = projectManager.selectors
  let lastTime = performance.now()

  function push() {
    const time = performance.now()
    const timeline = getCurrentTimeline()
    if (timeline && timeline.isPlaying) {
      let nextTime = timeline.currentTime + time - lastTime
      setCurrentTimeOfTimeline({
        timelineId: timeline.id,
        currentTime: nextTime
      })
    }
    lastTime = time
    window.requestAnimationFrame(push)
  }
  window.requestAnimationFrame(push)
}
