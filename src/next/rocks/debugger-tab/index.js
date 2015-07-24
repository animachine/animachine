import DebuggerTab from './DebuggerTab'
import settings from './settings'

BETON.getRock(['workspace', 'project-manager'], init)

function init(workspace, projectManager) {
  workspace.setTab('debugger', () => {
    const {model} = projectManager.getCurrentProject()
    return <DebuggerTab settings={settings} value={model}/>
  })
}
