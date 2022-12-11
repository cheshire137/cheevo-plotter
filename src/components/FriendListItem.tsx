import React, { useEffect } from 'react'
import Friend from '../models/Friend'
import useGetGames from '../hooks/use-get-games'
import Game from '../models/Game'
import { Avatar, Flash, FormControl, Checkbox, Text } from '@primer/react'

interface Props {
  onToggle(isSelected: boolean): void;
  isSelected: boolean;
  friend: Friend;
  onFriendGamesLoaded(steamID: string, games: Game[]): void;
}

const FriendListItem = ({ onToggle, isSelected, friend, onFriendGamesLoaded }: Props) => {
  const { games, error: gamesError, fetching: loadingGames } = useGetGames(isSelected ? friend.steamID : null, friend.playerSummary?.personaname)
  const domId = 'friend-' + friend.steamID

  useEffect(() => {
    if (!loadingGames && games) {
      onFriendGamesLoaded(friend.steamID, games)
    }
  }, [friend.steamID, games, loadingGames, onFriendGamesLoaded])

  return <FormControl id={domId} sx={{ my: 1, mr: 3, display: 'flex', alignItems: 'center' }}>
    <Checkbox checked={isSelected} type="checkbox" onChange={e => onToggle(e.target.checked)} />
    <FormControl.Label sx={{ display: 'flex', alignItems: 'center' }}>
      {friend.playerSummary ? <>
        <Avatar sx={{ mr: 1 }} src={friend.playerSummary.avatarmedium} alt={friend.steamID} />
        {friend.playerSummary.personaname}
      </> : <>{friend.steamID}</>}
      {!loadingGames && games && <Text color="fg.subtle" fontSize="1" sx={{ ml: 2 }}>
        {games.length} {games.length === 1 ? 'game' : 'games'}
      </Text>}
      {gamesError && <Flash variant="danger" sx={{ ml: 2, fontWeight: 'normal', p: 1, fontSize: 1 }}>{gamesError}</Flash>}
    </FormControl.Label>
  </FormControl>
}

export default FriendListItem
