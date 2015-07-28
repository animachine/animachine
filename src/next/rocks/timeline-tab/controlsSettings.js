export default [{
  selector: connect => connect.value.modelType === 'Timeline',
  label: connect => connect.value.name,
  open: connect => connect.value.openInTimeline,
  onToggleOpen: handleToggleOpen,
  children: connect => connect.getTracks()
}, {
  selector: connect => connect.value.modelType === 'Track',
  label: connect => connect.value.name,
  open: connect => connect.value.openInTimeline,
  onToggleOpen: handleToggleOpen,
  children: connect => connect.getProps()
}, {
  selector: connect => connect.value.modelType === 'Prop',
  label: connect => connect.value.name,
  open: connect => connect.value.openInTimeline,
  onToggleOpen: handleToggleOpen,
  children: connect => connect.getProps()
}]

function handleToggleOpen(connect) {
  connect.value.openInTimeline = !connect.value.openInTimeline
}
