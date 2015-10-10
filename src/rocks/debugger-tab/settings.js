export default [{
  selector: select('Project'),
  label: connect => `project - ${connect.value.name}`,
  children: contact => contact.value.getTimelines()
}, {
  selector: select('Timeline'),
  label: connect => `timeline - ${connect.value.name}`,
  children: contact => contact.value.getTracks()
}, {
  selector: select('Track'),
  label: connect => `track - ${connect.value.name}`,
  children: contact => contact.value.getParams()
}, {
  selector: select('Param'),
  label: connect => `param - ${connect.value.name}`,
  children: contact => contact.value.getKeys().length ? contact.value.getKeys() : contact.value.getParams()
}, {
  selector: select('Key'),
  label: 'key',
  includeInheriteds: true,
  whitelist: ['time', 'value'],
}]

function select(type) {
  return connect => typeof connect.value === 'object' &&
                    connect.value.type === type
}
