import {defineModel, createModel, createArray, autorun} from 'afflatus'

defineModel({
  type: 'RunningTimeline',
  simpleValues: {
    timeline: {type: 'Timeline'},
  },
  arrayValues: {
    previews: {},
  }
})

class Preview {
  rootTarget = null
  gsapAnimation = null
}

BETON.define({
  id: 'preview-registry',
  dependencies: [],
  init: () => {
    const state = {
      runningTimelines: createArray('RunningTimeline').get()
    }

    function registerRunningTimeline(timeline, rootTarget, gsapAnimation) {
      console.log('>> preview-registry: registerRunningTimeline', timeline.name, rootTarget, gsapAnimation)

      let runningTimeline = state.runningTimelines.find(
        runningTimeline => runningTimeline.timeline === timeline
      )

      if (!runningTimeline) {
        runningTimeline = createModel('RunningTimeline', {timeline})
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

    global.__animachineRegisterRunningTimeline = createArray(
      null,
      global.__animachineRegisterRunningTimeline
    ).get()
    let pos = 0
    autorun(() => {
      while(pos < global.__animachineRegisterRunningTimeline.getLength()) {
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
