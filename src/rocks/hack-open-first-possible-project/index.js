import {autorunUntil} from 'mobservable'

BETON.define({
  id: 'hack-open-first-possible-project',
  dependencies: ['project-manager'],
  init: ({projectManager}) => {

    return () => {
      const dispose = autorunUntil(
        () => {
          if (projectManager.state.projects.length !== 0) {
            const project = projectManager.state.projects[0]
            projectManager.state.currentProject = project

            if (!project.currentTimelineId && project.timelines[0]) {
              project.currentTimelineId = project.timelines[0].id
            }
          }
        },
        () => !!projectManager.state.currentProject
      )
    }
  }
})
