import mitt from 'mitt'

type Events = {
  timezonename: string;
  forecastLength: string;
}

const emitter = mitt<Events>()

export default emitter