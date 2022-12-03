import Achievement from "./Achievement"

class Game {
  iconUri: string;
  achievements: Achievement[];
  appId: number;

  constructor(iconUri: string, appId: number) {
    this.iconUri = iconUri;
    this.achievements = [];
    this.appId = appId;
  }

  setAchievements(achievements: Achievement[]) {
    this.achievements = achievements;
  }
}

export default Game
