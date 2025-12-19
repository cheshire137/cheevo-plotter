import PlayerSummary from "./PlayerSummary"

class Player {
  steamid: string;
  unlockedAchievementKeys: string[];
  playerSummary: PlayerSummary;

  constructor(steamid: string, playerSummary: PlayerSummary) {
    this.steamid = steamid;
    this.playerSummary = playerSummary;
    this.unlockedAchievementKeys = [];
  }

  setUnlockedAchievementKeys(keys: string[]) {
    this.unlockedAchievementKeys = keys
  }

  hasAchievement(achievementKey: string) {
    return this.unlockedAchievementKeys.includes(achievementKey)
  }

  totalUnlockedAchievements() {
    return this.unlockedAchievementKeys.length
  }
}

export default Player;
