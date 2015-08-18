export default [{
  selector: connect => connect.value.modelType === 'project',
  label: connect => `project - ${connect.value.name}`,
  children: contact => contact.value.getTimelines()
}, {
  selector: connect => connect.value.modelType === 'timeline',
  label: connect => `timeline - ${connect.value.name}`,
  children: contact => contact.value.getTracks()
}, {
  selector: connect => connect.value.modelType === 'track',
  label: connect => `track - ${connect.value.name}`,
  children: contact => contact.value.getParams()
}, {
  selector: connect => connect.value.modelType === 'param',
  label: connect => `param - ${connect.value.name}`,
  children: contact => contact.value.getKeys().length ? contact.value.getKeys() : contact.value.getParams()
}, {
  selector: connect => connect.value.modelType === 'key',
  label: 'key',
  includeInheriteds: true,
  whitelist: ['time', 'value'],
}]
