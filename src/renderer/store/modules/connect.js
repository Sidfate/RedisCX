import {getConnectMap, setConnectMap} from '@/utils/localStore'

const connect = {
  state: {
    connectMap: getConnectMap(),
    handler: null,
    selectedName: null
  },
  mutations: {
    SET_HANDLER: (state, handler) => {
      state.handler = handler
    },
    ADD_CONNECTION: (state, connection) => {
      const add = {}
      add[connection.connectionName] = connection
      state.connectMap = Object.assign({}, state.connectMap, add)
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
    SetHandler: ({ commit }, { handler, name }) => {
      console.log(name)
      commit('SET_HANDLER', handler)
      commit('SET_SELECTED', name)
    }
  }
}

export default connect
