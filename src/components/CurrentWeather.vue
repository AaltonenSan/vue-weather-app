<script lang="ts">
import type { CurrentWeatherResponse } from '../../types/CurrentWeatherResponse'
import type { LocationCoordinates } from 'types/LocationResponse';
import Card from 'primevue/card';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import emitter from '../../utils/emitter'
import { DateTime } from 'luxon';

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
      API_KEY: import.meta.env.VITE_WEATHER_API_KEY as string,
      currentWeather: {} as CurrentWeatherResponse,
      localdate: {
        time: '',
        day: ''
      },
      timezonename: ''
    }
  },
  methods: {
    async fetchWeather(location: LocationCoordinates): Promise<void> {
      try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${location.cityName ? `q= + ${location.cityName}` : `lat=${location.lat}&lon=${location.lon}`}&appid=${this.API_KEY}&units=metric`)
        const data: CurrentWeatherResponse = await response.json()
        if (data.weather) {
          this.currentWeather = data
          emitter.emit('loading', false)
          this.changeBackgroundImage()
        } else {
          emitter.emit('message', `No forecast found for ${location.cityName}`)
          emitter.emit('loading', false)
        }
      } catch (error) {
        console.log(error)
      }
    },
    changeBackgroundImage() {
      if (this.currentWeather.weather[0].icon[2]) {
        const timeOfDay = this.currentWeather.weather[0].icon[2] === 'd' ? 'day' : 'night'
        emitter.emit('timeOfDay', timeOfDay)
      }
    },
    setLocalTime() {
      if (this.timezonename === '') {
        setTimeout(() => {
          this.setLocalTime()
        }, 100)
      } else {
        const localDate = DateTime.fromSeconds(this.currentWeather.dt, { zone: 'utc' })
        const localDay = localDate.setZone(this.timezonename).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
        const localTime = localDate.setZone(this.timezonename).toLocaleString(DateTime.TIME_24_WITH_SECONDS)
        this.localdate.day = localDay
        this.localdate.time = localTime
      }
    }
  },
  watch: {
    location: {
      handler: 'fetchWeather',
      immediate: true
    },
    timezonename: {
      handler: 'setLocalTime'
    }
  },
  created() {
    emitter.on('timezonename', e => this.timezonename = e);
  },
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
        {{ currentWeather.main.temp.toFixed(1) }} °C
        <img :src="`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`"
          :alt="`${currentWeather.weather[0].description}`" style="height:50px, width: 50px; padding: 0">
      </template>
      <template #subtitle>
        <p>{{ currentWeather.weather[0].description }}</p>
      </template>
      <template #footer>
        <i class="pi pi-user" /> {{ currentWeather.main.feels_like.toFixed(1) }} °C <br>
        <i class="pi pi-flag" /> {{ currentWeather.wind.speed }} m/s
      </template>
    </Card>
  </div>
</template>

<style scoped>
.current-weather-container {
  display: flex;
  max-width: 15em;
  width: 100%;
  flex-direction: row;
  text-align: center;
}

.weather-card {
  height: 430px;
  width: 100%;
  position: sticky;
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

@media (max-width: 820px) {
  .weather-card {
    border-radius: 10px;
  }

  .current-weather-container {
    border-radius: 10px;
    max-width: 300px
  }
}
</style>