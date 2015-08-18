export default function ({store}) {
  return {
    SET_TIMELINE_CURRENT_TIME: 'SET_TIMELINE_CURRENT_TIME',

    setTimelineCurrentTime({timelineId}) {
      store.dispatch({
        type: SET_TIMELINE_CURRENT_TIME,
        timelineId
      })
    }
  }
}
