import {autorun} from 'mobservable'

BETON.define({
  id: 'hack-open-first-possible-project',
  dependencies: ['project-manager'],
  init: ({projectManager}) => {

    return () => {
      const dispose = autorun(() => {
        if (projectManager.state.currentProject) {
          dispose()
          return
        }

        if (projectManager.state.projects.length !== 0) {
          projectManager.state.currentProject = projectManager.state.projects[0]
        }
      })
    }
  }
})
