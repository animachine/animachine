export default [{
  selector: connect => connect.value.type === 'project',
  label: connect => `project - ${connect.value.name}`,
  children: contact => contact.value.getTimelines()
}, {
  selector: connect => connect.value.type === 'timeline',
  label: connect => `timeline - ${connect.value.name}`,
  children: contact => contact.value.getTracks()
}, {
  selector: connect => connect.value.type === 'track',
  label: connect => `track - ${connect.value.name}`,
  children: contact => contact.value.getParams()
}, {
  selector: connect => connect.value.type === 'param',
  label: connect => `param - ${connect.value.name}`,
  children: contact => contact.value.getKeys().length ? contact.value.getKeys() : contact.value.getParams()
}, {
  selector: connect => connect.value.type === 'key',
  label: 'key',
  includeInheriteds: true,
  whitelist: ['time', 'value'],
}]
