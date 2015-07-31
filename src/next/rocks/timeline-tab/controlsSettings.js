export default [{
  selector: 'root',
  hiddenHead: true,
  children: connect => connect.value.getTracks(),
}, {
  selector: connect => connect.value.modelType === 'Track',
  label: connect => connect.value.name,
  open: connect => connect.value.openInTimeline,
  onToggleOpen: handleToggleOpen,
  children: connect => connect.value.getParams()
}, {
  selector: connect => connect.value.modelType === 'Param',
  label: connect => connect.value.name,
  open: connect => connect.value.openInTimeline,
  onToggleOpen: handleToggleOpen,
  children: connect => connect.value.getParams()
}]

function handleToggleOpen(connect) {
  connect.value.openInTimeline = !connect.value.openInTimeline
}
