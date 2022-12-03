import SteamAppsList from '../stores/steam-apps.json'
import Achievement from "./Achievement"

const appsList: any[] = (SteamAppsList as any).applist.apps
const gameNamesByID: { [id: number]: string } = appsList.reduce((acc, app) => {
  acc[app.appid] = app.name
  return acc
}, {})

interface GameData {
  iconUri?: string;
  appID: number;
  achievements?: Achievement[];
  totalPlaytime?: number;
  timeLastPlayed?: number;
}

class Game {
  iconUri: string;
  achievements: Achievement[];
  appID: number;
  totalPlaytime: number;
  timeLastPlayed: Date | null;
  name: string;
  url: string;

  constructor(data: GameData) {
    this.iconUri = data.iconUri || ''
    this.achievements = data.achievements || []
    this.appID = data.appID
    this.totalPlaytime = data.totalPlaytime || 0
    this.timeLastPlayed = data.timeLastPlayed ? new Date(data.timeLastPlayed * 1000) : null
    this.name = gameNamesByID[this.appID] || 'unknown'
    this.url = 'https://steamcommunity.com/app/' + this.appID;
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
