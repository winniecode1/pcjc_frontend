// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import BootstrapVueIcons from 'bootstrap-vue/dist/bootstrap-vue-icons.esm'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import AxiosPlugin from './configs/plugins/AxiosPlugin'
import i18n from './configs/plugins/i18n'

import fontawesome from '@fortawesome/fontawesome'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import solid from '@fortawesome/fontawesome-free-solid'
import alert from './pages/workspace/components/alert'
import VueResource from 'vue-resource'
import './assets/fonts/fonts.css'

Vue.use(VueResource);
fontawesome.library.add(solid)

Vue.component('font-awesome-icon', FontAwesomeIcon)

// 引入封装后的Axios,已经加入对token的支持，参数从json转为Formdata
Vue.use(AxiosPlugin)
// 引入BootstapVue
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)

Vue.config.productionTip = false
// 注意，Vue.use方法必须在new Vue之前被调用
Vue.use(alert)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  i18n,
  components: { App },
  template: '<App/>'
})
