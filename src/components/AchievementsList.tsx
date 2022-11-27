import React from 'react';

interface Props {
  achievements: any[];
}

const AchievementsList = ({ achievements }: Props) => {
  if (achievements.length < 1) {
    return <p>No achievements</p>
  }

  const unlockedCount = achievements.filter(a => a.isUnlocked).length
  const percentage = Math.round((unlockedCount / achievements.length) * 100)

  return <div>
    <p>
      Unlocked {unlockedCount} of {achievements.length} &mdash;
      <strong> {percentage}%</strong>
    </p>
    <ul>
      {achievements.map((achievement) => <li key={achievement.key}>
        {typeof achievement.iconUri === 'string' ? <img src={achievement.iconUri} alt={achievement.name}
          width="64" height="64" /> : null}
        <span>{achievement.name}</span>
      </li>)}
    </ul>
  </div>
}

export default AchievementsList;
