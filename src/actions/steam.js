import fetch from '../core/fetch';
import Config from '../config.json';

class Steam {
  static async getSteamId(username) {
    return this.makeRequest('/api/steam?format=json' +
                            '&path=/ISteamUser/ResolveVanityURL/v0001/' +
                            '&vanityurl=' + username);
  }

  static async getOwnedGames(steamId) {
    return this.makeRequest('/api/steam?format=json' +
                            '&path=/IPlayerService/GetOwnedGames/v0001/' +
                            '&steamid=' + steamId);
  }

  static async makeRequest(path) {
    const url = Config[process.env.NODE_ENV].serverUri + path;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }
}

export default Steam;
