import React, { useEffect } from 'react'
import Friend from '../models/Friend'
import useGetGames from '../hooks/use-get-games'
import Game from '../models/Game'

interface Props {
  onToggle(steamID: string, isChecked: boolean): void;
  isSelected: boolean;
  friend: Friend;
  onFriendGamesLoaded(steamID: string, games: Game[]): void;
}

const FriendListItem = ({ onToggle, isSelected, friend, onFriendGamesLoaded }: Props) => {
  const { games, error: gamesError, fetching: loadingGames } = useGetGames(isSelected ? friend.steamID : null)
  const domId = 'friend-' + friend.steamID

  useEffect(() => {
    if (!loadingGames && games) {
      onFriendGamesLoaded(friend.steamID, games)
    }
  }, [friend.steamID, games, loadingGames, onFriendGamesLoaded])

  return <li>
    <input checked={isSelected} type="checkbox" id={domId}
      onChange={e => onToggle(friend.steamID, e.target.checked)} />
    {friend.playerSummary ? <label htmlFor={domId}>
      <img src={friend.playerSummary.avatarmedium} alt={friend.steamID} />
      <span>{friend.playerSummary.personaname}</span>
    </label> : <label htmlFor={domId}>{friend.steamID}</label>}
    {gamesError && <span>Could not load games</span>}
  </li>
}

export default FriendListItem
