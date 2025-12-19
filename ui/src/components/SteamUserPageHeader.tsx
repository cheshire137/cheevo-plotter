import PlayerSummary from '../models/PlayerSummary'
import {Avatar, Heading, IconButton, Link, Text} from '@primer/react'
import {ArrowLeftIcon} from '@primer/octicons-react'

function SteamUserPageHeader({
  playerSummary,
  steamUsername,
  onUsernameChange,
}: {
  steamUsername: string
  playerSummary: PlayerSummary | null
  onUsernameChange(newUsername: string): void
}) {
  const profileUrl = playerSummary
    ? playerSummary.profileurl
    : 'https://steamcommunity.com/id/' + encodeURIComponent(steamUsername) + '/'

  const clearSteamUsername = (event: React.MouseEvent) => {
    event.preventDefault()
    onUsernameChange('')
  }

  return (
    <Heading className="steam-user-page-heading" as="h1">
      <IconButton
        variant="invisible"
        type="button"
        sx={{mr: 2}}
        icon={ArrowLeftIcon}
        aria-label="Clear Steam username"
        onClick={(e: any) => clearSteamUsername(e)}
      />
      Steam
      <Text color="fg.subtle" fontWeight="normal" sx={{ml: 2}}>
        {' '}
        /
      </Text>
      {playerSummary ? (
        <Link sx={{display: 'flex', alignItems: 'center'}} href={profileUrl} rel="noreferrer" target="_blank">
          <Avatar size={48} sx={{mx: 2}} src={playerSummary.avatarmedium} alt={playerSummary.steamid} />
          <span>{playerSummary.personaname}</span>
        </Link>
      ) : (
        <Link sx={{ml: 2}} href={profileUrl} rel="noreferrer" target="_blank">
          {steamUsername}
        </Link>
      )}
    </Heading>
  )
}

export default SteamUserPageHeader
