import {useMemo} from 'react'
import {Avatar} from '@primer/react'
import {BarChart, Bar, XAxis, YAxis, Tooltip} from 'recharts'
import type {SteamPlayerAchievement, SteamUser} from '../types'
import {useSelectedFriends} from '../contexts/selected-friends-context'
import {useGetCurrentUser} from '../queries/use-get-current-user'

interface ChartData {
  steamId: string;
  'Total unlocked': number;
  playerName: string;
  avatarUrl: string;
}

export function AchievementsChart({
  playerAchievements,
  playersBySteamId,
}: {
  playerAchievements: SteamPlayerAchievement[]
  playersBySteamId: Record<string, SteamUser>
}) {
  const {data: currentUser} = useGetCurrentUser()
  const {selectedFriendIds} = useSelectedFriends()
  const currentUserId = currentUser?.steamId
  const data = useMemo<ChartData[]>(() => {
    const countsByPlayerId: Record<string, number> = {}
    for (const steamId of Object.keys(playersBySteamId)) {
      if (steamId === currentUserId || selectedFriendIds.has(steamId)) {
        countsByPlayerId[steamId] = 0
      }
    }
    for (const playerAchievement of playerAchievements) {
      const steamId = playerAchievement.steamId
      if (steamId === currentUserId || selectedFriendIds.has(steamId)) {
        countsByPlayerId[steamId] = (countsByPlayerId[steamId] || 0) + (playerAchievement.unlocked ? 1 : 0)
      }
    }
    return Object.entries(countsByPlayerId).map(([steamId, unlockCount]) => {
      const player = playersBySteamId[steamId]
      return {
        steamId,
        'Total unlocked': unlockCount,
        playerName: player?.name || steamId,
        avatarUrl: player?.avatarUrl,
      }
    }).filter(d => d)
  }, [currentUserId, playerAchievements, playersBySteamId, selectedFriendIds])

  return (
    <BarChart
      style={{width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618}}
      margin={{top: 5, right: 0, left: 0, bottom: 15}}
      data={data}
      responsive
    >
      <XAxis
        dataKey="playerName"
        tick={({x, y, payload: {value}}) => {
          const avatarUrl = value ? data.find(item => item.playerName === value)?.avatarUrl : ''
          return (
            <g transform={`translate(${x},${y})`}>
              {avatarUrl ? (
                <foreignObject x={-15} y={0} width={30} height={30}>
                  <Avatar src={avatarUrl} alt={value} />
                </foreignObject>
              ) : (
                <text x={0} y={35} textAnchor="middle" fill="#666" fontSize={12}>
                  {value}
                </text>
              )}
            </g>
          )
        }}
        interval={0}
      />
      <YAxis width="auto" />
      <Tooltip />
      <Bar dataKey="Total unlocked" fill="#8884d8" radius={[10, 10, 0, 0]} />
    </BarChart>
  )
}
