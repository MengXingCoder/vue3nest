import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { initRouter } from './router'

const app = createApp(App)

app.use(createPinia())
initRouter(app)
app.use(ElementPlus)
app.mount('#app')
