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

export interface SteamPlayerAchievement {
  id: string
  unlocked: boolean
  unlockTime: string
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
