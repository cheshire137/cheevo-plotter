import {type PropsWithChildren, useCallback, useMemo, useState} from 'react'
import {BaseStyles, Button, Heading, Link, PageLayout, ThemeProvider, Spinner} from '@primer/react'
import {useSearchParams} from 'react-router-dom'
import {useGetCurrentUser} from './queries/use-get-current-user'
import {useGetGames} from './queries/use-get-games'
import '@primer/primitives/dist/css/functional/themes/light.css'
import '@primer/primitives/dist/css/primitives.css'
import './App.css'
import {AchievementsList} from './components/AchievementsList'
import {OwnedGamesList} from './components/OwnedGamesList'
import {useGetFriends} from './queries/use-get-friends'

function App() {
  const {data: currentUser, isPending: isCurrentUserPending} = useGetCurrentUser()
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
          <Heading as="h1">Cheevo plotter</Heading>
          {currentUser ? (
            <>
              Signed in as {currentUser.name}
              <form method="POST" action={`${import.meta.env.VITE_BACKEND_URL}/user/logout`}>
                <Button variant="invisible" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <Link href={`${import.meta.env.VITE_BACKEND_URL}/auth/steam`}>Sign in with Steam</Link>
          )}
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
          {isCurrentUserPending && <Spinner />}
          {selectedGameId && selectedGame && <AchievementsList game={selectedGame} />}
        </PageLayout.Content>
        <PageLayout.Pane aria-label="Friends" position="end">
          {isFriendsPending && <Spinner />}
          {friends && (
            <>
              <Heading as="h2">Friends</Heading>
              {friends.map(friend => (
                <div>{friend.name}</div>
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
