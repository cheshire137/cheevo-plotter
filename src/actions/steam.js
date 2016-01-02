import fetch from '../core/fetch';
import Config from '../config.json';

class Steam {
  static async getSteamId(username) {
    return this.makeRequest('/api/steam' +
                            '?path=/ISteamUser/ResolveVanityURL/v0001/' +
                            '&vanityurl=' + username);
  }

  static async makeRequest(path) {
    const url = Config[process.env.NODE_ENV].serverUri + path +
                (path.indexOf('?') > -1 ? '&' : '?') +
                'format=json';
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }
}

export default Steam;
