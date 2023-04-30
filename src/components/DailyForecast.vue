<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { List } from 'types/ForecastResponse';
import Card from 'primevue/card';
import emitter from '../../utils/emitter';
import { DateTime } from 'luxon';
import type { ForecastLength } from './Forecast.vue';

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
      forecastLength: '12 hours' as ForecastLength,
      timezonename: '',
      TIMEZONE_API_KEY: import.meta.env.VITE_TIMEZONE_API_KEY as string,
    }
  },
  methods: {
    getMinAndMaxTemperature(forecastList: List[]) {
      const maxTemp = Math.max(...forecastList.map(forecast => forecast.main.temp_max))
      const minTemp = Math.min(...forecastList.map(forecast => forecast.main.temp_min))
      return [maxTemp, minTemp]
    },
    groupForecastsByDate(): List[] {
      const groupedForecasts = this.forecast!.reduce<{ [key: string]: { dt_txt: string }[] }>((acc, obj) => {
        const day = obj.dt_txt.split(' ')[0]
        if (!acc[day]) {
          acc[day] = []
        }
        acc[day].push(obj)
        return acc
      }, {})

      /* 
        Return an array that has one List object for each day
        Each object has information of 12:00:00 or earliest possible for current day,
        except temp_min and temp_max which are calcuted from all of the certain day's forecasts
      */
      const result: List[] = Object.keys(groupedForecasts).map((day) => {
        const forecastsForDay = groupedForecasts[day] as List[]
        const forecastsAt1200 = forecastsForDay.filter(forecast => forecast.dt_txt.endsWith('12:00:00'))
        const [maxTemp, minTemp] = this.getMinAndMaxTemperature(forecastsForDay)
        const data = forecastsAt1200[0] || forecastsForDay[0]
        return {
          ...data,
          main: {
            ...data.main,
            temp_min: minTemp,
            temp_max: maxTemp
          }
        }
      })
      return result
    }
  },
  computed: {
    hourlyForecast(): List[] {
      if (!this.forecast || this.timezonename === '') {
        return []
      }
      let days: List[] = [];
      // get 5 next 3 hour forecasts
      if (this.forecastLength === '12 hours') {
        days = this.forecast.slice(0, 5)
      } else {
        days = this.groupForecastsByDate()
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
    },
  },
  created() {
    emitter.on('forecastLength', e => this.forecastLength = e as ForecastLength);
    emitter.on('timezonename', e => this.timezonename = e);
  },
})
</script>

<template>
  <div class="forecast-cards-container">
    <Card class="forecast-card" v-for="forecast in  hourlyForecast ">
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
        <div v-if="forecastLength === '5 days'">
          <p>Max: <strong>{{ forecast.main.temp_max.toFixed(1) }}</strong></p>
          <p>Min: <strong>{{ forecast.main.temp_min.toFixed(1) }}</strong></p>
        </div>
        <div v-else>
          <p style="font-weight: bold">{{ forecast.main.temp.toFixed(1) }} °C</p>
          <p>{{ forecast.wind.speed }} m/s</p>
        </div>
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

.forecast-card {
  height: 18em;
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

p {
  margin: 0
}

/* Card style*/
:deep(.p-card .p-card-body) {
  padding-bottom: 0;
  padding-top: 3px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

:deep(.p-card .p-card-title) {
  font-size: medium;
  height: 22px;
}

:deep(.p-card .p-card-subtitle) {
  height: 125px;
  margin-bottom: 0;
  justify-content: flex-start;
  display: flex;
  flex-direction: column;
}

:deep(.p-card .p-card-content) {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0;
}

@media (max-width: 620px) {
  .forecast-cards-container {
    flex-wrap: wrap;
    border-radius: 10px;
    margin-left: 10px;
    margin-right: 10px;
  }
}
</style>