<script lang="ts">
import { defineComponent } from 'vue';
import type { LocationCoordinates, LocationResponse } from '../types/LocationResponse'
import type { TimezoneDBResponse } from '../types/TimezoneDBResponse'
import Weather from './components/Weather.vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DAY from './assets/clouds-bg.jpg'
import NIGHT from './assets/night.jpg'
import emitter from '../utils/emitter';

type TimeOfDay = 'day' | 'night'

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
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.API_KEY}`)
        const data: LocationResponse[] = await response.json()

        if (!data.length) {
          this.message = 'City not found'
          this.location = null
          this.loading = false
          return
        }

        this.message = ''
        this.city = ''
        this.location = { lat: data[0].lat, lon: data[0].lon, cityName: data[0].name }
        this.fetchTimezone(data[0].lat, data[0].lon)
      } catch (error) {
        console.log(error)
        this.message = 'Error fetching data'
      }
    },
    async fetchTimezone(lat: number, lon: number): Promise<void> {
      try {
        const response = await fetch(`http://api.timezonedb.com/v2.1/get-time-zone?key=${this.TIMEZONE_API_KEY}&format=json&by=position&lat=${lat}&lng=${lon}`)
        const data: TimezoneDBResponse = await response.json()
        emitter.emit('timezonename', data.zoneName)
      } catch (error) {
        console.log(error)
      }
    },
    getGeoLocation(source?: string): void {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.location = { lat: position.coords.latitude, lon: position.coords.longitude }
          this.message = ''
          this.fetchTimezone(position.coords.latitude, position.coords.longitude)
        }, (error) => {
          if (error.code === error.PERMISSION_DENIED && source === 'click') {
            alert('Enable location to use this feature')
          }
        })
      } else {
        this.message = 'Location not available'
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
    emitter.on('noWeather', e => this.message = e)
    emitter.on('loading', e => this.loading = e)
    emitter.on('timeOfDay', e => this.timeOfDay = e as TimeOfDay)
  },
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
    <div class="weather-container" v-if="location && !message">
      <Weather :location="location" />
    </div>
    <h1 v-else>{{ message }}</h1>
  </main>
</template>

<style scoped>
main {
  height: 100%;
  min-height: 100vh;
  text-align: center;
  background-size: cover;
  background-position: top;
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

@media (max-width: 520px) {
  .search-input {
    width: 200px;
  }
}
</style>
