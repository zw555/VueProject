import Vue from 'vue'
import App from './App.vue'
import VueQuillEditor from 'vue-quill-editor'
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import router from './router'
import './assets/css/global.css'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios'
import './assets/font/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
axios.defaults.baseUrl = 'https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config
})

// 将富文本编辑器注册到全局可用的组件
Vue.use(VueQuillEditor)
Vue.prototype.$http = axios
Vue.component('tree-table',TreeTable);

Vue.use(ElementUI);


Vue.config.productionTip = false
Vue.filter('dataFormat',function (originVal){
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2,'0')
  const d = (dt.getDate()+'').padStart(2,'0')

  const hh = (dt.getHours() +'').padStart(2,'0')
  const mm = (dt.getMinutes() +'').padStart(2,'0')
  const ss = (dt.getSeconds() +'').padStart(2,'0')

  // return 'yyyy-mm-dd hh:mm:ss'
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`

})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
