import React from 'react'
import PlayerSummary from '../models/PlayerSummary'
import { Avatar, IconButton, Box, Link, Text } from '@primer/react'
import { ArrowLeftIcon } from '@primer/octicons-react'

interface Props {
  steamUsername: string;
  playerSummary: PlayerSummary | null;
  onUsernameChange(newUsername: string): void;
}

const SteamUserPageHeader = ({ playerSummary, steamUsername, onUsernameChange }: Props) => {
  const profileUrl = playerSummary ? playerSummary.profileurl : 'https://steamcommunity.com/id/' +
    encodeURIComponent(steamUsername) + '/'

  const clearSteamUsername = (event: React.MouseEvent) => {
    event.preventDefault();
    onUsernameChange('')
  }

  return <Box display="flex" as="h1" alignItems="center">
    <IconButton
      variant="invisible"
      type="button"
      sx={{ mr: 2 }}
      icon={ArrowLeftIcon}
      aria-label="Clear Steam username"
      onClick={(e: any) => clearSteamUsername(e)} />
    Steam
    <Text color="fg.subtle" fontWeight="normal" sx={{ ml: 2 }}> /</Text>
    {playerSummary ? <Link sx={{ display: 'flex', alignItems: 'center' }} href={profileUrl} rel="noreferrer" target="_blank">
      <Avatar size={48} sx={{ mx: 2 }} src={playerSummary.avatarmedium} alt={playerSummary.steamid} />
      <span>{playerSummary.personaname}</span> {playerSummary.realname && <Text fontWeight="normal" sx={{ ml: 2 }}> {playerSummary.realname}</Text>}
    </Link> : <Link sx={{ ml: 2 }} href={profileUrl} rel="noreferrer" target="_blank">{steamUsername}</Link>}
  </Box>
}

export default SteamUserPageHeader
