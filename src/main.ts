import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/lib/styles/main.css'
import '@mdi/font/css/materialdesignicons.css'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#667eea',
          secondary: '#764ba2',
          success: '#4caf50',
          error: '#f44336',
          warning: '#ff9800',
          info: '#2196f3',
        },
      },
    },
  },
})

app.use(pinia)
app.use(vuetify)
app.use(router)

// 認証状態の初期化
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
