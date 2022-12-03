import {parseStringPromise} from 'xml2js';
import Achievement from './Achievement';
import Game from './Game';

enum ResponseType {
  JSON = "json",
  XML = "xml"
}

const serverUrl = 'http://localhost:8080';

class SteamApi {
  // https://wiki.teamfortress.com/wiki/WebAPI/ResolveVanityURL
  static async getSteamId(username: string) {
    const data = await this.get('/api/steam?format=json&path=/ISteamUser/ResolveVanityURL/v0001/&vanityurl=' +
      encodeURIComponent(username));
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
    for (const batch of batches) {
      const result = await this.get('/api/steam?format=json&path=/ISteamUser/GetPlayerSummaries/v0002/' +
        '&steamids=' + batch.join(','));
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
    const data = await this.get('/api/steam?format=json&path=/ISteamUser/GetFriendList/v0001/&steamid=' + steamId +
      '&relationship=friend');
    if (data.friendslist) {
      return data;
    }
    throw new Error('Failed to get friends for ' + steamId + '; may not be a public profile.');
  }

  static async getOwnedGames(steamId: string) {
    const data = await this.get('/api/steam?format=json&path=/IPlayerService/GetOwnedGames/v0001/&steamid=' +
      steamId);
    if (data.response.games) {
      return data;
    }
    throw new Error('Could not get Steam games for ID ' + steamId + '; may not be a public profile.');
  }

  static async getAchievements(steamId: string, appId: number) {
    const xml = await this.get('/api/steam?path=/profiles/' + steamId + '/stats/' + appId + '/achievements/&xml=1',
      ResponseType.XML);
    try {
      const rawResult = await parseStringPromise(xml)
      const achievements: Achievement[] = rawResult.playerstats.achievements[0].achievement.map((a: any) => {
        const isUnlocked = typeof a.unlockTimestamp !== 'undefined'
        const achievementIconUri = isUnlocked ? a.iconClosed[0] : a.iconOpen[0]
        const achievementName = a.name[0]
        const achievementKey = a.apiname[0]
        return new Achievement(isUnlocked, achievementIconUri, achievementName, achievementKey)
      })
      const gameIconUri = rawResult.playerstats.game[0].gameIcon[0]
      return new Game(gameIconUri, achievements)
    } catch (err) {
      console.error('failed to get XML achievements for user ' + steamId + ', app ' + appId + ': ' + err)
      return this.getJsonAchievements(steamId, appId)
    }
  }

  static async getJsonAchievements(steamId: string, appId: number) {
    const rawResult = await this.get('/api/steam?path=/ISteamUserStats/GetPlayerAchievements/v0001/&appid=' + appId +
      '&steamid=' + steamId + '&format=json');
    if (typeof rawResult.playerstats.error === 'string') {
      throw new Error(rawResult.playerstats.error);
    }
    const schema = await this.getGameSchema(appId);
    const achievementInfo: { [name: string]: any } = {}
    for (const schemaAchievement of schema.game.availableGameStats.achievements) {
      achievementInfo[schemaAchievement.name] = schemaAchievement;
    }
    const achievements = rawResult.playerstats.achievements.map((a: any) => {
      const info = achievementInfo[a.apiname]
      const isUnlocked = a.achieved === 1
      const achievementIconUri = isUnlocked ? info.icon : info.icongray
      const achievementName = info.displayName
      const achievementKey = a.apiname
      return new Achievement(isUnlocked, achievementIconUri, achievementName, achievementKey)
    });
    // TODO: somehow get game iconUri from JSON API
    return new Game('', achievements)
  }

  static async getGameSchema(appId: number) {
    return this.get('/api/steam?format=json&path=/ISteamUserStats/GetSchemaForGame/v2/&appid=' + appId);
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
