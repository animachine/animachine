
BETON.define({
  id: 'welcome-process',
  dependencies: ['component-inspector', 'open-project-dialog', 'welcome-dialog'],
  init: ({componentInspector, openProjectDialog, welcomeDialog}) => {
    function start() {
      setTimeout(() => {//HACK wait to see if there are projects loaded later
        const projectSources = componentInspector.selectors.getProjectSources()
        if (projectSources.length) {
          BETON.getRock('open-project-dialog').showOpen()
        }
        else {
          BETON.getRock('open-project-dialog').showNew()
        }
        BETON.getRock('welcome-dialog').showNext()
      })
    }

    return {
      start,
    }
  }
})
