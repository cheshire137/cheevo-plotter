import Achievement from './Achievement'
import Game from './Game'
import LocalStorage from './LocalStorage'
import Friend from './Friend'
import PlayerSummary from './PlayerSummary'
import { hashString } from './Utils'

enum ResponseType {
  JSON = "json",
  XML = "xml"
}

export const backendUrl = 'http://localhost:8080';
const maxCacheAgeInSeconds = 86400; // 24 hours

type AchievementsResult = { iconUri?: string, achievements: Achievement[], unlockedAchievements: Achievement[] };

class SteamApi {
  static async getAuthenticatedUser() {
    const user = await this.get('/api/steam/user')
    if (user && user.steamid) {
      return user
    }
    return null
  }

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
    // see https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0002.29
    const batchSize = 100
    const batches = []
    let index = 0

    while (index < steamIDs.length) {
      const batch = []
      while (batch.length < batchSize && index < steamIDs.length) {
        batch.push(steamIDs[index])
        index++
      }
      batches.push(batch)
    }

    let summaries: any[] = []
    for (const batch of batches) {
      const result = await this.get('/api/steam?format=json&path=/ISteamUser/GetPlayerSummaries/v0002/' +
        '&steamids=' + batch.join(','))
      if (result.response) {
        summaries = summaries.concat(result.response.players || [])
      }
    }
    const playerSummaries = summaries.map(ps => new PlayerSummary(ps))
    playerSummaries.sort((a, b) => a.compare(b))
    return playerSummaries
  }

  static async getFriends(steamID: string): Promise<Friend[]> {
    // https://developer.valvesoftware.com/wiki/Steam_Web_API#GetFriendList_.28v0001.29
    const data = await this.get('/api/steam?format=json&path=/ISteamUser/GetFriendList/v0001/&steamid=' + steamID +
      '&relationship=friend');
    if (data.friendslist && data.friendslist.friends) {
      return data.friendslist.friends.map((d: any) => new Friend(d))
    }

    throw new Error('Failed to get friends for ' + steamID + '; may not be a public profile.')
  }

  static async getOwnedGames(steamID: string, username?: string): Promise<Game[]> {
    const data = await this.get(`/api/steam?format=json&path=/IPlayerService/GetOwnedGames/v0001/&steamid=${steamID}`)
    if (data && data.response && data.response.games) {
      return data.response.games.map((g: any) => new Game({
        appID: g.appid,
        totalPlaytime: g.playtime_forever,
        timeLastPlayed: g.rtime_last_played,
      }))
    }

    const userDesc = username ? username : `ID ${steamID}`
    throw new Error(`Couldn't load Steam games for ${userDesc}; may not be a public profile.`)
  }

  static async getOwnedPlayedGames(steamID: string, username?: string) {
    const ownedGames = await this.getOwnedGames(steamID, username)
    const playedGames = ownedGames.filter(game => game.totalPlaytime > 0)
    playedGames.sort((a, b) => a.compare(b))
    return playedGames
  }

  // https://partner.steamgames.com/doc/webapi/ISteamUserStats#GetPlayerAchievements
  static async getAchievements(steamID: string, appID: number): Promise<AchievementsResult> {
    const rawResult = await this.get(`/api/steam?path=/ISteamUserStats/GetPlayerAchievements/v1/&appid=${appID}` +
      `&steamid=${steamID}&format=json`)
    if (typeof rawResult.playerstats.error === 'string') {
      throw new Error(rawResult.playerstats.error)
    }
    console.log('json achievements', rawResult)

    const schema = await this.getGameSchema(appID)
    const achievementInfo: { [name: string]: any } = {}
    for (const schemaAchievement of schema.game.availableGameStats.achievements) {
      achievementInfo[schemaAchievement.name] = schemaAchievement
    }

    const unlockedAchievements: Achievement[] = []
    const achievements = rawResult.playerstats.achievements.map((a: any) => {
      const info = achievementInfo[a.apiname]
      const isUnlocked = a.achieved === 1
      const achievementIconUri = isUnlocked ? info.icon : info.icongray
      const achievementName = info.displayName
      const achievementKey = a.apiname
      const achievement = new Achievement(achievementIconUri, achievementName, achievementKey)
      if (isUnlocked) {
        unlockedAchievements.push(achievement)
      }
      return achievement
    })

    // TODO: somehow get game iconUri from JSON API
    return { achievements, unlockedAchievements }
  }

  static async getGameSchema(appID: number) {
    return this.get(`/api/steam?format=json&path=/ISteamUserStats/GetSchemaForGame/v2/&appid=${appID}`)
  }

  static async get(path: string, type?: ResponseType) {
    type = type || ResponseType.JSON;

    const cacheKey = hashString(`${type}-${path}`).toString()
    if (LocalStorage.hasKey(cacheKey)) {
      if (LocalStorage.getAgeOfKeyInSeconds(cacheKey) < maxCacheAgeInSeconds) {
        return LocalStorage.get(cacheKey)
      }
      LocalStorage.delete(cacheKey) // too old
    }

    const response = await fetch(backendUrl + path);
    if (response.status >= 200 && response.status < 300) {
      let result
      if (type === ResponseType.JSON) {
        result = await response.json()
      } else {
        result = await response.text()
      }
      console.log('total local storage size', LocalStorage.totalSize())
      LocalStorage.set(cacheKey, result, true)
      return result
    }

    throw new Error(response.statusText);
  }
}

export default SteamApi;
