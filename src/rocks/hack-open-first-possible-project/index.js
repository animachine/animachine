import {autorun} from 'afflatus'

BETON.define({
  id: 'hack-open-first-possible-project',
  dependencies: ['project-manager'],
  init: ({projectManager}) => {

    return () => {
      const dispose = autorun(
        () => {
          if (projectManager.state.projects.getLength() !== 0) {
            dispose()
            const project = projectManager.state.projects[0]
            projectManager.state.currentProject = project

            if (!project.currentTimeline && project.timelines[0]) {
              project.currentTimeline = project.timelines[0]
            }
          }
        }
      )
    }
  }
})
