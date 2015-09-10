import selectors from './selectors'
import actions from './actions'
import dialog from './dialog'

export const SHOW_ITEM_SETTINGS_DIALOG = 'SHOW_ITEM_SETTINGS_DIALOG'
export function showItemSettingsDialog (projectManager, workspace, itemId) {
  BETON.store.dispatch({
    type: SHOW_ITEM_SETTINGS_DIALOG,
    itemId,
  })
  workspace.showDialog(dialog)
}
