export interface SteamOwnedGame {
  appId: string
  name: string
  playtime: number
  steamId: string
}

// Keep in sync with `SteamUser` in pkg/server/get_steam_player_summaries_handler.go
export interface SteamUser {
  steamId: string
  name: string
  profileUrl: string
  avatarUrl: string
  friendIds?: string[]
  privateProfile: boolean
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
