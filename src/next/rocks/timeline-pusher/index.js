BETON.define('timeline-pusher', ['project'], project => {
  var lastTime = performance.now()

  function push() {
    const time = performance.now()
    const timeline = project.getCurrentTimeline()
    if (timeline && timeline.playing) {
      let nextTime = timeline.currentTime + time - lastTime
      project.actions.setTimelineCurrentTime({
        timelineId: timeline.itemId,
        currentTime: nextTime
      })
    }
    lastTime = time
    window.requestAnimationFrame(push)
  }
  window.requestAnimationFrame(push)
})
