import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
// Skapa Vue-appen med root-komponenten
const app = createApp(App)
// pinia 
app.use(createPinia())
// Vue Router
app.use(router)
app.mount('#app')