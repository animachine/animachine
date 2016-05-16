BETON.define({
  id: 'hack-open-first-possible-project',
  dependencies: ['project-manager'],
  init: ({projectManager}) => {

    return () => {
      setTimeout(() => {//wait a bit so projects can load if they are present
        console.log('OPEN FIRST PROJET')
        if (projectManager.state.projects.getLength() !== 0) {

          const project = projectManager.state.projects[0]
          projectManager.state.currentProject = project

          if (!project.currentTimeline && project.timelines[0]) {
            project.currentTimeline = project.timelines[0]
          }
        }
        else {
          const project = projectManager.state.createNewProject()
          projectManager.state.currentProject = project
        }
      })
    }
  }
})
