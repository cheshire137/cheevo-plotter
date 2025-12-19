import Achievement from './Achievement'

enum ResponseType {
  JSON = 'json',
  XML = 'xml',
}

type AchievementsResult = {iconUri?: string; achievements: Achievement[]; unlockedAchievements: Achievement[]}

class SteamApi {
  static async getAuthenticatedUser() {
    const user = await this.get('/api/steam/user')
    if (user && user.steamid) {
      return user
    }
    return null
  }

  static async getOwnedPlayedGames(steamID: string, username?: string) {
    const ownedGames = await this.getOwnedGames(steamID, username)
    const playedGames = ownedGames.filter(game => game.totalPlaytime > 0)
    playedGames.sort((a, b) => a.compare(b))
    return playedGames
  }

  // https://partner.steamgames.com/doc/webapi/ISteamUserStats#GetPlayerAchievements
  static async getAchievements(steamID: string, appID: number): Promise<AchievementsResult> {
    const rawResult = await this.get(
      `/api/steam?path=/ISteamUserStats/GetPlayerAchievements/v1/&appid=${appID}` + `&steamid=${steamID}&format=json`
    )
    if (typeof rawResult.playerstats.error === 'string') {
      throw new Error(rawResult.playerstats.error)
    }
    console.log('json achievements', rawResult)

    const schema = await this.getGameSchema(appID)
    const achievementInfo: {[name: string]: any} = {}
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
    return {achievements, unlockedAchievements}
  }

  static async getGameSchema(appID: number) {
    return this.get(`/api/steam?format=json&path=/ISteamUserStats/GetSchemaForGame/v2/&appid=${appID}`)
  }

  static async get(path: string, type?: ResponseType) {
    type = type || ResponseType.JSON

    const response = await fetch(import.meta.env.VITE_BACKEND_URL + path)
    if (response.status >= 200 && response.status < 300) {
      let result
      if (type === ResponseType.JSON) {
        result = await response.json()
      } else {
        result = await response.text()
      }
      return result
    }

    throw new Error(response.statusText)
  }
}

export default SteamApi
