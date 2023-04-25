<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { List } from 'types/ForecastResponse';
import Card from 'primevue/card';
import { months } from '../../utils/months'
import emitter from '../../utils/emitter';

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
      timezone: 0,
      forecastLength: '12 hours'
    }
  },
  computed: {
    dailyForecast(): List[] {
      if (!this.forecast) {
        return []
      }
      let days;
      // get only 5 next 3 hour forecasts
      if (this.forecastLength === '12 hours') {
        days = this.forecast.slice(0, 5)
      } else {
        days = this.forecast.slice(5, 10)
      }

      // set the times to represent the local time in the city
      return days.map(forecast => {
        const utcTimestamp = forecast.dt
        const timezoneOffset = this.timezone
        const date = new Date(utcTimestamp * 1000)
        const currentOffset = date.getTimezoneOffset()
        const targetOffset = timezoneOffset / 60
        const offsetDiff = currentOffset + targetOffset
        date.setMinutes(date.getMinutes() + offsetDiff)
        const [day, time] = date.toISOString().split('T')
        const month = months[day.split('-')[1] as keyof typeof months]
        return {
          ...forecast,
          localDay: month + ' ' + day.split('-').reverse()[0],
          localTime: time.split(':').splice(0, 2).join(':') // only display hour and minutes
        }
      })
    }
  },
  created() {
    emitter.on('timezone', e => this.timezone = e),
      emitter.on('forecastLength', e => this.forecastLength = e)
  },
})
</script>

<template>
  <div class="forecast-cards-container">
    <Card class="forecast-card" v-for="forecast in dailyForecast">
      <template #title>
        {{ forecast.localDay }}
        {{ forecast.localTime }}
      </template>
      <template #subtitle>
        <img :src="`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`"
          :alt="`${forecast.weather[0].description}`" style="height:50px, width: 50px">
        {{ forecast.weather[0].description }}
      </template>
      <template #content>
        <p style="font-weight: bold">{{ forecast.main.temp }} °C</p>
        <i class="pi pi-flag" /> {{ forecast.wind.speed }} m/s
      </template>
    </Card>
  </div>
</template>

<style scoped>
.forecast-cards-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

p {
  margin: 0
}

.forecast-card {
  width: 8em;
  border-radius: 10px;
  margin: 0px 10px 10px 10px;
}
</style>