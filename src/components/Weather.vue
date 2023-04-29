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
  }
})
</script>

<template>
  <div class="weather">
    <CurrentWeather :location="location" />
    <Forecast :location="location" />
  </div>
</template>

<style scoped>
.weather {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-left: 5px;
  margin-right: 5px;
}

@media (max-width: 820px) {
  .weather {
    flex-wrap: wrap;
  }
}
</style>