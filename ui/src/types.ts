export interface SteamOwnedGame {
  appId: string
  name: string
  playtime: number
  steamId: string
}

export interface SteamUser {
  steamId: string
  name: string
  profileUrl: string
  avatarUrl: string
}

export interface SteamPlayerAchievement {
  id: string
  unlocked: boolean
  unlockTime: string
  appId: string
  steamId: string
}

export interface SteamGameSchema {
  name: string
  achievements: SteamGameAchievement[]
  version: string
}

export interface SteamGameAchievement {
  id: string
  name: string
  iconUrl: string
  grayIconUrl: string
  description: string
  hidden: boolean
}
