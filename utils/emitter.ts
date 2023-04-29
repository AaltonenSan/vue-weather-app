import mitt from 'mitt'

type Events = {
  timezonename: string;
  forecastLength: string;
  noWeather: string;
  loading: boolean;
  timeOfDay: string;
}

const emitter = mitt<Events>()

export default emitter