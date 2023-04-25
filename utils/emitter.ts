import mitt from 'mitt'

type Events = {
  timezone: number;
  forecastLength: string;
}

const emitter = mitt<Events>()

export default emitter