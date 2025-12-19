import {useEffect} from 'react'
import useGetGames from '../hooks/use-get-games'
import {Avatar, Flash, FormControl, Checkbox, Spinner, Text} from '@primer/react'
import type {SteamGame} from '../types'

function FriendListItem({
  onToggle,
  isSelected,
  friendId,
  onFriendGamesLoaded,
}: {
  onToggle(isSelected: boolean): void
  isSelected: boolean
  friendId: string
  onFriendGamesLoaded(steamID: string, games: SteamGame[]): void
}) {
  const {
    data: games,
    error: gamesError,
    isPending: loadingGames,
  } = useGetGames({steamId: isSelected ? friendId : null})
  const domId = 'friend-' + friendId

  useEffect(() => {
    if (!loadingGames && games) {
      onFriendGamesLoaded(friendId, games)
    }
  }, [friendId, games, loadingGames, onFriendGamesLoaded])

  return (
    <FormControl id={domId} sx={{my: 1, mr: 3, display: 'flex', alignItems: 'center'}}>
      <Checkbox checked={isSelected} type="checkbox" onChange={e => onToggle(e.target.checked)} />
      <FormControl.Label sx={{display: 'flex', alignItems: 'center'}}>
        {friend.playerSummary ? (
          <>
            <Avatar sx={{mr: 1}} src={friend.playerSummary.avatarmedium} alt={friendId} />
            {friend.playerSummary.personaname}
          </>
        ) : (
          <Spinner size="small" />
        )}
        {!loadingGames && games && (
          <Text color="fg.subtle" fontSize="1" sx={{ml: 2}}>
            {games.length} {games.length === 1 ? 'game' : 'games'}
          </Text>
        )}
        {gamesError && (
          <Flash variant="danger" sx={{ml: 2, fontWeight: 'normal', p: 1, fontSize: 1}}>
            {gamesError.message}
          </Flash>
        )}
      </FormControl.Label>
    </FormControl>
  )
}

export default FriendListItem
