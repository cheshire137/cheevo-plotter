import SteamAppsList from './steam-apps.json';

class SteamApps {
  static sortedIds() {
    if (typeof this._sortedIds === 'object') {
      console.log('using existing list of app ids');
      return this._sortedIds;
    }
    console.log('constructing list of sorted app ids');
    const apps = SteamAppsList.applist.apps;
    apps.sort((a, b) => {
      var aName = a.name.toLowerCase();
      if (aName.indexOf('the ') === 0) {
        aName = aName.substring(4);
      }
      if (aName.indexOf('a ') === 0) {
        aName = aName.substring(2);
      }
      var bName = b.name.toLowerCase();
      if (bName.indexOf('the ') === 0) {
        bName = bName.substring(4);
      }
      if (bName.indexOf('a ') === 0) {
        bName = bName.substring(2);
      }
      return aName < bName ? -1 : aName > bName ? 1 : 0;
    });
    this._sortedIds = apps.map((app) => app.appid);
    return this._sortedIds;
  }

  static sortIds(appIds) {
    const sortedIds = this.sortedIds();
    appIds.sort((a, b) => {
      const indexA = sortedIds.indexOf(a);
      const indexB = sortedIds.indexOf(b);
      return indexA < indexB ? -1 : indexA > indexB ? 1 : 0;
    });
    return appIds;
  }
}

export default SteamApps;
