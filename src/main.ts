import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import './assets/main.css'
import "primevue/resources/themes/saga-blue/theme.css" //theme
import "primevue/resources/primevue.min.css" //core CSS
import "primeicons/primeicons.css" //icons

createApp(App)
  .use(PrimeVue)
  .mount('#app')
