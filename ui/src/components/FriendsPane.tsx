import {PageLayout, Button, Heading, Spinner} from '@primer/react'
import {useSelectedFriends} from '../contexts/selected-friends-context'
import {useSelectedGame} from '../contexts/selected-game-context'
import {FriendsList} from './FriendsList'
import {useGetFriends} from '../queries/use-get-friends'
import './FriendsPane.css'

export function FriendsPane() {
  const {selectedFriendIds, setSelectedFriendIds} = useSelectedFriends()
  const {selectedGame} = useSelectedGame()
  const {data: friends, isPending: isFriendsPending} = useGetFriends()

  if (!selectedGame) return null
  if (!isFriendsPending && !friends) return null

  return (
    <PageLayout.Pane aria-label="Friends" position="end" divider="line">
      {isFriendsPending && <Spinner />}
      {friends && (
        <>
          <Heading as="h2">
            Friends
            <span className="selected-friends-count">
              {selectedFriendIds.size} of {friends.length} selected
            </span>
            {selectedFriendIds.size > 0 && (
              <Button
                size="small"
                className="clear-selected-friends"
                variant="invisible"
                onClick={() => setSelectedFriendIds([])}
              >
                Clear
              </Button>
            )}
          </Heading>
          <FriendsList />
        </>
      )}
    </PageLayout.Pane>
  )
}
