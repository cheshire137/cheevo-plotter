import Achievement from "./Achievement"

class Game {
  iconUri: string;
  achievements: Achievement[];

  constructor(iconUri: string, achievements: Achievement[]) {
    this.iconUri = iconUri;
    this.achievements = achievements;
  }
}

export default Game
