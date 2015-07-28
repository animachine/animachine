export default [{
  selector: connect => connect.value.modelType === 'Project',
  label: connect => `project - ${connect.value.name}`,
  children: contact => contact.value._getTimelines()
}, {
  selector: connect => connect.value.modelType === 'Timeline',
  label: connect => `timeline - ${connect.value.name}`,
  children: contact => contact.value._getTracks()
}, {
  selector: connect => connect.value.modelType === 'Track',
  label: connect => `track - ${connect.value.name}`,
  children: contact => contact.value._getParams()
}, {
  selector: connect => connect.value.modelType === 'Param',
  label: connect => `param - ${connect.value.name}`,
  children: contact => contact.value._getKeys().length ? contact.value._getKeys() : contact.value._getChildParams()
}, {
  selector: connect => connect.value.modelType === 'Key',
  label: 'key',
  includeInheriteds: true,
  whitelist: ['time', 'value'],
}]
