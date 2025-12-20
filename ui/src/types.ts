export interface SteamGame {
  appId: string
  name: string
  playtime: number
}

export interface SteamUser {
  steamId: string
  name: string
  profileUrl: string
  avatarUrl: string
}

export interface SteamAchievement {
  name: string
  unlocked: boolean
  unlockTime: string
}
