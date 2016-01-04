import {fastArray, observable, autorun} from 'mobservable'

class RunningTimeline {
  @observable timeline = null
  @observable previews = []
}

class Preview {
  rootTarget = null
  gsapAnimation = null
}

BETON.define({
  id: 'preview-registry',
  dependencies: [],
  init: () => {
    const state = {
      runningTimelines: fastArray()
    }

    function registerRunningTimeline(timeline, rootTarget, gsapAnimation) {
      console.log('>> preview-registry: registerRunningTimeline', timeline.name, rootTarget, gsapAnimation)

      let runningTimeline = state.runningTimelines.find(
        runningTimeline => runningTimeline.timeline === timeline
      )

      if (!runningTimeline) {
        runningTimeline = new RunningTimeline()
        runningTimeline.timeline = timeline
        state.runningTimelines.push(runningTimeline)
      }

      if (!runningTimeline.previews.find(
        preview => preview.rootTarget === rootTarget
      )) {
        const preview = new Preview()

        console.log('>> preview-registry: create Preview', rootTarget, gsapAnimation)
        preview.rootTarget = rootTarget
        preview.gsapAnimation = gsapAnimation
        runningTimeline.previews.push(preview)
      }
    }

    global.__animachineRegisterRunningTimeline = fastArray(
      global.__animachineRegisterRunningTimeline
    )
    let pos = 0
    autorun(() => {
      while(pos < global.__animachineRegisterRunningTimeline.length) {
        const args = global.__animachineRegisterRunningTimeline[pos]
        registerRunningTimeline(...args)
        ++pos
      }
    })

    return {
      state,
      actions: {
        registerRunningTimeline
      },
      getters: {
        getPreviewsOfTimeline(timeline) {
          let runningTimeline = state.runningTimelines.find(
            runningTimeline => runningTimeline.timeline === timeline
          )
          return runningTimeline ? runningTimeline.previews : []
        }
      }
    }
  }
})
