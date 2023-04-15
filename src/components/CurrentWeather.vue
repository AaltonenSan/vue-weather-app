<script lang="ts">
import type { CurrentWeatherResponse } from '../../types/CurrentWeatherResponse'
import Card from 'primevue/card';

export default {
  components: {
    Card
  },
  props: {
    currentWeather: {
      type: Object as () => CurrentWeatherResponse,
      required: true
    }
  },
}
</script>

<template>
  <div v-if="Object.keys(currentWeather).length" class="current-weather">
    <div style="text-align:center">
      <h1>Current weather in {{ currentWeather.name }}</h1>
      <h3>{{ new Date().toLocaleTimeString() }}</h3>
    </div>
    <Card style="width: 15em">
      <template #header> <img :src="`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`"
          :alt="`${currentWeather.weather[0].description}`" style="height:200px, width: 100px">
      </template>
      <template #content>
        <p>{{ currentWeather.main.temp }}</p>
      </template>
    </Card>
  </div>
</template>

<style>
.current-weather {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>