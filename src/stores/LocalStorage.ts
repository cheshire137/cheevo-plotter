const localStorageKey = "cheevo-plotter";

class LocalStorage {
  static getJSON() {
    if (typeof window === 'undefined') {
      return {};
    }
    if (!window.localStorage) {
      console.error('browser does not support local storage');
      return {};
    }
    var appData = window.localStorage.getItem(localStorageKey) || '{}';
    return JSON.parse(appData);
  }

  static get(key: string) {
    var appData = this.getJSON();
    return appData[key];
  }

  static set(key: string, value: any) {
    var appData = this.getJSON();
    appData[key] = value;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(localStorageKey, JSON.stringify(appData));
    }
  }

  static delete(key: string) {
    var appData = this.getJSON();
    delete appData[key];
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(localStorageKey, JSON.stringify(appData));
    }
  }
}

export default LocalStorage;
