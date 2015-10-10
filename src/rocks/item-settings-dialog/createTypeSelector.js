export default type => connect => {
  return connect.value && connect.value.type === type
}
