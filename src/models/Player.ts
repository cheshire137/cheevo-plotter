import Achievement from "./Achievement"

class Player {
  steamid: string;
  personaname: string;
  unlockedAchievements: Achievement[];

  constructor(steamid: string, personaname: string) {
    this.steamid = steamid;
    this.personaname = personaname;
    this.unlockedAchievements = [];
  }

  addUnlockedAchievement(achievement: Achievement) {
    this.unlockedAchievements.push(achievement)
  }
}

export default Player;
