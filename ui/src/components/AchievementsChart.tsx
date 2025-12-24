import {useMemo} from 'react'
import { Avatar } from '@primer/react'
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts'
import type {SteamPlayerAchievement, SteamUser} from '../types'

export function AchievementsChart({
  playerAchievements,
  playersBySteamId,
}: {
  playerAchievements: SteamPlayerAchievement[]
  playersBySteamId: Record<string, SteamUser>
}) {
  const data = useMemo(() => {
    const countsByPlayerId: Record<string, number> = {}
    for (const steamId of Object.keys(playersBySteamId)) {
      countsByPlayerId[steamId] = 0
    }
    for (const playerAchievement of playerAchievements) {
      const key = playerAchievement.steamId
      countsByPlayerId[key] = (countsByPlayerId[key] || 0) + (playerAchievement.unlocked ? 1 : 0)
    }
    const data = Object.entries(countsByPlayerId).map(([steamId, unlockCount]) => {
      const player = playersBySteamId[steamId]
      return {
        steamId,
        unlockCount,
        playerName: player?.name || steamId,
        avatarUrl: player?.avatarUrl,
      }
    })
    return data
  }, [playerAchievements, playersBySteamId])

  return (
    <BarChart
      style={{width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618}}
      margin={{top: 5, right: 0, left: 0, bottom: 5}}
      data={data}
      responsive
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="playerName"
        tick={({x, y, payload: {value}}) => {
          const avatarUrl = value ? data.find(item => item.playerName === value)?.avatarUrl : ''
          return (
            <g transform={`translate(${x},${y})`}>
              {avatarUrl && (
                <foreignObject x={-15} y={0} width={30} height={30}>
                  <Avatar src={avatarUrl} alt={value} />
                </foreignObject>
              )}
            </g>
          )
        }}
        interval={0}
      />
      <YAxis width="auto" />
      <Tooltip />
      <Legend />
      <Bar dataKey="unlockCount" fill="#8884d8" radius={[10, 10, 0, 0]} />
    </BarChart>
  )
}
