import { getAutoSearch, getAutoSearchLimit, setAutoSearch, setAutoSearchLimit } from '@/utils/localStore'

const setting = {
  state: {
    autoSearch: getAutoSearch(),
    autoSearchLimit: getAutoSearchLimit()
  },
  mutations: {
    SET_AUTO_SEARCH: (state, status) => {
      state.autoSearch = status
    },
    SET_AUTO_SEARCH_LIMIT: (state, limit) => {
      state.autoSearchLimit = limit
    }
  },
  actions: {
    EnableAutoSearch: ({ commit }) => {
      setAutoSearch(true)
      commit('SET_AUTO_SEARCH', true)
    },
    DisableAutoSearch: ({ commit }) => {
      setAutoSearch(false)
      commit('SET_AUTO_SEARCH', false)
    },
    ChangeAutoSearchLimit: ({ commit }, limit) => {
      setAutoSearchLimit(limit)
      commit('SET_AUTO_SEARCH_LIMIT', limit)
    }
  }
}

export default setting
