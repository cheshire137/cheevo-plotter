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
    parseString(xml, (err, rawResult) => {
      if (err === null) {
        const achievements =
            rawResult.playerstats.achievements[0].achievement.map((a) => {
              return {
                key: a.apiname[0],
                description: a.description[0],
                isUnlocked: isUnlocked,
                name: a.name[0],
                iconUri: isUnlocked ? a.iconClosed[0] : a.iconOpen[0]
              };
            });
        result = {
          achievements: achievements,
          iconUri: rawResult.playerstats.game[0].gameIcon[0]
        };
      } else {
        console.error('failed to get XML achievements for user ' + steamId +
                      ', app ' + appId + ': ' + err)
        result = this.getJsonAchievements(steamId, appId);
      }
    }.bind(this));
    return result;
  }

  static async getJsonAchievements(steamId, appId) {
    const rawResult = await this.get(
      '/api/steam?path=/ISteamUserStats/GetPlayerAchievements/v0001/' +
      '&appid=' + appId + '&steamid=' + steamId + '&format=json'
    );
    // TODO: somehow get game iconUri from JSON API
    const achievements = rawResult.playerstats.achievements.map((a => {
      return {
        key: a.apiname,
        isUnlocked: a.achieved === 1,
        name: a.apiname, // TODO
        description: a.apiname, // TODO
        iconUri: null // TODO
      };
    }));
    return {achievements: achievements};
  }

  static async get(path, type) {
    type = type || 'json';
    const url = Config[process.env.NODE_ENV].serverUri + path;
    const response = await fetch(url);
    return type === 'json' ? await response.json() : await response.text();
  }
}

export default Steam;
