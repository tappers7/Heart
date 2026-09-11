import type { HeartAPI } from './index'

declare global {
  interface Window {
    heart: HeartAPI
  }
}

export {}
