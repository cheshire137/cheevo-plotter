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
  friendIds: string[]
  privateProfile: boolean
}

// Keep in sync with `SteamGameAchievement` in pkg/server/get_steam_achievements_handler.go
export interface SteamGameAchievement {
  id: string
  appId: string
  name: string
  iconUrl: string
  grayIconUrl: string
  description: string
  hidden: boolean
}

// Keep in sync with `SteamPlayerAchievement` in pkg/server/get_steam_achievements_handler.go
export interface SteamPlayerAchievement {
  id: string
  unlocked: boolean
  unlockTime: string
  appId: string
  steamId: string
}
