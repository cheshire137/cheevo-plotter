import fetch from '../core/fetch';
import Config from '../config.json';

class Steam {
  static async getSteamId(username) {
    return this.get('/api/steam?format=json' +
                    '&path=/ISteamUser/ResolveVanityURL/v0001/' +
                    '&vanityurl=' + username);
  }

  static async getAppsList() {
    return this.get('/api/steam?path=/ISteamApps/GetAppList/v2');
  }

  static async getOwnedGames(steamId) {
    return this.get('/api/steam?format=json' +
                    '&path=/IPlayerService/GetOwnedGames/v0001/' +
                    '&steamid=' + steamId);
  }

  static async get(path) {
    const url = Config[process.env.NODE_ENV].serverUri + path;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }
}

export default Steam;
