const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  connectMap: state => state.connect.connectMap,
  handler: state => state.connect.handler,
  selectedName: state => state.connect.selectedName,
  cacheOptions: state => state.connect.cacheOptions,
  autoSearch: state => state.setting.autoSearch,
  autoSearchLimit: state => state.setting.autoSearchLimit
}
export default getters
