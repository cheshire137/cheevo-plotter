import {parseString} from 'xml2js';

enum ResponseType {
  JSON = "json",
  XML = "xml"
}

const serverUrl = 'http://localhost:8080';

class SteamApi {
  // https://wiki.teamfortress.com/wiki/WebAPI/ResolveVanityURL
  static async getSteamId(username: string) {
    const data = await this.get('/api/steam?format=json' +
                                '&path=/ISteamUser/ResolveVanityURL/v0001/' +
                                '&vanityurl=' + encodeURIComponent(username));
    if (data.response.steamid) {
      return data;
    }
    var message;
    if (data.response.message) {
      message = data.response.message;
    } else {
      message = 'Failed to get Steam ID.'
    }
    throw new Error(message);
  }

  static async getPlayerSummaries(steamIds: string[]) {
    const batches = [];
    // see https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0002.29
    const batchSize = 100;
    let index = 0;
    while (index < steamIds.length) {
      var batch = [];
      while (batch.length < batchSize && index < steamIds.length) {
        batch.push(steamIds[index]);
        index++;
      }
      batches.push(batch);
    }
    let summaries: any[] = [];
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

  static async getFriends(steamId: string) {
    const data = await this.get('/api/steam?format=json' +
                                '&path=/ISteamUser/GetFriendList/v0001/' +
                                '&steamid=' + steamId +
                                '&relationship=friend');
    if (data.friendslist) {
      return data;
    }
    throw new Error('Failed to get friends for ' + steamId +
                    '; may not be a public profile.');
  }

  static async getOwnedGames(steamId: string) {
    const data = await this.get('/api/steam?format=json' +
                                '&path=/IPlayerService/GetOwnedGames/v0001/' +
                                '&steamid=' + steamId);
    if (data.response.games) {
      return data;
    }
    throw new Error('Could not get Steam games for ID ' + steamId +
                    '; may not be a public profile.');
  }

  static async getAchievements(steamId: string, appId: number) {
    const xml = await this.get('/api/steam?path=/profiles/' + steamId +
                               '/stats/' + appId + '/achievements/&xml=1',
                               ResponseType.XML);
    var result;
    const self = this;
    parseString(xml, (err, rawResult) => {
      if (err === null) {
        const achievements =
            rawResult.playerstats.achievements[0].achievement.map((a: any) => {
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
        result = self.getJsonAchievements(steamId, appId);
      }
    });
    return result;
  }

  static async getJsonAchievements(steamId: string, appId: number) {
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
    const achievementInfo: any = {};
    for (var i = 0; i < schemaAchievements.length; i++) {
      var achievement = schemaAchievements[i];
      achievementInfo[achievement.name] = achievement;
    }
    const achievements = rawResult.playerstats.achievements.map(((a: any) => {
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

  static async getGameSchema(appId: number) {
    return this.get('/api/steam?format=json' +
                    '&path=/ISteamUserStats/GetSchemaForGame/v2/' +
                    '&appid=' + appId);
  }

  static async get(path: string, type?: ResponseType) {
    type = type || ResponseType.JSON;
    const response = await fetch(serverUrl + path);
    if (response.status >= 200 && response.status < 300) {
      return type === ResponseType.JSON ? await response.json() : await response.text();
    }
    throw new Error(response.statusText);
  }
}

export default SteamApi;
