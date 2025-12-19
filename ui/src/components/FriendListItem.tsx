import {useEffect} from 'react'
import useGetGames from '../hooks/use-get-games'
import Game from '../models/Game'
import {Avatar, Flash, FormControl, Checkbox, Spinner, Text} from '@primer/react'

function FriendListItem({
  onToggle,
  isSelected,
  friendId,
  onFriendGamesLoaded,
}: {
  onToggle(isSelected: boolean): void
  isSelected: boolean
  friendId: string
  onFriendGamesLoaded(steamID: string, games: Game[]): void
}) {
  const {
    games,
    error: gamesError,
    fetching: loadingGames,
  } = useGetGames(isSelected ? friendId : null, friend.playerSummary?.personaname)
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
            {gamesError}
          </Flash>
        )}
      </FormControl.Label>
    </FormControl>
  )
}

export default FriendListItem
