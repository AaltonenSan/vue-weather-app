<script lang="ts">
import type { CurrentWeatherResponse } from '../../types/CurrentWeatherResponse'
import type { LocationCoordinates } from 'types/LocationResponse';
import Card from 'primevue/card';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import emitter from '../../utils/emitter'


export default defineComponent({
  components: {
    Card,
  },
  props: {
    location: {
      type: Object as PropType<LocationCoordinates>,
      required: true
    }
  },
  data() {
    return {
      API_KEY: import.meta.env.VITE_API_KEY as string,
      BASE_URL: 'https://api.openweathermap.org',
      currentWeather: {} as CurrentWeatherResponse,
      localdate: {
        time: '',
        day: ''
      }
    }
  },
  methods: {
    async fetchWeather(location: LocationCoordinates): Promise<void> {
      try {
        const response = await fetch(`${this.BASE_URL}/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${this.API_KEY}&units=metric`)
        const data: CurrentWeatherResponse = await response.json()
        this.currentWeather = data
        this.$emit('weather-loaded') // emit to Weather that loading is done
        this.setLocalTime()
        this.changeBackgroundImage()
        emitter.emit('timezone', this.currentWeather.timezone)
      } catch (error) {
        console.log(error)
      }
    },
    changeBackgroundImage() {
      const timeOfDay = this.currentWeather.weather[0].icon[2] === 'd' ? 'day' : 'night'
      this.$emit('change-time-of-day', timeOfDay)
    },
    setLocalTime() {
      const localTime = new Date().getTime()
      console.log(this.currentWeather.timezone)
      const localOffset = new Date().getTimezoneOffset() * 60000
      const currentUtcTime = localOffset + localTime
      const cityOffset = currentUtcTime + 1000 * this.currentWeather.timezone
      const cityDate = new Date(cityOffset).toString().split(' ')
      this.localdate.time = cityDate[4]
      this.localdate.day = cityDate.slice(0, 3).join(' ')
    }
  },
  watch: {
    location: {
      handler: 'fetchWeather',
      immediate: true
    }
  }
})
</script>

<template>
  <div v-if="Object.keys(currentWeather).length" class="current-weather-container">
    <Card class="weather-card">
      <template #header>
        <h4>Current weather in {{ currentWeather.name }}</h4>
        <p>{{ localdate.day }} {{ localdate.time }}</p>
      </template>
      <template #title>
        {{ currentWeather.main.temp }} °C
        <img :src="`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`"
          :alt="`${currentWeather.weather[0].description}`" style="height:50px, width: 50px; padding: 0">
      </template>
      <template #subtitle>
        <p>{{ currentWeather.weather[0].description }}</p>
      </template>
      <template #content>
        <i class="pi pi-user" /> {{ currentWeather.main.feels_like }} °C <br>
        <i class="pi pi-flag" /> {{ currentWeather.wind.speed }} m/s
      </template>
    </Card>
  </div>
</template>

<style scoped>
.current-weather-container {
  display: flex;
  flex-direction: row;
  text-align: center;
}

.weather-card {
  height: 420px;
  width: 20em;
  border-radius: 10px 0 0 10px;
  background-color: rgba(255, 255, 255, .8);
}

:deep(.p-card-title) {
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.p-card-content) {
  padding: 0
}
</style>