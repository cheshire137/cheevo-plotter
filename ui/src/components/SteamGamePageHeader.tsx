import {Avatar, IconButton, Link, Text} from '@primer/react'
import {ArrowLeftIcon} from '@primer/octicons-react'
import type {SteamGame, SteamUser} from '../types'

function SteamGamePageHeader({
  game,
  totalAchievements,
  playerSummary,
  steamUsername,
  onGameChange,
}: {
  steamUsername: string
  playerSummary: SteamUser | null
  onGameChange(newGame: SteamGame | null): void
  game: SteamGame
  totalAchievements: number
}) {
  const profileUrl = playerSummary
    ? playerSummary.profileUrl
    : 'https://steamcommunity.com/id/' + encodeURIComponent(steamUsername) + '/'

  const clearSteamGame = (event: React.MouseEvent) => {
    event.preventDefault()
    onGameChange(null)
  }

  return (
    <div display="flex" as="h1" alignItems="center">
      <IconButton
        variant="invisible"
        type="button"
        sx={{mr: 2}}
        icon={ArrowLeftIcon}
        aria-label="Clear Steam game"
        onClick={(e: any) => clearSteamGame(e)}
      />
      Steam
      <Text color="fg.subtle" fontWeight="normal" sx={{ml: 2}}>
        /
      </Text>
      {playerSummary ? (
        <Link sx={{display: 'flex', alignItems: 'center'}} href={profileUrl} rel="noreferrer" target="_blank">
          <Avatar size={48} sx={{mx: 2}} src={playerSummary.avatarUrl} alt={playerSummary.steamId} />
          <span>{playerSummary.name}</span>
        </Link>
      ) : (
        <Link sx={{ml: 2}} href={profileUrl} rel="noreferrer" target="_blank">
          {steamUsername}
        </Link>
      )}
      <Text color="fg.subtle" fontWeight="normal" sx={{mx: 2}}>
        /
      </Text>
      <Link href={game.url} rel="noreferrer" target="_blank">
        {game.iconUri && <Avatar src={game.iconUri} alt={game.name} square />}
        {game.name}
      </Link>
      {totalAchievements > 0 ? (
        <>
          <Text color="fg.subtle" fontWeight="normal" sx={{ml: 2}}>
            {totalAchievements} {totalAchievements === 1 ? 'achievement' : 'achievements'}
          </Text>
        </>
      ) : null}
    </div>
  )
}

export default SteamGamePageHeader
