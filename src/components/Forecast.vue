<script lang="ts">
import Card from 'primevue/card';
import type { LocationCoordinates } from 'types/LocationResponse';
import type { ForecastResponse } from 'types/ForecastResponse';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import SelectButton from 'primevue/selectbutton';
import DailyForecast from './DailyForecast.vue';
import emitter from '../../utils/emitter';
import { DateTime } from 'luxon'

export default defineComponent({
  components: {
    Card,
    SelectButton,
    DailyForecast
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
      forecast: null as ForecastResponse | null,
      forecastLength: '12 hours',
      forecastLengthOptions: ['12 hours', '5 days']
    }
  },
  methods: {
    // fetches 5 days forecast with 3 hour intervals
    async fetchForecast(location: LocationCoordinates): Promise<void> {
      try {
        const response = await fetch(`${this.BASE_URL}/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${this.API_KEY}&units=metric&d`)
        const data = await response.json()
        this.forecast = data
        console.log(data)
      } catch (error) {
        console.log(error)
      }
    },
    // emit the forecast length to DailyForecast component
    emitForecastLength() {
      if (this.forecastLength) {
        emitter.emit('forecastLength', this.forecastLength)
      }
    }
  },
  // useEffect kind of hook to fetch forecast after location is fetched in parent
  watch: {
    location: {
      handler: 'fetchForecast',
      immediate: true
    }
  }
})
</script>

<template>
  <div class="forecast-container">
    <Card class="forecast-card">
      <template #header>
        <SelectButton v-model="forecastLength" :options="forecastLengthOptions" @change="emitForecastLength" />
      </template>
      <template #content>
        <DailyForecast v-if="forecast" :forecast="forecast.list" />
      </template>
    </Card>
  </div>
</template>

<style scoped>
:deep(.p-button) {
  border-radius: 10px;
}

.forecast-card {
  height: 430px;
  max-width: 100%;
  padding-top: 25px;
  border-radius: 0 10px 10px 0;
  background-color: rgba(255, 255, 255, .8);
}

@media (max-width: 768px) {
  .forecast-card {
    border-radius: 10px;
    margin-left: 10px;
    margin-right: 10px;
  }
}

@media (max-width: 620px) {
  .forecast-card {
    height: 660px;
  }
}

@media (max-width: 520px) {
  .forecast-card {
    height: 980px
  }
}
</style>