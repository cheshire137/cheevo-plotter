import React from 'react';

interface Props {
  player: any;
  achievements: any[];
  isCurrent: boolean;
  onUsernameChange(username: string, steamID?: string): void;
}

const Player = ({ player, achievements, isCurrent, onUsernameChange }: Props) => {
  const getUnlockPercentageText = () => {
    if (typeof achievements !== 'object') {
      return '--';
    }
    var unlockCount = 0;
    const total = achievements.length;
    for (var i = 0; i < total; i++) {
      if (achievements[i].isUnlocked) {
        unlockCount++;
      }
    }
    return Math.round((unlockCount / total) * 100) + '%';
  }

  const haveAchievements = typeof achievements === 'object' && achievements.length > 0;

  return <li>
    {isCurrent ? <span>
      <img src={player.avatar} alt={player.steamid} />
      <span>{player.personaname}</span>
    </span> :
      <button type="button" onClick={e => onUsernameChange(player.personaname, player.steamid)}>
        <img src={player.avatar} alt={player.steamid} />
        <span>{player.personaname}</span>
      </button>
    }
    {haveAchievements ? <span>{getUnlockPercentageText()}</span> : null}
  </li>
}

export default Player;
