import Achievement from "./Achievement"

class Game {
  iconUri: string;
  achievements: Achievement[];
  appId: number;

  constructor(iconUri: string, achievements: Achievement[], appId: number) {
    this.iconUri = iconUri;
    this.achievements = achievements;
    this.appId = appId;
  }
}

export default Game
