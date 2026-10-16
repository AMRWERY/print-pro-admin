import { defineNuxtPlugin } from 'nuxt/app'
import * as XLSX from 'xlsx'

export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      xlsx: XLSX
    }
  }
})