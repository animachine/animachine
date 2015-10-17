
BETON.define({
  id: 'welcome-process',
  dependencies: ['component-inspector', 'open-project-dialog', 'welcome-dialog'],
  init: ({componentInspector, openProjectDialog, welcomeDialog}) => {
    function start() {
      setTimeout(() => {//HACK wait to see if there are projects loaded later
        const projectSources = componentInspector.selectors.getProjectSources()
        if (projectSources.length) {
          BETON.require('open-project-dialog').showOpen()
        }
        else {
          BETON.require('open-project-dialog').showNew()
        }
        BETON.require('welcome-dialog').showNext()
      })
    }

    return {
      start,
    }
  }
})
