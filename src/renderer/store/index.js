import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import connect from './modules/connect'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    connect
  },
  getters
})

export default store
