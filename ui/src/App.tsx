import {type PropsWithChildren, useCallback, useMemo, useState} from 'react'
import {BaseStyles, Heading, PageLayout, Spinner, ThemeProvider} from '@primer/react'
import {useSearchParams} from 'react-router-dom'
import {useGetGames} from './queries/use-get-games'
import '@primer/primitives/dist/css/functional/themes/light.css'
import '@primer/primitives/dist/css/primitives.css'
import './App.css'
import {AchievementsList} from './components/AchievementsList'
import {OwnedGamesList} from './components/OwnedGamesList'
import {useGetFriends} from './queries/use-get-friends'
import {AppHeader} from './components/AppHeader'

function App() {
  const {data: ownedGames, isPending: isOwnedGamesPending} = useGetGames()
  const [searchParams, setSearchParams] = useSearchParams()
  const {data: friends, isPending: isFriendsPending} = useGetFriends()
  const [selectedGameId, setSelectedGameId] = useState<string | null>(searchParams.get('appid'))
  const selectedGame = useMemo(
    () => (ownedGames && selectedGameId ? ownedGames?.find(g => g.appId === selectedGameId) : undefined),
    [ownedGames, selectedGameId]
  )
  const selectGame = useCallback(
    (appId: string) => {
      setSelectedGameId(appId)
      setSearchParams({appid: appId})
    },
    [setSearchParams]
  )

  return (
    <ProviderStack>
      <PageLayout>
        <PageLayout.Header>
          <AppHeader />
        </PageLayout.Header>
        <PageLayout.Pane aria-label="Owned games" position="start" sticky>
          {isOwnedGamesPending && <Spinner />}
          {ownedGames && (
            <>
              <Heading as="h2">Owned games</Heading>
              <OwnedGamesList ownedGames={ownedGames} selectedGameId={selectedGameId} selectGame={selectGame} />
            </>
          )}
        </PageLayout.Pane>
        <PageLayout.Content>
          {selectedGameId && selectedGame && <AchievementsList game={selectedGame} />}
        </PageLayout.Content>
        <PageLayout.Pane aria-label="Friends" position="end">
          {isFriendsPending && <Spinner />}
          {friends && (
            <>
              <Heading as="h2">Friends</Heading>
              {friends.map(friend => (
                <div key={friend.id}>{friend.name}</div>
              ))}
            </>
          )}
        </PageLayout.Pane>
      </PageLayout>
    </ProviderStack>
  )
}

function ProviderStack({children}: PropsWithChildren) {
  return (
    <ThemeProvider>
      <BaseStyles>{children}</BaseStyles>
    </ThemeProvider>
  )
}

export default App
