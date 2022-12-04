import {parseStringPromise} from 'xml2js';
import Achievement from './Achievement';
import Game from './Game';
import Friend from './Friend';
import PlayerSummary from './PlayerSummary';

enum ResponseType {
  JSON = "json",
  XML = "xml"
}

const serverUrl = 'http://localhost:8080';

class SteamApi {
  // https://wiki.teamfortress.com/wiki/WebAPI/ResolveVanityURL
  static async getSteamID(username: string): Promise<string> {
    const data = await this.get('/api/steam?format=json&path=/ISteamUser/ResolveVanityURL/v0001/&vanityurl=' +
      encodeURIComponent(username))
    if (data && data.response && data.response.steamid) {
      return data.response.steamid
    }
    if (data && data.response && data.response.message) {
      throw new Error(data.response.message)
    }
    throw new Error('Failed to get Steam ID.')
  }

  static async getPlayerSummaries(steamIDs: string[]) {
    const batches = [];
    // see https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0002.29
    const batchSize = 100;
    let index = 0;
    while (index < steamIDs.length) {
      var batch = [];
      while (batch.length < batchSize && index < steamIDs.length) {
        batch.push(steamIDs[index]);
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
    return summaries.map(ps => new PlayerSummary(ps));
  }

  static async getFriends(steamID: string): Promise<Friend[]> {
    // https://developer.valvesoftware.com/wiki/Steam_Web_API#GetFriendList_.28v0001.29
    const data = await this.get('/api/steam?format=json&path=/ISteamUser/GetFriendList/v0001/&steamid=' + steamID +
      '&relationship=friend');
    if (data.friendslist && data.friendslist.friends) {
      return data.friendslist.friends.map((d: any) => new Friend(d))
    }
    throw new Error('Failed to get friends for ' + steamID + '; may not be a public profile.');
  }

  static async getOwnedGames(steamID: string): Promise<Game[]> {
    const data = await this.get('/api/steam?format=json&path=/IPlayerService/GetOwnedGames/v0001/&steamid=' +
      steamID)
    if (data && data.response && data.response.games) {
      return data.response.games.map((g: any) => new Game({
        appID: g.appid,
        totalPlaytime: g.playtime_forever,
        timeLastPlayed: g.rtime_last_played,
      }))
    }
    throw new Error('Could not get Steam games for ID ' + steamID + '; may not be a public profile.')
  }

  static async getOwnedPlayedGames(steamID: string) {
    const ownedGames = await this.getOwnedGames(steamID)
    return ownedGames.filter(game => game.totalPlaytime > 0)
  }

  static async getAchievements(steamID: string, appID: number) {
    const xml = await this.get('/api/steam?path=/profiles/' + steamID + '/stats/' + appID + '/achievements/&xml=1',
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
      return new Game({ iconUri: gameIconUri, appID, achievements })
    } catch (err) {
      console.error('failed to get XML achievements for user ' + steamID + ', app ' + appID + ': ' + err)
      return this.getJsonAchievements(steamID, appID)
    }
  }

  static async getJsonAchievements(steamID: string, appID: number) {
    const rawResult = await this.get('/api/steam?path=/ISteamUserStats/GetPlayerAchievements/v0001/&appid=' + appID +
      '&steamid=' + steamID + '&format=json');
    if (typeof rawResult.playerstats.error === 'string') {
      throw new Error(rawResult.playerstats.error);
    }
    const schema = await this.getGameSchema(appID);
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
    return new Game({ iconUri: '', appID, achievements })
  }

  static async getGameSchema(appID: number) {
    return this.get('/api/steam?format=json&path=/ISteamUserStats/GetSchemaForGame/v2/&appid=' + appID);
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
