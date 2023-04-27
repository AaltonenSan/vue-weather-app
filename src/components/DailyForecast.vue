<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { List } from 'types/ForecastResponse';
import Card from 'primevue/card';
import emitter from '../../utils/emitter';
import { DateTime } from 'luxon';

export default defineComponent({
  components: {
    Card
  },
  props: {
    forecast: {
      type: Array as PropType<List[]>,
    }
  },
  data() {
    return {
      forecastLength: '12 hours',
      timezonename: '',
      TIMEZONE_API_KEY: import.meta.env.VITE_TIMEZONE_API_KEY as string
    }
  },
  computed: {
    // TODO: Compute an average of daily temperatures for 5 days forecast
    dailyForecast(): List[] {
      if (!this.forecast || this.timezonename === '') {
        return []
      }
      let days: List[] = [];
      // get only 5 next 3 hour forecasts
      if (this.forecastLength === '12 hours') {
        days = this.forecast.slice(0, 5)
      } else { // get current days first one and 12:00 for the rest of days
        days.push(this.forecast[0])
        days = days.concat(this.forecast.filter(item => (item.dt_txt.split(' ')[1] === '12:00:00')))
        if (days.length > 5) {
          days.pop()
        }
      }

      // set the times to represent the local time in the city
      // times are not consistant because the api only provides 3 hour interval for free
      return days.map(forecast => {
        const dateTime = DateTime.fromSQL(forecast.dt_txt)
        const timeInCorrectTimezone = dateTime.setZone(this.timezonename)

        const date = timeInCorrectTimezone.toLocaleString({ weekday: 'short', day: 'numeric', month: 'numeric' })
        const time = timeInCorrectTimezone.toLocaleString({ hour: 'numeric', minute: 'numeric', hour12: false })
        return {
          ...forecast,
          localDay: date,
          localTime: time
        }
      })
    }
  },
  created() {
    emitter.on('forecastLength', e => this.forecastLength = e);
    emitter.on('timezonename', e => this.timezonename = e);
  },
})
</script>

<template>
  <div class="forecast-cards-container">
    <Card class="forecast-card" v-for="forecast in dailyForecast">
      <template #title>
        {{ forecast.localDay }}
        {{ forecastLength === '12 hours' ? forecast.localTime : null }}
      </template>
      <template #subtitle>
        <img :src="`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`"
          :alt="`${forecast.weather[0].description}`">
        {{ forecast.weather[0].description }}
      </template>
      <template #content>
        <p style="font-weight: bold">{{ forecast.main.temp.toFixed(1) }} °C</p>
        <i class="pi pi-flag" /> {{ forecast.wind.speed }} m/s
      </template>
    </Card>
  </div>
</template>

<style scoped>
.forecast-cards-container {
  display: flex;
  max-width: 100%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

@media (max-width: 620px) {
  .forecast-cards-container {
    flex-wrap: wrap;
    border-radius: 10px;
    margin-left: 10px;
    margin-right: 10px;
  }
}

p {
  margin: 0
}

:deep(.p-card .p-card-title) {
  font-size: medium;
}

.forecast-card {
  max-width: 8em;
  display: flex;
  position: sticky;
  flex-shrink: 1;
  border-radius: 10px;
  margin: 0px 5px 5px 5px;
}

.forecast-card img {
  max-width: 100%;
  height: auto;
}
</style>