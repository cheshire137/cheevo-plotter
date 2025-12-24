import {Blankslate} from '@primer/react/experimental'
import {TrophyIcon} from '@primer/octicons-react'
import {Heading} from '@primer/react'
import {SelectedFriendsList} from './SelectedFriendsList'
import {useSelectedGame} from '../contexts/selected-game-context'
import {AchievementsList} from './AchievementsList'
import {useGetCurrentUser} from '../queries/use-get-current-user'

export function SelectedGameDisplay() {
  const {selectedGame} = useSelectedGame()
  const {data: currentUser} = useGetCurrentUser()

  if (!currentUser) return null
  if (!selectedGame) {
    return (
      <Blankslate>
        <Blankslate.Visual>
          <TrophyIcon size="medium" />
        </Blankslate.Visual>
        <Blankslate.Heading>Select a game to see achievements</Blankslate.Heading>
      </Blankslate>
    )
  }

  return (
    <>
      <Heading as="h2" className="selected-game-name-heading">
        {selectedGame.name}
      </Heading>
      <SelectedFriendsList />
      <AchievementsList />
    </>
  )
}
