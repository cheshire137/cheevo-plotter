import SteamAppsList from '../stores/steam-apps.json'

const appsList: any[] = (SteamAppsList as any).applist.apps
const gameNamesByID: { [id: number]: string } = appsList.reduce((acc, app) => {
  acc[app.appid] = app.name
  return acc
}, {})

interface GameData {
  iconUri?: string;
  appID: number;
  totalPlaytime?: number;
  timeLastPlayed?: number | string;
  dateLastPlayed?: Date;
  name?: string;
  url?: string;
}

class Game {
  iconUri: string | null;
  appID: number;
  totalPlaytime: number;
  timeLastPlayed: Date | null;
  name: string;
  url: string;

  constructor(data: GameData) {
    if (data.iconUri) {
      this.iconUri = data.iconUri
    } else {
      this.iconUri = null
    }
    this.appID = data.appID
    this.totalPlaytime = data.totalPlaytime || 0
    if (typeof data.timeLastPlayed === 'number') {
      this.timeLastPlayed = new Date(data.timeLastPlayed * 1000)
    } else if (typeof data.timeLastPlayed === 'string') {
      this.timeLastPlayed = new Date(data.timeLastPlayed)
    } else if (data.dateLastPlayed) {
      this.timeLastPlayed = data.dateLastPlayed
    } else {
      this.timeLastPlayed = null
    }
    if (data.name) {
      this.name = data.name
    } else {
      this.name = gameNamesByID[this.appID] || 'unknown'
    }
    if (data.url) {
      this.url = data.url
    } else {
      this.url = `https://steamcommunity.com/app/${this.appID}`
    }
  }

  compare(otherGame: Game) {
    if (this.appID === otherGame.appID) return 0
    if (this.timeLastPlayed && otherGame.timeLastPlayed) {
      if (this.timeLastPlayed === otherGame.timeLastPlayed) return 0
      return this.timeLastPlayed > otherGame.timeLastPlayed ? -1 : 1
    }
    return this.getNormalizedName().localeCompare(otherGame.getNormalizedName())
  }

  getNormalizedName() {
    let normalizedName = this.name.toLowerCase()
    if (normalizedName.indexOf('the ') === 0) {
      normalizedName = normalizedName.substring(4)
    }
    if (normalizedName.indexOf('a ') === 0) {
      normalizedName = normalizedName.substring(2)
    }
    return normalizedName
  }
}

export default Game
