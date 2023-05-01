import { defineStore } from 'pinia'

export const useStore = defineStore('store', {
  state: () => {
    return {
      timezone: 'Europe/Tallinn'
    }
  }
})