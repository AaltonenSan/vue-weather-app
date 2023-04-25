<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import CurrentWeather from './CurrentWeather.vue';
import Forecast from './Forecast.vue';
import type { LocationCoordinates } from 'types/LocationResponse';
import Card from 'primevue/card';

export default defineComponent({
  components: {
    CurrentWeather,
    Forecast,
    Card
  },
  props: {
    location: {
      type: Object as PropType<LocationCoordinates>,
      required: true
    }
  },
  methods: {
    onWeatherLoaded() {
      this.$emit('loading', false) // update loading state when child emits the event
    },
    onTimeOfDay(timeOfDay: string) {
      this.$emit('change-time-of-day', timeOfDay)
    },
  },
  data() {
    return {
      timezone: 0
    }
  }
})
</script>

<template>
  <div class="weather">
    <CurrentWeather :location="location" @weather-loaded="onWeatherLoaded" @change-time-of-day="onTimeOfDay" />
    <Forecast :location="location" />
  </div>
</template>

<style scoped>
.weather {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}
</style>