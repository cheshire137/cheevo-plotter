import SteamAppsList from './steam-apps.json';

class SteamApps {
  static sortedIds() {
    if (typeof this._sortedIds === 'object') {
      return this._sortedIds;
    }
    const apps = SteamAppsList.applist.apps;
    apps.sort((a, b) => {
      let aName = a.name.toLowerCase();
      if (aName.indexOf('the ') === 0) {
        aName = aName.substring(4);
      }
      if (aName.indexOf('a ') === 0) {
        aName = aName.substring(2);
      }
      let bName = b.name.toLowerCase();
      if (bName.indexOf('the ') === 0) {
        bName = bName.substring(4);
      }
      if (bName.indexOf('a ') === 0) {
        bName = bName.substring(2);
      }
      return aName.localeCompare(bName);
    });
    this._sortedIds = apps.map((app) => String(app.appid));
    this._sortedNames = apps.map((app) => app.name);
    return this._sortedIds;
  }

  static getName(appId) {
    const index = this.sortedIds().indexOf(String(appId));
    return this._sortedNames[index];
  }

  static sortIds(appIds) {
    const sortedIds = this.sortedIds();
    appIds.sort((a, b) => {
      const indexA = sortedIds.indexOf(String(a));
      const indexB = sortedIds.indexOf(String(b));
      if (indexA < indexB) {
        return -1;
      }
      return indexA > indexB ? 1 : 0;
    });
    return appIds;
  }
}

export default SteamApps;
