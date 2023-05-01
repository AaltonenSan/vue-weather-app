import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import { createPinia } from 'pinia'
import './assets/main.css'
import "primevue/resources/themes/saga-blue/theme.css" //theme
import "primevue/resources/primevue.min.css" //core CSS
import "primeicons/primeicons.css" //icons

const pinia = createPinia()

createApp(App)
  .use(PrimeVue)
  .use(pinia)
  .mount('#app')
