<script lang="ts">
import type { LocationResponse } from '../../types/LocationResponse'
import type { CurrentWeatherResponse } from '../../types/CurrentWeatherResponse'
const API_KEY = import.meta.env.VITE_API_KEY as string

export default {
  props: {
    location: {}
  },
  data() {
    return {
      BASE_URL: 'https://api.openweathermap.org',
      currentWeather: {} as CurrentWeatherResponse,
      newLocation: {}
    }
  },
  methods: {
    async fetchWeather(location: LocationResponse): Promise<void> {
      const response = await fetch(`${this.BASE_URL}/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric`)
      const data: CurrentWeatherResponse = await response.json()
      this.currentWeather = data
    }
  }
}
</script>

<template>
  <div v-if="Object.keys(currentWeather).length">
    <p>{{ currentWeather.main.temp }}</p>
    <img :src="`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`"
      :alt="`${currentWeather.weather[0].description}`">
  </div>
</template>

<style></style>