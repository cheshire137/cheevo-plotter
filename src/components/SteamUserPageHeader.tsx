import React from 'react'
import PlayerSummary from '../models/PlayerSummary'

interface Props {
  steamUsername: string;
  playerSummary: PlayerSummary | null;
  onUsernameChange(newUsername: string): void;
}

const SteamUserPageHeader = ({ playerSummary, steamUsername, onUsernameChange }: Props) => {
  const haveRealName = playerSummary && playerSummary.realname.length > 0
  const profileUrl = playerSummary ? playerSummary.profileurl : 'https://steamcommunity.com/id/' +
    encodeURIComponent(steamUsername) + '/'

  const clearSteamUsername = (event: React.MouseEvent) => {
    event.preventDefault();
    onUsernameChange('')
  }

  return <h1>
    <button onClick={e => clearSteamUsername(e)}>&laquo;</button>
    Steam <span> / </span>
    {playerSummary ? <a href={profileUrl} rel="noreferrer" target="_blank">
      <img src={playerSummary.avatarmedium} alt={playerSummary.steamid} />
      <span> {playerSummary.personaname} </span>
      {haveRealName ? <span>{playerSummary.realname}</span> : null}
    </a> : <a href={profileUrl} rel="noreferrer" target="_blank">{steamUsername}</a>}
  </h1>
}

export default SteamUserPageHeader
