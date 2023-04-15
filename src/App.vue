<script lang="ts">
import type { LocationResponse } from '../types/LocationResponse'
import type { CurrentWeatherResponse } from '../types/CurrentWeatherResponse'
import CurrentWeather from './components/CurrentWeather.vue'

export default {
  data() {
    return {
      API_KEY: import.meta.env.VITE_API_KEY as string,
      BASE_URL: 'https://api.openweathermap.org',
      location: {},
      city: '',
      message: ''
    }
  },
  components: {
    CurrentWeather
  },
  methods: {
    // async fetchWeather(location: LocationResponse): Promise<void> {
    //   const response = await fetch(`${this.BASE_URL}/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${this.API_KEY}&units=metric`)
    //   const data: CurrentWeatherResponse = await response.json()
    //   this.currentWeather = data
    // },
    async fetchLocation(): Promise<void> {
      const response = await fetch(`${this.BASE_URL}/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.API_KEY}`)
      const data: LocationResponse[] = await response.json()
      if (!data.length) {
        this.message = 'City not found'
        return
      }
      this.message = ''
      this.location = data
    },
  }
}
</script>

<template>
  <main>
    <input type="text" v-model="city" placeholder="City">
    <button @click="fetchLocation" :disabled="city.length === 0">Search</button>
    <CurrentWeather :location="location" />
    <p>{{ message }}</p>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
