export default [{
  selector: connect => connect.value.modelType === 'Project',
  label: connect => `project - ${connect.value.name}`,
  children: contact => contact.value.getTimelines()
}, {
  selector: connect => connect.value.modelType === 'Timeline',
  label: connect => `timeline - ${connect.value.name}`,
  children: contact => contact.value.getTracks()
}, {
  selector: connect => connect.value.modelType === 'Track',
  label: connect => `track - ${connect.value.name}`,
  children: contact => contact.value.getParams()
}, {
  selector: connect => connect.value.modelType === 'Param',
  label: connect => `param - ${connect.value.name}`,
  children: contact => contact.value.getKeys().length ? contact.value.getKeys() : contact.value.getParams()
}, {
  selector: connect => connect.value.modelType === 'Key',
  label: 'key',
  includeInheriteds: true,
  whitelist: ['time', 'value'],
}]
