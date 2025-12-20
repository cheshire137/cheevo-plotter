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
