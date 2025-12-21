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
  friendIds?: string[]
}

export interface SteamAchievement {
  id: string
  unlocked: boolean
  unlockTime: string
  appId: string
  steamId: string
  name: string
  iconUrl: string
  grayIconUrl: string
  description: string
  hidden: boolean
}
