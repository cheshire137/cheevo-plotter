import PlayerListItem from './PlayerListItem'
import type {SteamGame, SteamUser} from '../types'

const PlayersList = ({
  players,
  game,
  onPlayerUnlockedAchievementsLoaded,
  currentSteamID,
  onUsernameChange,
}: {
  players: SteamUser[]
  currentSteamID: string
  game: SteamGame
  onUsernameChange(username: string, steamID?: string): void
  onPlayerUnlockedAchievementsLoaded(steamID: string, unlockedAchievementKeys: string[]): void
}) => (
  <div>
    <span>Comparing:</span>
    <ul>
      {players.map(player => (
        <PlayerListItem
          game={game}
          onUsernameChange={onUsernameChange}
          key={player.steamId}
          steamID={player.steamId}
          playerSummary={player}
          onUnlockedAchievementsLoaded={unlockedAchievements =>
            onPlayerUnlockedAchievementsLoaded(
              player.steamId,
              unlockedAchievements.map(a => a.key)
            )
          }
          isCurrent={currentSteamID === player.steamId}
        />
      ))}
    </ul>
  </div>
)

export default PlayersList
