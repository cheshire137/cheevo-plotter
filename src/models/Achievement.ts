import Player from './Player'

class Achievement {
  isUnlocked: boolean;
  key: string;
  iconUri: string;
  name: string;
  players: Player[];

  constructor(isUnlocked: boolean, iconUri: string, name: string) {
    this.isUnlocked = isUnlocked;
    this.iconUri = iconUri;
    this.name = name;
    this.key = `${name} (${isUnlocked ? 'unlocked' : 'locked'})`;
    this.players = [];
  }
}

export default Achievement
