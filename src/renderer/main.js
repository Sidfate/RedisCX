import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en'

import '@/styles/index.scss' // global css
import '@/icons' // icon
import '@/static/font-awesome/css/font-awesome.min.css'
import '@/static/photon/css/photon.min.css'

Vue.use(ElementUI, { locale })

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
