<script lang="ts">
import type { LocationResponse } from '../types/LocationResponse'
import type { CurrentWeatherResponse } from '../types/CurrentWeatherResponse'
import CurrentWeather from './components/CurrentWeather.vue'
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

export default {
  components: {
    CurrentWeather,
    InputText,
    Button,
  },
  data() {
    return {
      API_KEY: import.meta.env.VITE_API_KEY as string,
      BASE_URL: 'https://api.openweathermap.org',
      currentWeather: {} as CurrentWeatherResponse,
      city: '',
      message: '',
      loading: false
    }
  },
  methods: {
    async fetchWeather(location: LocationResponse): Promise<void> {
      try {
        const response = await fetch(`${this.BASE_URL}/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${this.API_KEY}&units=metric`)
        const data: CurrentWeatherResponse = await response.json()
        this.currentWeather = data
        this.loading = false
      } catch (error) {
        console.log(error)
        this.message = 'Error fetching data'
      }
    },
    async fetchLocation(): Promise<void> {
      this.loading = true
      try {
        const response = await fetch(`${this.BASE_URL}/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.API_KEY}`)
        const data: LocationResponse[] = await response.json()
        if (!data.length) {
          this.message = 'City not found'
          this.loading = false
          return
        }
        this.message = ''
        this.fetchWeather(data[0])
      } catch (error) {
        console.log(error)
        this.message = 'Error fetching data'
      }
    },
  },
}
</script>

<template>
  <main>
    <div class="search-bar">
      <InputText class="search-input" type="text" v-model="city" />
      <Button class="search-button" type="button" label="Search" icon="pi pi-search" @click="fetchLocation"
        :loading="loading" :disabled="city.length === 0" />
    </div>
    <CurrentWeather :currentWeather="currentWeather" />
    <p>{{ message }}</p>
  </main>
</template>

<style scoped>
.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: lightskyblue;
  padding: 1rem
}

.search-input {
  border-radius: 10px;
  margin-right: 5px;
}

.search-button {
  border-radius: 10px;
  margin-left: 5px;
}
</style>
