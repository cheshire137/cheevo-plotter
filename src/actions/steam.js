import fetch from '../core/fetch';
import Config from '../config.json';
import {parseString} from 'xml2js';

class Steam {
  static async getSteamId(username) {
    return this.get('/api/steam?format=json' +
                    '&path=/ISteamUser/ResolveVanityURL/v0001/' +
                    '&vanityurl=' + username);
  }

  static async getOwnedGames(steamId) {
    return this.get('/api/steam?format=json' +
                    '&path=/IPlayerService/GetOwnedGames/v0001/' +
                    '&steamid=' + steamId);
  }

  static async getAchievements(steamId, appId) {
    const xml = await this.get('/api/steam?path=/profiles/' + steamId +
                               '/stats/' + appId + '/achievements/&xml=1',
                               'xml');
    var result;
    parseString(xml, (err, r) => {
      result = r;
    });
    return result;
  }

  static async get(path, type) {
    type = type || 'json';
    const url = Config[process.env.NODE_ENV].serverUri + path;
    const response = await fetch(url);
    return type === 'json' ? await response.json() : await response.text();
  }
}

export default Steam;
