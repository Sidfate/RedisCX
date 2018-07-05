import { getConnectMap, setConnectMap, cleanConnect, cleanSearchHistory } from '@/utils/localStore'

const connect = {
  state: {
    connectMap: getConnectMap(),
    handler: null,
    selectedName: null
  },
  mutations: {
    SET_CONNECT_MAP: (state) => {
      state.connectMap = getConnectMap()
    },
    SET_HANDLER: (state, handler) => {
      if(state.handler !== null && handler === null) {
        state.handler.disconnect()
      }
      state.handler = handler
    },
    ADD_CONNECTION: (state, connection) => {
      const add = {}
      add[connection.connectionName] = connection
      state.connectMap = Object.assign({}, state.connectMap, add)
      setConnectMap(state.connectMap)
    },
    EDIT_CONNECTION: (state, {name, connection}) => {
      const map = Object.assign({}, state.connectMap)
      delete map[name]
      const add = {}
      add[connection.connectionName] = connection
      state.connectMap = Object.assign({}, map, add)
      setConnectMap(state.connectMap)
    },
    DELETE_CONNECTION: (state, name) => {
      const map = Object.assign({}, state.connectMap)
      delete map[name]
      state.connectMap = Object.assign({}, map)
      setConnectMap(state.connectMap)
    },
    SET_SELECTED: (state, name) => {
      state.selectedName = name
    }
  },
  actions: {
    AddConnect: ({ commit }, connection) => {
      commit('ADD_CONNECTION', connection)
    },
    EditConnect: ({ commit }, { name, connection }) => {
      commit('EDIT_CONNECTION', {name, connection})
    },
    DelectConnect: ({ commit }, name) => {
      commit('DELETE_CONNECTION', name)
    },
    SetHandler: ({ commit }, { handler, name }) => {
      console.log(name)
      commit('SET_HANDLER', handler)
      commit('SET_SELECTED', name)
    },
    CleanAllSetting: ({ commit }) => {
      commit('SET_SELECTED', null)
      commit('SET_HANDLER', null)
      cleanConnect()
      cleanSearchHistory()
      commit('SET_CONNECT_MAP')
    },
    CloseHandler: ({ commit }) => {
      commit('SET_HANDLER', null)
      commit('SET_SELECTED', null)
    },
  }
}

export default connect
