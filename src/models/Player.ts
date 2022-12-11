import Achievement from "./Achievement"
import PlayerSummary from "./PlayerSummary"

class Player {
  steamid: string;
  unlockedAchievements: Achievement[];
  playerSummary: PlayerSummary;

  constructor(steamid: string, playerSummary: PlayerSummary) {
    this.steamid = steamid;
    this.playerSummary = playerSummary;
    this.unlockedAchievements = [];
  }

  addUnlockedAchievement(achievement: Achievement) {
    this.unlockedAchievements.push(achievement)
  }

  hasAchievement(achievementKey: string) {
    return this.unlockedAchievements.some(a => a.key === achievementKey)
  }
}

export default Player;
