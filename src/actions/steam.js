import fetch from '../core/fetch';
import Config from '../config.json';
import {parseString} from 'xml2js';

class Steam {
  static async getSteamId(username) {
    return this.get('/api/steam?format=json' +
                    '&path=/ISteamUser/ResolveVanityURL/v0001/' +
                    '&vanityurl=' + username);
  }

  static async getPlayerSummaries(steamIds) {
    var batches = [];
    // see https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0002.29
    var batchSize = 100;
    var index = 0;
    while (index < steamIds.length) {
      var batch = [];
      while (batch.length < batchSize && index < steamIds.length) {
        batch.push(steamIds[index]);
        index++;
      }
      batches.push(batch);
    }
    var summaries = [];
    for (var i = 0; i < batches.length; i++) {
      var result =
          await this.get('/api/steam?format=json' +
                         '&path=/ISteamUser/GetPlayerSummaries/v0002/' +
                         '&steamids=' + batches[i].join(','));
      if (result.response) {
        summaries = summaries.concat(result.response.players || []);
      }
    }
    summaries.sort((a, b) => {
      const aName = a.personaname.toLowerCase();
      const bName = b.personaname.toLowerCase();
      return aName.localeCompare(bName);
    });
    return summaries;
  }

  static async getFriends(steamId) {
    return this.get('/api/steam?format=json' +
                    '&path=/ISteamUser/GetFriendList/v0001/' +
                    '&steamid=' + steamId + '&relationship=friend');
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
              var isUnlocked = typeof a.unlockTimestamp !== 'undefined';
              return {
                key: a.apiname[0],
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
    if (typeof rawResult.playerstats.error === 'string') {
      throw new Error(rawResult.playerstats.error);
    }
    // TODO: somehow get game iconUri from JSON API
    const schema = await this.getGameSchema(appId);
    const schemaAchievements = schema.game.availableGameStats.achievements;
    var achievementInfo = {};
    for (var i = 0; i < schemaAchievements.length; i++) {
      var achievement = schemaAchievements[i];
      achievementInfo[achievement.name] = achievement;
    }
    const achievements = rawResult.playerstats.achievements.map((a => {
      var info = achievementInfo[a.apiname];
      var isUnlocked = a.achieved === 1;
      return {
        key: a.apiname,
        isUnlocked: isUnlocked,
        name: info.displayName,
        iconUri: isUnlocked ? info.icon : info.icongray
      };
    }));
    return {achievements: achievements};
  }

  static async getGameSchema(appId) {
    return this.get('/api/steam?format=json' +
                    '&path=/ISteamUserStats/GetSchemaForGame/v2/' +
                    '&appid=' + appId);
  }

  static async get(path, type) {
    type = type || 'json';
    const url = Config[process.env.NODE_ENV].serverUri + path;
    const response = await fetch(url);
    if (response.status >= 200 && response.status < 300) {
      return type === 'json' ? await response.json() : await response.text();
    }
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

export default Steam;
