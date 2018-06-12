const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  connectMap: state => state.connect.connectMap,
  handler: state => state.connect.handler,
  selectedName: state => state.connect.selectedName
}
export default getters
