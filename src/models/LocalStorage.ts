const localStorageKey = 'cheevo-plotter'
const timestampsKey = 'timestamps'

class LocalStorage {
  static getJSON() {
    if (typeof window === 'undefined') {
      console.error("don't have a window to access local storage")
      return {}
    }
    if (!window.localStorage) {
      console.error('browser does not support local storage')
      return {}
    }
    const appData = window.localStorage.getItem(localStorageKey) || '{}'
    return JSON.parse(appData)
  }

  static totalSize() {
    if (typeof window === 'undefined' || !window.localStorage) return -1
    return new Blob(Object.values(window.localStorage)).size
  }

  static clearTimestampedKeys() {
    if (typeof window === 'undefined' || !window.localStorage) return

    const appData = this.getJSON()
    const timestamps = appData[timestampsKey] || {}
    for (const key in timestamps) {
      delete appData[key]
    }
    delete appData[timestampsKey]
    window.localStorage.setItem(localStorageKey, JSON.stringify(appData))
  }

  static get(key: string) {
    const appData = this.getJSON()
    return appData[key]
  }

  static hasKey(key: string) {
    const appData = this.getJSON()
    return key in appData
  }

  static getAgeOfKeyInSeconds(key: string) {
    const timestamps = this.get(timestampsKey) || {}
    const now = new Date().getTime()
    const then = timestamps[key] || now
    return Math.abs(now - then) / 1000
  }

  static set(key: string, value: any, recordTimestamp?: boolean) {
    if (typeof window === 'undefined' || !window.localStorage) return

    const appData = this.getJSON()

    if (recordTimestamp) {
      const timestamps = appData[timestampsKey] || {}
      timestamps[key] = new Date().getTime()
      appData[timestampsKey] = timestamps
    }

    appData[key] = value
    window.localStorage.setItem(localStorageKey, JSON.stringify(appData))
  }

  static delete(key: string) {
    if (typeof window === 'undefined' || !window.localStorage) return

    const appData = this.getJSON()
    delete appData[key]
    const timestamps = appData[timestampsKey] || {}
    delete timestamps[key]
    appData[timestampsKey] = timestamps
    window.localStorage.setItem(localStorageKey, JSON.stringify(appData))
  }
}

export default LocalStorage;
