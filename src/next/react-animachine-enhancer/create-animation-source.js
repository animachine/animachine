import createEaser from './createEaser'

const sortKeys = (a, b) => a.time - b.time

export default function createAnimationSource({projectSource, timeline}) {
  function animationSource(connect) {
    const tlRoot = new TimelineMax()

    function addParams(params, targets) {
      params.forEach(param => {
        const tlParam = new TimelineMax()
        let headTime = 0

        if (param.keys && param.keys.length) {
          // let log = param.name
          param.keys.sort(sortKeys).forEach(key => {
            const duration = key.time - headTime

            tlParam.to(
              targets,
              duration / 1000,
              {
                [param.name]: key.value,
                ease: createEaser(key.ease)
              },
              headTime
            )
            // log += ` > ${key.value}@${key.time}`
            headTime = key.time
          })
// console.log(log)
        }
        tlRoot.add(tlParam, 0)

        if (param.params) {
          addParams(param.params, targets)
        }
      })
    }

    timeline.tracks.forEach(track => {
      const targets = track.selectors.map(selector => {
        return connect.getTargetByKeys(selector)
      })

      addParams(track.params, targets)
    })

    return tlRoot
  }

  animationSource._amProjectSource = projectSource
  animationSource._amTimelineName = timeline.name

  return animationSource
}
