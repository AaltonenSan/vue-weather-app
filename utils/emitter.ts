import mitt from 'mitt'

type Events = {
  timezonename: string;
  forecastLength: string;
  message: string;
  loading: boolean;
  timeOfDay: string;
}

const emitter = mitt<Events>()

export default emitter