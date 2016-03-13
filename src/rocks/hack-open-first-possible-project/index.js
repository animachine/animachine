import {autorun} from 'afflatus'

BETON.define({
  id: 'hack-open-first-possible-project',
  dependencies: ['project-manager'],
  init: ({projectManager}) => {

    return () => {
      const dispose = autorun(
        () => {
          if (projectManager.state.projects.length !== 0) {
            dispose()
            const project = projectManager.state.projects[0]
            projectManager.state.currentProject = project

            if (!project.currentTimelineId && project.timelines[0]) {
              project.currentTimelineId = project.timelines[0].id
            }
          }
        }
      )
    }
  }
})
