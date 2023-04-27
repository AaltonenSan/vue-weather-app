<script lang="ts">
import { defineComponent } from 'vue';
import type { LocationCoordinates, LocationResponse } from '../types/LocationResponse'
import type { TimezoneDBResponse } from '../types/TimezoneDBResponse'
import type { TimeOfDay } from '../types/TimeOfDay'
import Weather from './components/Weather.vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DAY from './assets/clouds-bg.jpg'
import NIGHT from './assets/night.jpg'
import emitter from '../utils/emitter';

export default defineComponent({
  components: {
    Weather,
    InputText,
    Button,
  },
  data() {
    return {
      API_KEY: import.meta.env.VITE_API_KEY as string,
      TIMEZONE_API_KEY: import.meta.env.VITE_TIMEZONE_API_KEY as string,
      BASE_URL: 'https://api.openweathermap.org',
      location: null as LocationCoordinates | null,
      city: '',
      message: 'Enable location or search for a city to see weather forecast',
      loading: false,
      timeOfDay: 'day' as TimeOfDay
    }
  },
  methods: {
    // fetch location coordinates after user gives city name
    async fetchLocation(): Promise<void> {
      this.loading = true
      try {
        const response = await fetch(`${this.BASE_URL}/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.API_KEY}`)
        const data: LocationResponse[] = await response.json()

        if (!data.length) {
          this.message = 'City not found'
          this.location = null
          this.loading = false
          return
        }
        this.message = ''
        this.city = ''
        this.location = { lat: data[0].lat, lon: data[0].lon }
        this.fetchTimezone()
      } catch (error) {
        console.log(error)
        this.message = 'Error fetching data'
      }
    },
    async fetchTimezone(): Promise<void> {
      try {
        const response = await fetch(`http://api.timezonedb.com/v2.1/get-time-zone?key=${this.TIMEZONE_API_KEY}&format=json&by=position&lat=${this.location?.lat}&lng=${this.location?.lon}`)
        const data: TimezoneDBResponse = await response.json()
        emitter.emit('timezonename', data.zoneName)
      } catch (error) {
        console.log(error)
      }
    },
    changeTimeOfDay(timeofDay: TimeOfDay) {
      this.timeOfDay = timeofDay
    },
    getGeoLocation(source?: string) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.location = { lat: position.coords.latitude, lon: position.coords.longitude }
          this.message = ''
          this.fetchTimezone()
        }, (error) => {
          if (error.code === error.PERMISSION_DENIED && source === 'click') {
            alert('Enable location to use this feature')
          }
        })
      } else {
        this.message = ' Location not available'
        console.log('Geolocation not available')
      }
    }
  },
  computed: {
    backgroundImage(): string {
      return this.timeOfDay === 'day' ? DAY : NIGHT
    },
    searchbarColor(): string {
      return this.timeOfDay === 'day' ? 'rgba(95,190,215,0.4)' : 'rgba(54,56,42,0.8)'
    }
  },
  created() {
    this.getGeoLocation()
  },
  watch: {
    location: {
      handler: "fetchTimezone"
    }
  }
})
</script>

<template>
  <main v-bind:style="{ backgroundImage: `url('${backgroundImage}')` }">
    <div class="search-bar" v-bind:style="{ backgroundColor: searchbarColor }">
      <span class="p-input-icon-left">
        <i class="pi pi-map-marker" @click="getGeoLocation('click')" title="Get current location" />
        <InputText class="search-input" type="text" v-model="city" @keydown.enter="fetchLocation" />
      </span>
      <Button class="search-button" type="button" label="Search" icon="pi pi-search" @click="fetchLocation"
        :loading="loading" :disabled="city.length === 0" />
    </div>
    <div class="weather-container" v-if="location">
      <Weather :location="location" @loading="loading = $event" @change-time-of-day="timeOfDay = $event" />
    </div>
    <h1>{{ message }}</h1>
  </main>
</template>

<style scoped>
main {
  height: 100%;
  min-height: 100vh;
  text-align: center;
  background-size: cover;
  background-position: top;
  overflow: scroll
}

.weather-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.pi-map-marker) {
  font-size: 1.3rem;
}

:deep(.pi-map-marker):hover {
  cursor: pointer;
}

.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
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
