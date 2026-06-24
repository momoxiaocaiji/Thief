import { createApp } from 'vue'
import ElementPlus, { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import axios from 'axios'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.config.globalProperties.$http = axios
app.config.globalProperties.$message = ElMessage
app.config.errorHandler = (error, instance, info) => {
  console.error('[vue-error]', info, error, instance)
}

window.addEventListener('error', event => {
  console.error('[window-error]', event.message, event.error)
})

window.addEventListener('unhandledrejection', event => {
  console.error('[unhandled-rejection]', event.reason)
})

app.mount('#app')
